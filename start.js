var bot = require('./telegrambot.js'),
    http = require('http');

// check user login
bot.getBot(function(telegramBot) {
    telegramBot.onText(/\/help/, function(msg) {
        var chatId = msg.chat.id;

        var help = "SG Bus Leh Telegram Bot\n\n";
        help += "/list <bus stop number> - Get a list of bus at bus stop number with their arrival timings. eg. /list 22341 \n\n";
        help += "<bus stop number> <bus number> - Get specified bus at the bus stop. eg.22341 242 \n\n";
        help += "Future enhancement - /send_location to get bus stop number and bus at given gps location\n";

        console.log(help);
        console.log(msg.text);
        telegramBot.sendMessage(chatId, help);
        console.info('Call completed for /help\n');
    });

    telegramBot.onText(/\/list (.+)/, function(msg, match) {
        var chatId = msg.chat.id;
        var resp = match[1];

        console.log(resp);

        sgBus(resp, function(busObj) {
            if (busObj !== 'Failed') {
                // photo can be: a file path, a stream or a Teleram file_id
                telegramBot.sendMessage(chatId, busObj, {
                    "parse_mode": "Markdown"
                });

                telegramBot.sendMessage(46176991,"Request was done for bus stop : "+resp);
                console.info('\n\nCall completed for /list');
            }
        });
    });

    telegramBot.on("message", function(msg) {
        var chatId = msg.chat.id;
        var res = msg.text;
        console.log(res);

        if (res.substring(0, 1) !== '/') {
            console.log(res);

            var resArr = res.split(" ");

            console.log(resArr);

            if (resArr.length === 2) {
                sgBus(resArr[0], function(busObj) {
                    if (busObj !== 'Failed') {
                        // photo can be: a file path, a stream or a Teleram file_id
                        telegramBot.sendMessage(chatId, busObj, {
                            "parse_mode": "Markdown"
                        });

                        telegramBot.sendMessage(46176991,"Request was done for : Bus Stop - "+resArr[0]+", Bus Number - "+resArr[1]);
                        console.info('\n\nCall completed for all message');
                    }
                }, resArr[1]);
            }
        }
    });
}, process.argv[2]);

function sgBus(busStopID, callBack, serviceNo) {
    if (isNaN(busStopID) ||
        (typeof serviceNo !== 'undefined' && isNaN(serviceNo))) {
        callBack("Failed");
    } else {
        var path = "/ltaodataservice/BusArrivalv2";
        if (typeof busStopID !== "undefined") {
            path += '?BusStopCode=' + busStopID;

            if (typeof serviceNo !== "undefined") {
                path += '&ServiceNo=' + serviceNo;
            }
        }
        console.log("Path : " + path);
        // options for GET
        var options = {
            host: 'datamall2.mytransport.sg', // here only the domain name
            port: 80,
            path: path, // the rest of the url with parameters if needed
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
                generateBusObj(responseData, callBack);
            });
        });

        reqGet.on('error', function(e) {
            console.error(e);
        });

        reqGet.end();
    }
}

function generateBusObj(responseData, callBack) {
    var busObj = "";
    if (responseData['Services'].length > 0) {
        for (var i = 0; i < responseData['Services'].length; i++) {
            var bus = responseData['Services'][i];
            busObj += "*Service Number : " + bus['ServiceNo'] + "*\n";
            busObj += "=============================\n"
                // first bus
                var nextBus = bus['NextBus'];
                busObj += returnBusObj(bus['NextBus']);
                busObj += returnBusObj(bus['NextBus2']);
                busObj += returnBusObj(bus['NextBus3']);
                // var minutes = timeDiff(new Date().getTime(), new Date(nextBus['EstimatedArrival']).getTime())
                // busObj += "Next Bus : ";
                // busObj += minutes <= 1 ? "Arr\n" : minutes + " minutes\n";
                // busObj += " ( " + nextBus['Load'] + " " + returnEmoji(nextBus['Load']) + " )\n";

                // second bus
                // nextBus = bus['SubsequentBus'];
                // minutes = timeDiff(new Date().getTime(), new Date(nextBus['EstimatedArrival']).getTime())
                // busObj += "Next Bus : ";
                // busObj += minutes <= 1 ? "Arr\n" : minutes + " minutes\n";
                // busObj += " ( " + nextBus['Load'] + " " + returnEmoji(nextBus['Load']) + " )\n";

                // third bus
                // nextBus = bus['SubsequentBus3'];
                // minutes = timeDiff(new Date().getTime(), new Date(nextBus['EstimatedArrival']).getTime())
                // busObj += "Next Bus : ";
                // busObj += minutes <= 1 ? "Arr\n" : minutes + " minutes\n";
                // busObj += " ( " + nextBus['Load'] + " " + returnEmoji(nextBus['Load']) + " )\n";
            busObj += "\n";
        }
    } else {
        busObj = "Invalid Bus Number / Bus Not in Service";
    }
    callBack(busObj);
}

function returnEmoji(load) {
    var emoji = "\u{1F914}";
    if (load === 'Seats Available') {
        emoji = "\u{1F604}";
    } else if (load === 'Standing Available') {
        emoji = "\u{1F605}";
    } else if (load === 'Limited Standing') {
        emoji = "\u{1F630}";
    }
    return emoji;
}

function returnBusType(type) {
    var typeText = "Unknown";
    if (type === 'SD') {
        typeText = "Single Deck"
    } else if (type === 'DD') {
        typeText = "Double Deck"
    } else if (type === 'BD') {
        typeText = "Bendy"
    }
    return typeText;
}

function convertTerms(term)
{
    if(term==='SEA')
    {
        return "Seats Available";
    }
    else if(term==='SDA')
    {
        return "Standing Available";
    }
    else if(term==='LSD')
    {
        return "Limited Standing";
    }
    else
    {
        return "Unknown Load";
    }
}

function returnBusObj(nextBus) {
    var busObj = "Next Bus : ";
    if (nextBus['EstimatedArrival'] !== "") {
        minutes = timeDiff(new Date().getTime(), new Date(nextBus['EstimatedArrival']).getTime())
        busObj += minutes <= 1 ? "Arr" : minutes + " minutes";
        nextBus['Load'] = convertTerms(nextBus['Load']);
        busObj += " (" + nextBus['Load'] + " " + returnEmoji(nextBus['Load']) + ")\n";
        busObj += "Type : " + returnBusType(nextBus['Type']) + "\n\n";
    } else {
        busObj += "No Bus\n";
    }
    return busObj;
}

function timeDiff(NowMili, busMili) {
    var diff = busMili - NowMili;
    if (diff <= 0) {
        diff = 0;
    } else {
        diff = diff / 1000 / 60
    }
    return Math.floor(diff);
}
