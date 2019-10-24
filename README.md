# rss-bot
> Bot which make allow you to read RSS-channels in Telegram!
---

_To create instance of this bot:_
1. Open your terminal and clone this repository using:
```sh
git clone git@github.com:kapturoff/rss-bot.git
```
2. Rebuild files in 'src':
```sh
npm run build
```
3. Open your code editor and add your settings to botConfig.json _(as example: token of your bot, database name, etc...)_
4. Open your terminal again and type the following:
```sh
npm start
```
5. Almost done! Open a dialog with your bot in Telegram and type "/start"!

In default case, bot checks the updates on RSS-channels every 30 minutes. By the way, this parameter might be 
changed by editing field "intervalTime" in botConfig.json

---

_[in development]_
