var bot = require('./telegrambot.js'),
    sgBus = require('./sgBus.js');

var seatLoads = {
    "SEA": { "text": "Seats Available", "emoji": "\u{1F604}" },
    "SDA": { "text": "Standing Available", "emoji": "\u{1F605}" },
    "LSD": { "text": "Limited Standing", "emoji": "\u{1F630}" },
    "UNKNOWN": { "text": "Unknown", "emoji": "\u{1F914}" }
};

var busType = {
    "SD": "Single Deck",
    "DD": "Double Deck",
    "BD": "Bendy"
};

// check user login
bot.getBot(function (telegramBot) {
    telegramBot.onText(/\/help/, function (msg) {
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

    telegramBot.onText(/\/list (.+)/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = match[1];

        console.log(resp);
        sgBus.getBusByBusStop(resp, process.env.LTA_API_KEY, function (responseData) {
            generateBusObj(responseData, function (busObj) {
                if (busObj !== 'Failed') {
                    console.log(busObj);
                    telegramBot.sendMessage(chatId, busObj, {
                        "parse_mode": "Markdown"
                    });

                    telegramBot.sendMessage(46176991, "Request was done for bus stop : " + resp);
                    console.info('\n\nCall completed for /list');
                }
            });
        })
    });

    telegramBot.on("message", function (msg) {
        var chatId = msg.chat.id;
        var res = msg.text;
        console.log(res);

        if (res.substring(0, 1) !== '/') {
            console.log(res);

            var resArr = res.split(" ");

            console.log(resArr);

            if (resArr.length === 2) {
                sgBus.getBusByBusStopAndServiceNo(resArr[0], resArr[1], process.env.LTA_API_KEY, function (responseData) {
                    generateBusObj(responseData, function (busObj) {
                        if (busObj !== 'Failed') {
                            telegramBot.sendMessage(chatId, busObj, {
                                "parse_mode": "Markdown"
                            });
    
                            telegramBot.sendMessage(46176991, "Request was done for : Bus Stop - " + resArr[0] + ", Bus Number - " + resArr[1]);
                            console.info('\n\nCall completed for all message');
                        }
                    });
                })
            }
        }
    });
}, process.argv[2]);

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
            busObj += "\n";
        }
    } else {
        busObj = "Invalid Bus Number / Bus Not in Service";
    }
    callBack(busObj);
}

function returnBusObj(nextBus) {
    var busObj = "Next Bus : ";
    if (nextBus['EstimatedArrival'] !== "") {
        minutes = timeDiff(new Date().getTime(), new Date(nextBus['EstimatedArrival']).getTime())
        busObj += minutes <= 1 ? "Arr" : minutes + " minutes";
        busObj += " (" + seatLoads[nextBus['Load']].text + " " + seatLoads[nextBus['Load']].emoji + ")\n";
        busObj += "Type : " + busType[nextBus['Type']] + "\n\n";
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
