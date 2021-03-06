//## HN Comment Backup ###
const _ = require('underscore')
const async = require('async')
const fs = require('fs-extra')

//Make a config file (./config/local.json to override)
const config = require('config')
const user = config.get('user')
const minDelay = config.get('min_delay')
const maxDelay = config.get('max_delay')

const outputDir = process.cwd() + '/output/' + user

if(fs.existsSync(outputDir)) fs.removeSync(outputDir)
//^ delete if existing, otherwise website-scraper errs

var baseRequestDelay = 0
//delay plugin for website-scraper
class delayPlugin {
	apply(registerAction) {
    registerAction('beforeRequest', async ({ resource, requestOptions }) => {
      const randomDelay = Math.round( _.random(minDelay, maxDelay))
      baseRequestDelay = (baseRequestDelay * 0.01) + randomDelay //< update the base delay with the new random delay:
      console.log('waiting ' + baseRequestDelay + ' milliseconds...')
    	await new Promise((resolve) => setTimeout(() => {
    	  console.log('download ' + resource.url)
        resolve()
      }, baseRequestDelay))
    	return { requestOptions }
    })
	}
}

const cheerio = require('cheerio')

class renameFilePlugin {
  apply(registerAction) {
    registerAction('onResourceSaved', async ({ resource }) => {
      if(resource.filename.search('.html') === -1 ) return
      //rename the file based on sequence....
      //because this event does not happen in a predictable order,
      //we cross reference the resource URL with commentPageURLs to get the original index
      let index = _.indexOf( commentPageURLs, resource.url )
      let pageName = index > 0 ? `page_${index}.html` : `index.html`
      let nextPageName
      if(  index !== commentPageURLs.length ) nextPageName = `page_${index + 1}.html`
      fs.moveSync( outputDir + '/' + resource.filename ,
                 `${outputDir}/${pageName}`)

      //update the 'More' link to link to the next file:
      if(nextPageName) {
        let html = fs.readFileSync( `${outputDir}/${pageName}`, 'utf8' )
        let $ = cheerio.load( html  )
        $('.morelink').attr('href', nextPageName)
        fs.writeFileSync( `${outputDir}/${pageName}`, $.html() )
      }
    })
  }
}

//There is a "More" link on each page with a URL parameter called 'next' that we need to get in order to build an index of all  pages of the user's comments
var commentPageURLs = ['https://news.ycombinator.com/threads?id=' + user]


const scrape = require('website-scraper')
const options = {
  urls: commentPageURLs,
  directory: outputDir,
  plugins: [ new delayPlugin(), new renameFilePlugin() ]
}

const scrapePages = () => {
  console.log('scrape all pages...')
  scrape(options, (err, result) => {
  	if(err) return console.log(err)
    console.log('all done! backup written to: ')
    console.log(process.cwd() + '/output')
  })
}


//Puppeteer which will crawl news.ycombinator.com:
const puppeteer = require('puppeteer')
let page

const clickMoreLink = async () => {
  await new Promise(r => setTimeout(r, _.random(minDelay, maxDelay)))
  let more = true
  try {
    await page.click('.morelink')
  } catch (err) {
    console.log(err)
    if( err.toString() === "Error: No node found for selector: .morelink" ) {
      console.log(`retreived all comment page URLs! (${commentPageURLs.length} pages)`)
      more = false 
      scrapePages()
    }
  }
  if(!more) return 
  let locationHref  = await page.evaluate(() => location.href)

  commentPageURLs.push(locationHref)
  if(_.isEmpty(commentPageURLs)) return console.log('done')

  clickMoreLink()
}

//go!
console.log('building list of comment page URLs...')
console.log(commentPageURLs[0]); 

(async function() {
  const browser = await puppeteer.launch( {headless: false, defaultViewport: null } )
  //perform the initialization; start on user's comment page 1:
  page = await browser.newPage()
  await page.goto('https://news.ycombinator.com/threads?id=' + config.get('user'), {waitUntil: 'networkidle2'})  
  
  clickMoreLink()
}())
