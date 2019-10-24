const checkRSS = require('./checkRSS')
const Extra = require('telegraf/extra')

module.exports = function(bot, db, lastParsingTime) {
	return async function() {
		let feedNames = await db.getFeeds()
		let updatedItems = await checkRSS(lastParsingTime, feedNames) // gets only new items from feed

		updatedItems
			.reverse(/*sorts from oldest to newest*/)
			.map(async item => {
				const feedListeners = await db.getFeedListeners(item.url)

				feedListeners.map(id => {
					// iterates every ID of listener of the feed and sends messages to them

					if (item.error) {
						bot.telegram.sendMessage(
							id,
							`❌ ${item.url} is broken! \nAre you sure that you'd subscribed to the working URL?`
						)
						return null
					}

					try {
						bot.telegram.sendMessage(
							id,
							`<b>Title: </b>${item.title}\n<b>From: </b>${item.url}\n\n<i>Description: </i>${item.contentSnippet}...\n\n${item.link}`,
							Extra.HTML()
						)
					} catch (e) {
						console.log(e) // todo: create logger for errors and handle case when user blocks the bot
					}
				})
			})

		lastParsingTime = Date.now()
	}
}
