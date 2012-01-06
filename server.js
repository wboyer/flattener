var http = require('http');
var fileCacheWriter = require('./fileCacheWriter');
var refreshManager = require('./refreshManager');
var fileCacheReader = require('./fileCacheReader');
var origin = require('./tests/track');

var port = 9100;

/* this is the main server that handles all requests.
   needs to check the file cache, pass through request to origin
   and stuff.
      - should canonicalize the requested url
*/

http.createServer(function (req, res) {

 if (req.url == "/checkQueue") {

 	refreshManager.checkQueue();

 } else {
	console.log("Server:  " + req.url)
	fileCacheReader.read(req.url, res)
	
}

}).listen(port, "0.0.0.0");




/** testing **/

if (process.argv[2] == "test") {

	var assert = require("assert");
	
	
	var test;
	var urls = ["/url1", "/url2", "/url3", "/url2", "/url4", "/url2", "/url5", "/url1", "/url2", "/url6", "/url5", "/url5"];
	var writerUrls = [0,0,0,0,0,0,1,0,0,0, 1, 1]
	var sorted = ["/url5", "/url2", "/url1", "/url3", "/url4", "/url6"]
	
	
	urls.forEach(function(ele, ind, arr) {
		refreshManager.add(ele, writerUrls[ind]);
	})
	
	/** test sorting function **/
		console.log("\n Sorting test")
	
	while (test = refreshManager.next().url) {
		val = sorted.shift();
		console.log(test + ", " + val)
		assert.equal(test, val, "Should be " + val + ", was " + test)
		refreshManager.requestDone(test);
	}
	
	
	/*
		test...
	
	*/
	console.log("\n Waiting test")
	
	urls.forEach(function(ele, ind, arr) {
	
		if (writerUrls[ind]) {
			console.log("get " + ele)
			http.get({
				"port":9100,
				"path": ele
			});
			
		} else {
		
			refreshManager.add(ele);
	
		}
		
	})
	
	
	setTimeout(function() {
				while (refreshManager._queue.length > 0) {
					refreshManager.checkQueue();
				}
				console.log(refreshManager._map)
	
				refreshManager._map = {}
				console.log(refreshManager._map)
	
	}, 5000);
}