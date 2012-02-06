var http = require('http'),
	fs = require('fs'),
	refreshManager = require('./refreshManager');

var cacheDir = "tmp";

function log (args) {
	console.log("fileCacheReader.js: " + args);
}

var cacheValid = function(headers) {
	return true
}

var read = function(url, res) {

	var clientResponse, cachedResponse, headerUrl;

	if (!url || !res) {
		return false;
	}

	headerUrl = cacheDir + '/' + url + ".header";

	fs.readFile(headerUrl, function (err, data) {

		if (err) { 

			if (err.code == 'ENOENT') {
				refreshManager.add(url, res)

			} else {

				//other error

			}

		} else {
			
			clientResponse = JSON.parse(data);

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

