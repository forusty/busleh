var TelegramBot = require('node-telegram-bot-api'),
    http = require('http');
    
var token = '***REMOVED***';
// Setup polling way
// var bot = new TelegramBot(token, {
//     polling: true
// });

// bot.onText(/\/bus_stop (.+)/, function(msg, match) {
//     var chatId = msg.chat.id;
//     var resp = match[1];

//     console.log(resp);

//     /**
//      * HOW TO Make an HTTP Call - GET
//      */
//     // options for GET
//     var options = {
//         host: 'datamall2.mytransport.sg', // here only the domain name
//         port: 80,
//         path: '/ltaodataservice/BusArrival?BusStopID=' + resp, // the rest of the url with parameters if needed
//         method: 'GET',
//         headers: {
//             AccountKey: '***REMOVED***'
//         }
//     };

//     var responseData = "";
//     console.log("Starting Get");
//     // do the GET request
//     var reqGet = http.request(options, function(res) {
//         console.log("statusCode: ", res.statusCode);
//         // uncomment it for header details
//         res.on('data', function(d) {
//             console.info('GET result:\n');
//             responseData += d;
//         });

//         res.on('end', function() {
//             // console.log(req.data);
//             console.log(responseData);
//             responseData = JSON.parse(responseData);
//             var busObj = "";
//             for (var i = 0; i < responseData['Services'].length; i++) {
//                 var bus = responseData['Services'][i];

//                 busObj += "=============================\n"
//                 busObj += "Service Number :" + bus['ServiceNo'] + "\n";
                
//                 // var nextBus = bus['NextBus'];
//                 // console.log(nextBus['EstimatedArrival']);
//                 // console.log(new Date().getTime());
//                 // console.log(new Date().getTime());
//             }
//             // photo can be: a file path, a stream or a Teleram file_id
//             bot.sendMessage(chatId, busObj);
//             console.info('\n\nCall completed');
        
//             // your code here if you want to use the results !
//         });

//     });

//     reqGet.on('error', function(e) {
//         console.error(e);
//     });

//     reqGet.end();
// });

// // Matches /love
// bot.onText(/\/love/, function onLoveText(msg) {
//     const opts = {
//         reply_to_message_id: msg.message_id,
//         reply_markup: JSON.stringify({
//             keyboard: [
//                 ['Yes, you are the bot of my life ❤'],
//                 ['No, sorry there is another one...']
//             ]
//         })
//     };
//     bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
// });