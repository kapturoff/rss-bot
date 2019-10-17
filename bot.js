const Telegraf = require('telegraf')
const SocksProxyAgent = require('socks-proxy-agent')

const bot = new Telegraf(require('./package.json').botToken, {
	telegram: {
		agent: new SocksProxyAgent(
			`socks://${require('./package.json').socks5}`
		),
	},
})

const mongoAdapter = require('./mongo')
const db = mongoAdapter(
	'mongodb://John:Jooohn@localhost:27017/rss-bot-test',
	'rss-bot-test'
)

bot.start(ctx =>
	ctx.reply(
		'Welcome!\n\nIf you want to add new RSS-channel, write: /addchannel [url]\nIf you want to unsub from channel, write /unsub [url]\n\nHave a good one!'
	)
)

bot.command('addchannel', async (ctx) => {
	const url = ctx.message.text.replace(/\/addchannel ?/, '')
	if (url) {
		let subscribed = await db.addUserToFeed(url, ctx.message.chat.id);
		if (subscribed) {
			ctx.reply('👌 ' + url + ' was added to your list!')
		} else {
			ctx.reply('❌ You had already subscribed to ' + url)
		}
	} else {
		ctx.reply('❌ Your message does not cointain an URL!')
	}
})

bot.command('unsub', async (ctx) => {
	const url = ctx.message.text.replace(/\/unsub ?/, '')
	if (url) {
		db.removeUserFromFeed(url, ctx.message.chat.id).then(v => console.log("removed"))
		ctx.reply('🗑 ' + url + ' was removed from your list!')
	} else {
		ctx.reply('❌ Your message does not cointain an URL!')
	}
})

bot.catch(err => {
	console.log('Ooops', err)
})

module.exports = bot
