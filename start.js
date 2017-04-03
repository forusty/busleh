var TelegramBot = require('node-telegram-bot-api'),
    http = require('http');

var token = '***REMOVED***';
// Setup polling way
var bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/bus_stop (.+)/, function(msg, match) {
    var chatId = msg.chat.id;
    var resp = match[1];

    console.log(resp);

    /**
     * HOW TO Make an HTTP Call - GET
     */
    // options for GET
    var options = {
        host: 'datamall2.mytransport.sg', // here only the domain name
        port: 80,
        path: '/ltaodataservice/BusArrival?BusStopID=' + resp, // the rest of the url with parameters if needed
        method: 'GET',
        headers: {
            AccountKey: '***REMOVED***'
        }
    };

    var responseData = "";
    console.log("Starting Get");
    // do the GET request
    var reqGet = http.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        // uncomment it for header details
        res.on('data', function(d) {
            console.info('GET result:\n');
            responseData += d;
        });

        res.on('end', function() {
            // console.log(req.data);
            console.log(responseData);
            responseData = JSON.parse(responseData);
            if(responseData['Services'].length>0)
            {
            var busObj = "";
            for (var i = 0; i < responseData['Services'].length; i++) {
                var bus = responseData['Services'][i];

                busObj += "*Service Number : " + bus['ServiceNo'] + "*\n";
                busObj += "=============================\n"

                if (bus['Status'] === 'In Operation') {
                    // first bus
                    var nextBus = bus['NextBus'];
                    var minutes = timeDiff(new Date().getTime(), new Date(nextBus['EstimatedArrival']).getTime())
                    busObj += "Next Bus : ";
                    busObj += minutes<=1 ? "Now " : minutes + " minutes ";
                    busObj += "( "+nextBus['Load']+" )\n";

                    // second bus
                    nextBus = bus['SubsequentBus'];
                    minutes = timeDiff(new Date().getTime(), new Date(nextBus['EstimatedArrival']).getTime())
                    busObj += "Next Bus : ";
                    busObj += minutes<=1 ? "Now " : minutes + " minutes ";
                    busObj += "( "+nextBus['Load']+" )\n";

                    // third bus
                    nextBus = bus['SubsequentBus3'];
                    minutes = timeDiff(new Date().getTime(), new Date(nextBus['EstimatedArrival']).getTime())
                    busObj += "Next Bus : ";
                    busObj += minutes<=1 ? "Now " : minutes + " minutes ";
                    busObj += "( "+nextBus['Load']+" )\n";
                } else {
                    busObj += "Bus not in service\n";
                }
                busObj += "=============================\n"
                busObj+="\n";
            }
            // photo can be: a file path, a stream or a Teleram file_id
            bot.sendMessage(chatId, busObj,{"parse_mode":"Markdown"});
            console.info('\n\nCall completed'); 
            }
            else
            {
            // photo can be: a file path, a stream or a Teleram file_id
            bot.sendMessage(chatId, "UnkNown bus number");
            }

            // your code here if you want to use the results !
        });

    });

    reqGet.on('error', function(e) {
        console.error(e);
    });

    reqGet.end();
});

function timeDiff(NowMili, busMili) {
    var diff = busMili - NowMili;
    if (diff <= 0) {
        diff = 0;
    } else {
        diff = diff / 1000 / 60
    }
    return Math.floor(diff);
}