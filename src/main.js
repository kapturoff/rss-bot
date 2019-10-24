import config from '../botConfig.json'
import mongoAdapter from './helpers/mongo'
import messageSender from './helpers/messageSender'
import bot from './helpers/bot'

const lastParsingTime = Date.now() - 86400000

const db = mongoAdapter(config.mongoURL, config.dbName)

const mainInterval = setInterval(
	messageSender(bot, db, lastParsingTime),
	config.intervalTime
)

bot.launch()

// bot.telegram.setWebhook('https://server.tld:8443/secret-path')

// const app = new Koa()
// app.use(koaBody())
// app.use((ctx, next) => (ctx.method === 'POST' || ctx.url === '/secret-path')
//   ? bot.handleUpdate(ctx.request.body, ctx.response)
//   : next()
// )
// app.listen(3000)
