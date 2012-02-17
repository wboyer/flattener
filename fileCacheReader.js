var fs = require('fs'),
	refreshManager = require('./refreshManager');

var cacheDir = "tmp";

function log (args) {
	console.log("fileCacheReader.js: " + args);
}

var cacheValid = function(headers) {
	return true
}

var getHeaderPath = function(url) {
	return cacheDir + '/' + url + ".header";
}

var getHeaders = function(url) {
	var headerUrl = getHeaderPath(url);
	return {
		"server":"Apache/2.0.63 (Unix) mod_jk/1.2.27",
		"content-length":"20",
		"content-type":"text/html;charset=utf-8",
		"cache-control":"max-age=112",
		"date":"Tue, 17 Jan 2012 17:18:47 GMT",
		"connection":"close"		
	}

}

var read = function(url, res) {

	var clientResponse, cachedResponse, headerUrl;

	if (!url || !res) {
		return false;
	}

	headerUrl = getHeaderPath(url);

	fs.readFile(headerUrl, function (err, data) {

		if (err) { 

			if (err.code == 'ENOENT') {
				refreshManager.add(url, res)

			} else {
				log("other error")
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
exports.getHeaders = getHeaders;

