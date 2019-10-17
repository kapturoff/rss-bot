const config = require('./package.json')
const mongoAdapter = require('./mongo')
const bot = require('./bot')
const rssWatcher = require('./rssWatcher')

let lastParsingTime = 1571330786279

const db = mongoAdapter(config.url, config.dbName)

const mainInterval = setInterval(
	rssWatcher(bot, db, lastParsingTime),
	config.intervalTime
) // every 30 minutes

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
