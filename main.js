const config = require('./botConfig.json')
const mongoAdapter = require('./mongo')
const bot = require('./bot')
const messageSender = require('./messageSender')

let lastParsingTime = 1571330786279

const db = mongoAdapter(config.mongoURL, config.dbName)

const mainInterval = setInterval(
	messageSender(bot, db, lastParsingTime),
	config.intervalTime
)

bot.launch()

// TODO:

// bot.telegram.setWebhook('https://server.tld:8443/secret-path')

// const app = new Koa()
// app.use(koaBody())
// app.use((ctx, next) => (ctx.method === 'POST' || ctx.url === '/secret-path')
//   ? bot.handleUpdate(ctx.request.body, ctx.response)
//   : next()
// )
// app.listen(3000)
