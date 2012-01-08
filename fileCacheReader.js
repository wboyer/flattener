var http = require('http'),
	fs = require('fs'),
	refreshManager = require('./refreshManager');

var cacheDir = "tmp";

var check = function(url, callback) {
	var result = false;
	
	fs.readFile(url, function (err, data) {

		if (err) { 

			if (err.code == 'ENOENT') {

				result = err.code;  // file does not exist

			} else {

				//other error

			}

		} else {

			result = data;

		}
		
		callback(result);
	});

}

var cacheValid = function(headers) {
	return true
}

var read = function(url, res) {
	var clientResponse, cachedResponse;
	var headerUrl = cacheDir + '/' + url + ".header";

	check(headerUrl, function(result) {

		if (result == 'ENOENT') {
		
			console.log("fileCacheReader request from origin")

			refreshManager.add(url, res)

		} else {

			console.log("fileCacheReader deliver from cache")
			
			clientResponse = JSON.parse(result);

			res.writeHead(+clientResponse.statusCode, clientResponse.headers);
			cachedResponse = fs.createReadStream(cacheDir + '/' + url);
			cachedResponse.pipe(res)				

			// check for cache validity
			
			if (!cacheValid(clientResponse)) {
				refreshManager.add(url)
			}
		
		}

				

	});

}

exports.read = read;

