var TelegramBot = require('node-telegram-bot-api'),
    https = require('https');
var token = '***REMOVED***';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

bot.onText(/\/busStop (.+)/, function(msg, match) {
  var chatId = msg.chat.id;
  var resp = match[1];
  
  /**
  * HOW TO Make an HTTP Call - GET
  */
  // options for GET
  var options = {
    host : 'http://datamall2.mytransport.sg', // here only the domain name
    port: 80,
    path : '/ltaodataservice/BusArrival?BusStopID='+resp', // the rest of the url with parameters if needed
    method: 'GET',
    headers: {
      'AccountKey': 'vHGF3vL5ShOQZ4iknswCqQ',
    }
  };

  var responseData="";
  // do the GET request
  var reqGet = https.request(options, function(res) {
      // uncomment it for header details
      res.on('data', function(d) {
          console.info('GET result:\n');
          responseData = d;
          console.info('\n\nCall completed');
      });

  });

  reqGet.on('error', function(e) {
      console.error(e);
  });

  reqGet.end();

  var busObj = "";
  for(var i = 0;i<responseData['Services'].length;i++)
  {
    var bus = responseData['Services'][i];

    busObj.="============================="
    busObj.="Service Number :"+bus['ServiceNo']+"\n";
  }
  // photo can be: a file path, a stream or a Teleram file_id
  bot.sendMessage(chatId,busObj);
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