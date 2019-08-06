//## HN Comment Backup ###
const _ = require('underscore')
const async = require('async')

//Make a config file (./config/local.json to override)
const config = require('config')
const user = config.get('user')


const scrape = require('website-scraper');
const options = {
  urls: ['https://news.ycombinator.com/threads?id=' + user],
  directory: process.cwd() + '/output/' + user
}

const scrapeAllPages = () => {
  console.log('scrape all pages...')
  async.eachSeries(commentPageURLs, (err, callback) => {
    scrape(options, (err, result) => {
    	if(err) return console.log(err)
    	console.log(result)
      setTimeout( callback, 5500 )
    })
  }, (err) => {
    if(err) return console.err(err)
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

//There is a "More" link on each page with a URL parameter called 'next' that we need to get in order to build an index of all  pages of the user's comments
var commentPageURLs = []

const clickMoreLink = () => {
  nightmare
  .wait(5500)
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
      console.log('retreived all comment page URLs...')
      scrapeAllPages()
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
