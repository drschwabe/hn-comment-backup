## HN Comment Backup

Concerned about calls for my HN account to be deleted, I felt compelled to write a backup of my comments just in case.   Then coronavirus happened - and it provoked even more incentive to backup my cloud hosted content. 

I also wanted to view the comments in the context of, well the HN website - so this backup tool also downloads the small amount of CSS and image assets apart of the site to ensure a consistent viewing experience as you browse browse your comment threads offline. 

(HN's API doesn't quite accommodate for this so easily so forgive me for scrapping but it is just easier to do this way)

### Usage

```bash
git clone git@github.com:drschwabe/hn-comment-backup.git
cd hn-comment-backup
npm install 
npm start
# > after scraping/downloading your comments are available in ./output/username
```

### options 
You can change options `./config/default.json` or create a new file named `local.json` to overrwite defaults without causing a .git change.    

**user** : desired user that you wish to download all comments for  

**delay** : change `min_delay` and `max_delay` if your output results in "Sorry, we're not able to serve your requests this quickly.".   More comments the larger min / max delays necessary.  