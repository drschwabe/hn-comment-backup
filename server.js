var express = require('express'), 
    app = express(), 
    fs = require('fs')
    //cheerio = require('cheerio')

app.listen(2984, () => console.log('HN comment backup available at: \nhttp://localhost:2984'))

var nightmare = require('nightmare')


Nightmare = require('nightmare')
var nightmare = new Nightmare({
  show: false, 
  alwaysOnTop : false
})
.on('console', function(type, msg, errorStack) { 
  console.log(msg) 
  if(errorStack) console.log(errorStack)  
}) 

nightmare
.goto('https://news.ycombinator.com/threads?id=mrschwabe')
.wait(1000)
.end()
.evaluate(()=> { 
  //return document.documentElement.outerHTML
  return document.body.outerHTML
})
.then((result) => {
  console.log(result)

  const template = fs.readFileSync('./template.html')

  fs.writeFile('./page.html', template + result + + '</body></html>', 'utf8', (err) => {
    if(err) return console.log(err)
  })

})

//find more link, click it
//if no more link - we done ! 




