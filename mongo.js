const { MongoClient } = require('mongodb')
// const URL = "mongodb://John:Jooohn@localhost:27017/rss-bot-test";

module.exports = function(url, dbName) {
	let mongoClient = () =>
		new MongoClient(url, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})

	return {
		async addUserToFeed(feedName, id) {
			const client = await mongoClient().connect()
			const db = client.db(dbName)
			const feed = db.collection(feedName)
			const alreadySubscribed = (await feed.find({ chat_id: id }).toArray()).length > 0
			if (alreadySubscribed) {
				return null
			} else {
				return feed.insertOne({ chat_id: id })
			}
		},
		async getFeedsNames() {
			const client = await mongoClient().connect()
			const db = client.db(dbName)
			return db.listCollections({}, { nameOnly: true }).toArray()
		},
		async getFeedListeners(feedName) {
			const client = await mongoClient().connect()
			const db = client.db(dbName)
			let feed = db.collection(feedName)
			return feed.find({}).toArray()
		},
		async removeUserFromFeed(feedName, id) {
			const client = await mongoClient().connect()
			const db = client.db(dbName)
			let feed = db.collection(feedName)
			return feed.deleteMany({ chat_id: id })
		},
	}
}
