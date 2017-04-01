var TelegramBot = require('node-telegram-bot-api');

var token = '***REMOVED***';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

bot.onText(/\/busStop (.+)/, function(msg, match) {
  var chatId = msg.chat.id;
  var resp = match[1];
  
  // photo can be: a file path, a stream or a Teleram file_id
  bot.sendMessage(chatId,"You typed Bus number : "+resp);
});

// Matches /love
bot.onText(/\/love/, function onLoveText(msg) {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Yes, you are the bot of my life ❤'],
        ['No, sorry there is another one...']
      ]
    })
  };
  bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
});