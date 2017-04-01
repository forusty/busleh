var TelegramBot = require('node-telegram-bot-api');

var token = '***REMOVED***';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

bot.onText(/\/bus (.+)/, function(msg, match) {
  var chatId = msg.chat.id;
  var resp = match[1];
  
  // photo can be: a file path, a stream or a Teleram file_id
  bot.sendMessage(chatId,"You typed Bus number : "+resp);
});