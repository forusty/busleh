var bot = require('./telegrambot.js'),
    http = require('http'),
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

var busStopLocation = [];

// check user login
var telegramStartup = function () {
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

        telegramBot.onText(/\/list(.+)/, function (msg, match) {
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
            // console.log(msg);

            if (typeof msg.location == 'undefined') {
                telegramBot.sendMessage(chatId, "Please Share your location", {
                    "reply_markup": {
                        "keyboard": [
                            [{
                                "text": "Location",
                                "request_location": true
                            }]
                        ],
                        "resize_keyboard": true
                    }
                });
            }
            else {
                // search for bus around
                var poslat = msg.location.latitude;
                var poslng = msg.location.longitude;

                var keyboard = []
                for (var i = 0; i < busStopLocation.length; i++) {
                    // if this location is within 0.1KM of the user, add it to the list
                    if (distance(poslat, poslng, busStopLocation[i].Latitude, busStopLocation[i].Longitude, "K") <= 0.2) {
                        console.log(busStopLocation[i]);
                        var keyboardText = "";
                        // keyboardText += "Road Name : " + busStopLocation[i].RoadName + "\n";
                        keyboardText += "Bus Stop Name : " + busStopLocation[i].Description+" ";
                        keyboardText += "Bus Stop Code : /list" + busStopLocation[i].BusStopCode;
                        var tempArr = [];
                        tempArr.push({text:keyboardText})
                        keyboard.push(tempArr)
                    }
                }

                // console.log(keyboard);
                telegramBot.sendMessage(chatId, "Please Share your location", {
                    "reply_markup": {
                        "keyboard":keyboard,
                        "resize_keyboard": true
                    }
                });
                // telegramBot.sendVenue(chatId,"1.38710967446608","103.90839913039454","Bus Stop 1","Bust STop 1")
            }


            // if (res.substring(0, 1) !== '/') {
            //     console.log(res);

            //     var resArr = res.split(" ");

            //     console.log(resArr);

            //     if (resArr.length === 2) {
            //         sgBus.getBusByBusStopAndServiceNo(resArr[0], resArr[1], process.env.LTA_API_KEY, function (responseData) {
            //             generateBusObj(responseData, function (busObj) {
            //                 if (busObj !== 'Failed') {
            //                     telegramBot.sendMessage(chatId, busObj, {
            //                         "parse_mode": "Markdown"
            //                     });

            //                     telegramBot.sendMessage(46176991, "Request was done for : Bus Stop - " + resArr[0] + ", Bus Number - " + resArr[1]);
            //                     console.info('\n\nCall completed for all message');
            //                 }
            //             });
            //         })
            //     }
            // }
        });
    }, process.argv[2]);
};

startup(telegramStartup, 0, false);

function startup(callback, count, stop) {
    if (stop) {
        console.log("done");
        callback();
        return;
    }
    else {
        var path;
        if (count == 0) {
            path = "/ltaodataservice/BusStops";
        }
        else {
            path = "/ltaodataservice/BusStops?$skip=" + count;
        }
        console.log("Path : " + path);
        // options for GET
        var options = {
            host: 'datamall2.mytransport.sg', // here only the domain name
            port: 80,
            path: path, // the rest of the url with parameters if needed
            method: 'GET',
            headers: {
                AccountKey: process.env.LTA_API_KEY
            }
        };

        var responseData = "";
        console.log("Starting Get");

        // do the GET request
        var reqGet = http.request(options, function (res) {
            console.log("statusCode: ", res.statusCode);
            // uncomment it for header details
            res.on('data', function (d) {
                // console.info('GET result:\n');
                responseData += d;
            });

            res.on('end', function () {
                // console.log(req.data);
                // console.log(responseData);
                responseData = JSON.parse(responseData);
                busStopLocation = busStopLocation.concat(responseData.value);
                startup(callback, count + responseData.value.length, responseData.value.length == 0);
                // console.log(responseData.value);
            });
        });

        reqGet.on('error', function (e) {
            console.error(e);
        });

        reqGet.end();
    }
}

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
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
