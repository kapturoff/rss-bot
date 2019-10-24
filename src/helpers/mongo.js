import { MongoClient } from 'mongodb'

export default function(url, dbName) {
	let mongoClient = () => new MongoClient(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})

	return {
		async getFeeds() {
			const client = await mongoClient().connect()
			const feeds = client.db(dbName).collection('feeds')

			const activeFeeds = await feeds
				.find({ listeners: { $gt: 0 } })
				.toArray()

			client.close()
			return activeFeeds.map(feed => feed.name)
		},
		async subUserToFeed(feedName, id) {
			let result = null
			const client = await mongoClient().connect()

			const users = client.db(dbName).collection('users')
			const feeds = client.db(dbName).collection('feeds')

			let [feed, user] = await Promise.all([
				feeds.findOne({ name: feedName }),
				users.findOne({ id }),
			])

			if (!user) {
				user = { id, subscribed: [] }
				await users.insertOne(user)
			}

			if (!user.subscribed.includes(feedName)) {
				user.subscribed.push(feedName)
				result = await Promise.all([
					users.updateOne(
						{ id },
						{ $set: { subscribed: user.subscribed } }
					),
					feed
						? feeds.updateOne(
								{ name: feedName },
								{ $set: { listeners: feed.listeners + 1 } }
						  )
						: feeds.insertOne({ name: feedName, listeners: 1 }),
				])
			}

			client.close()
			return result
		},
		async getFeedListeners(feedName) {
			const client = await mongoClient().connect()
			const users = client.db(dbName).collection('users')
			
			const IDsOfFeedListeners = await users
				.find({ subscribed: { $in: [feedName] } })
				.toArray()
			
			client.close()
			return IDsOfFeedListeners.map(u => u.id)
		},
		async unsubUserFromFeed(feedName, id) {
			let result = null
			const client = await mongoClient().connect()

			const users = client.db(dbName).collection('users')
			const feeds = client.db(dbName).collection('feeds')

			let [feed, user] = await Promise.all([
				feeds.findOne({ name: feedName }),
				users.findOne({ id }),
			])

			if (!user) {
				user = { id, subscribed: [] }
				await users.insertOne(user)
			}

			if (user.subscribed.includes(feedName)) {
				result = await Promise.all([
					users.updateOne(
						{ id },
						{
							$set: {
								subscribed: user.subscribed.filter(
									feed => feed !== feedName
								),
							},
						}
					),
					feed
						? feeds.updateOne(
								{ name: feedName },
								{ $set: { listeners: feed.listeners - 1 } }
						  )
						: feeds.insertOne({ name: feedName, listeners: 0 }),
				])
			}

			client.close()
			return result
		},
		async getSubsOfUser(id) {
			const client = await mongoClient().connect()
			const users = client.db(dbName).collection('users')

			const userSubs = await users.findOne({ id })

			client.close()
			return (userSubs.subscribed && userSubs.subscribed.length )
				? userSubs.subscribed
				: []
		},
	}
}
