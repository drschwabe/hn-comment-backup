## HN Comment Backup

Concerned about calls for my HN account to be deleted, I felt compelled to write a backup of my comments just in case.  

I also wanted to view the comments in the context of, well the HN website - so this backup tool is also a server that; after download - will let you browse your comment threads offline. 

(HN's API doesn't quite accommodate for this so easily so forgive me for scrapping but it is just easier to do this way)

### Usage

`
npm install hn-comment-backup
node server
//> HN comment backup available at: http://localhost:2984
`
If you haven't already downloaded, you'll simply get a blank form  for which to fill in your username (then click 'Download' to begin the process) 

If there's already data, it will load the familiar HN site displaying your profile page with all your comments. 

Your comment data are stored in a local PouchDB in the same folder as this app under /db

To update the data with your latest comments just click download again; it will only go as far back as it needs without downloading everything. 





