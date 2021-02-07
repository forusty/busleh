var http = require('http');

var host = "datamall2.mytransport.sg"; // temp set here
 
module.exports = {
    getBusByBusStop: function (busStop,accountKey, callback) {
        var path = getPath(busStop);
        var options = getHTTPOption(host,path,"GET",accountKey);
        executeRequest(options,callback);
    },
    getBusByBusStopAndServiceNo: function (busStop, serviceNo, accountKey, callback) {
        var path = getPath(busStop,serviceNo);
        var options = getHTTPOption(host,path,"GET",accountKey);
        executeRequest(options,callback);
    }
};

function getPath(busStopNo, busNo) {
    var path = "/ltaodataservice/BusArrivalv2";
    if (typeof busStopNo !== "undefined") {
        path += '?BusStopCode=' + busStopNo;

        if (typeof busNo !== "undefined") {
            path += '&ServiceNo=' + busNo;
        }
    }
    console.log("Path : " + path);
    return path;
}

function getHTTPOption(host, path, method, accountKey) {
    // options for GET
    var options = {
        host: host, //'datamall2.mytransport.sg', // here only the domain name
        port: 80,
        path: path, // the rest of the url with parameters if needed
        method: method, //'GET',
        headers: {
            AccountKey: accountKey
        }
    };

    return options;
}

function executeRequest(options,callback) {
    var responseData = "";
    console.log("Starting Get");
    console.log(options);
    // do the GET request
    var reqGet = http.request(options, function (res) {
        console.log("statusCode: ", res.statusCode);
        // uncomment it for header details
        res.on('data', function (d) {
            console.info('GET result:\n');
            responseData += d;
        });

        res.on('end', function () {
            // console.log(req.data);
            console.log(responseData);
            responseData = JSON.parse(responseData);
            callback(responseData);
        });
    });

    reqGet.on('error', function (e) {
        console.error(e);
    });

    reqGet.end();
}