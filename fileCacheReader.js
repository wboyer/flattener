var http = require('http'),
	fs = require('fs'),
	refreshManager = require('./refreshManager');

var cacheDir = "tmp";

function log (args) {
	console.log("fileCacheReader.js: " + args);
}


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
		
			log("request from origin")

			refreshManager.add(url, res)

		} else {

			log("deliver from cache")
			
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



/** testing **/

if (process.argv[2] == "test") {


	var assert = require("assert");
	log("running tests");
	
	var tests = {
		"test check() returns 'EONENT' when file  doesn't exist": function() {
			check(__dirname + "/foo/bar", function(res){
				assert.equal(res, "ENOENT", "file doesn't exist")
			});
		},

		"test check() returns data when file  doesn't exist": function() {
			check(__dirname + "/tests/test.txt", function(res){
				assert.equal(res, "test", "file does exist")
			});
		}		
	}

	for (key in tests) {
		log(key);
		tests[key]();
	}

																																																																																																																																																																																																																																																																																																																																																																																																																									
}
