let parser = new (require('rss-parser'))();

function pubDateToTimestamp(pubDate) {
  return new Date(pubDate).getTime();
}

function checkRSS(lastParsingTime, urls) {
  return new Promise((resolve, reject) => {
    const parsedFeeds = urls.map(async url => {
      const feed = await parser.parseURL(url);
      feed.items.map(item => item.url = url);
      return feed;
    });

    Promise.all(parsedFeeds).then(feeds => {
      const itemsMerged = feeds.reduce((acc, feed) => {
        return acc = [...acc, ...feed.items]
      }, []) // combining items from all feeds
      
      const updatedItems = itemsMerged.filter(item => { // return only new items
        return pubDateToTimestamp(item.pubDate) >= lastParsingTime; // true if pubDate is bigger than time of the last parsing iteration
      });
      
      resolve(updatedItems)
    })
  })
}

module.exports = checkRSS;
