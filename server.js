//## HN Comment Backup ###


//Use config (./default.json or local.json to override)
//for port and user values
const config = require('config')
var port = config.get('port')
var user = config.get('user')

//Start an Express server
const express = require('express')
const app = express()
app.listen(port, () => console.log('HN comment backup available at: \nhttp://localhost:' + port))

//Start Nightmare which will crawl news.ycombinator.com: 
const Nightmare = require('nightmare')
var nightmare = new Nightmare({
  show: false, 
  alwaysOnTop : false
})
.on('console', function(type, msg, errorStack) { 
  console.log(msg) 
  if(errorStack) console.log(errorStack)  
}) 

//Write file after we receive result...
const fs = require('fs')

//go!
console.log('fetching/parsing profile page...') 
nightmare
.goto('https://news.ycombinator.com/threads?id=' + config.get('user'))
.wait(1000)
.end()
.evaluate(()=> document.body.outerHTML)
.then((result) => {
  console.log('result downloaded')
  const template = fs.readFileSync('./template.html')
  fs.writeFile('./page.html', template + result + + '</body></html>', 'utf8', (err) => {
    if(err) return console.log(err)
    console.log('page.html written.')      
  })
})

//find more link, click it
//if no more link - we done ! 
