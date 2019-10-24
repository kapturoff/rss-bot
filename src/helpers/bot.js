// const Telegraf = require('telegraf')
// const SocksProxyAgent = require('socks-proxy-agent')
// const session = require('telegraf/session')
// const Stage = require('telegraf/stage')
// const Scene = require('telegraf/scenes/base')
// const Markup = require('telegraf/markup')
// const Extra = require('telegraf/extra')
// const config = require('./botConfig.json')
// const mongoAdapter = require('./mongo')
import Telegraf from 'telegraf'
import SocksProxyAgent from 'socks-proxy-agent'
import session from 'telegraf/session'
import Stage from 'telegraf/stage'
import Scene from 'telegraf/scenes/base'
import Markup from 'telegraf/markup'
import Extra from 'telegraf/extra'
import config from '../../botConfig.json'
import mongoAdapter from './mongo'

const bot = new Telegraf(
	config.botToken,
	config.useProxy
		? {
				telegram: {
					agent: new SocksProxyAgent(`socks://${config.socks5}`),
				},
		  }
		: {}
)

const stage = new Stage()

const botDB = mongoAdapter(config.mongoURL, config.dbName)

function createMarkupKeyboard(feedNames) {
	const buttons = feedNames.map(feed =>
		Markup.callbackButton(feed, 'unsub-' + feed)
	)
	return Markup.inlineKeyboard(buttons)
}

const addChannelScene = new Scene('addchannel')
addChannelScene.enter(ctx =>
	ctx.replyWithMarkdown(
		"_OK, now you have to send URL of RSS-channel that you want to listen!\nIf you don't want to add channel type /cancel_"
	)
)
addChannelScene.leave(ctx => ctx.reply('👌 Done!'))
addChannelScene.command('cancel', Stage.leave())
addChannelScene.on('text', async ctx => {
	if (ctx.message.text.match(/https?:\/\/.*\..*/)) {
		let subscribed = await botDB.subUserToFeed(
			ctx.message.text,
			ctx.message.chat.id
		)
		ctx.replyWithMarkup(
			subscribed
				? '_You have successfully subscribed to this channel!_'
				: '_OK, but you had already been subscribed to this RSS-channel earlier_'
		)
		Stage.leave()(ctx)
	} else {
		ctx.reply("❌ It wasn't an URL!")
	}
})

stage.command('cancel', Stage.leave())
stage.register(addChannelScene)

bot.use(session())
bot.use(stage.middleware())

bot.start(async ctx => {
	const subscribedChannels = await botDB.getSubsOfUser(ctx.message.chat.id)
	const subsCombined = subscribedChannels.length
		? subscribedChannels.reduce(
				(acc, feedName) => acc + '\n' + feedName,
				'_~ Channels that you listen now: _'
		  )
		: "❌ You didn't subscribe to any channel yet!"
	ctx.replyWithMarkdown(
		'*Welcome!*\n\nThe bot checks out RSS-channels that you subscribed to every 30 minutes and if they have the updates — sends updates to you! \n\nIf you want to subscribe to new RSS-channel, write /addchannel \nIf you want to unsubscribe from channel that you had already been listening, type /unsub\n\n' +
			subsCombined +
			'\n\n_Have a good one!_'
	)
})

bot.command('addchannel', Stage.enter('addchannel'))

bot.command('unsub', async ctx => {
	const subscribedChannels = await botDB.getSubsOfUser(ctx.message.chat.id)

	if (subscribedChannels.length) {
		ctx.replyWithMarkdown(
			'_Tap to the button to unsubscribe._\n~ List of the RSS-channels that you subscribed to:',
			Extra.markup(createMarkupKeyboard(subscribedChannels))
		)
	} else {
		ctx.reply('❌ Your subscribtion list is empty!')
	}
})

bot.on('callback_query', async ctx => {
	if (ctx.callbackQuery && ctx.callbackQuery.data.startsWith('unsub-')) {
		const feedName = ctx.callbackQuery.data.replace('unsub-', '')
		const result = await botDB.unsubUserFromFeed(
			feedName,
			ctx.callbackQuery.message.chat.id
		)

		ctx.reply(
			result
				? '👌 Unsubscribed!'
				: "❌ You've already unsubscribed from that channel!"
		)
	}
})

bot.catch(err => {
	console.log('Ooops', err)
})

export default bot
