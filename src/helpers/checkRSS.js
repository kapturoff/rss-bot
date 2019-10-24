import RssParser from 'rss-parser'
const parser = new RssParser()

function pubDateToTimestamp(pubDate) {
	return new Date(pubDate).getTime()
}

function checkRSS(lastParsingTime, urls) {
	return new Promise((resolve, reject) => {
		const parsedFeeds = urls.map(async url => {
			let feed

			try {
				feed = await parser.parseURL(url)
			} catch (e) {
				feed = {
					items: [{ error: true, pubDate: Date.now() }],
				}
			}

			feed.items.map(item => (item.url = url))
			return feed
		})

		Promise.all(parsedFeeds).then(feeds => {
			const itemsMerged = feeds.reduce((acc, feed) => {
				return (acc = [...acc, ...feed.items])
			}, []) // combining items from all feeds

			const updatedItems = itemsMerged.filter(item => {
				// return only new items
				return pubDateToTimestamp(item.pubDate) >= lastParsingTime // true if pubDate is bigger than time of the last parsing iteration
			})

			resolve(updatedItems)
		})
	})
}

export default checkRSS