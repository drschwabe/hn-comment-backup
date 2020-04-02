//## HN Comment Backup ###
const _ = require('underscore')
const async = require('async')

//Make a config file (./config/local.json to override)
const config = require('config')
const user = config.get('user')
const minDelay = config.get('min_delay')
const maxDelay = config.get('max_delay')

//delay plugin for website-scraper
class delayPlugin {
	apply(registerAction) {
    registerAction('beforeRequest', async ({ resource, requestOptions }) => {
      const time = Math.round( _.random(minDelay, maxDelay));
    	await new Promise((resolve) => setTimeout(resolve, time))
    	return { requestOptions }
    });
	}
}

//There is a "More" link on each page with a URL parameter called 'next' that we need to get in order to build an index of all  pages of the user's comments
var commentPageURLs = ['https://news.ycombinator.com/threads?id=' + user]


const scrape = require('website-scraper');
const options = {
  urls: commentPageURLs,
  directory: process.cwd() + '/output/' + user,
  plugins: [ new delayPlugin() ]
}

const scrapePages = () => {
  console.log('scrape all pages...')
  scrape(options, (err, result) => {
  	if(err) return console.log(err)
  	console.log(result)
    console.log('all done! backup written to: ')
    console.log('process.cwd()' + '/output')
  })
}



//Nightmare which will crawl news.ycombinator.com:
const Nightmare = require('nightmare')
var nightmare = new Nightmare({
  show: false,
  alwaysOnTop : false
})



const clickMoreLink = () => {
  nightmare
  .wait(_.random(minDelay, maxDelay))
  .click('.morelink')
  .wait('body')
  .evaluate(()=> location.href)
  .then((result) => {
    console.log(result)
    commentPageURLs.push(result)
    if(_.isEmpty(commentPageURLs)) return console.log('done')
    clickMoreLink()
  })
  .catch((e) => {
    if(e == 'Unable to find element by selector: .morelink') {
      console.log('retreived all comment page URLs!')
      scrapePages()
    } else {
      console.log(e)
    }
  })
}

//go!
console.log('building list of comment page URLs...')

//perform the initialization; start on user's comment page 1:
nightmare
.goto('https://news.ycombinator.com/threads?id=' + config.get('user'))
.wait('body')
.then(() => {
  clickMoreLink()
})
