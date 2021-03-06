var exec = require('child_process').exec;
var http = require('http');

var origin = require('./track.js');

var app = require('../server.js');

var refreshManager = require('../refreshManager.js');
var fileCacheWriter = require('../fileCacheWriter.js');
var httpReader = require('../httpReader.js');


httpReader.setOrigin("localhost");
httpReader.setPort(9200);

var curl10 = function() {


// testing that multple requests for the same url don't hit the origin server more than once.
// 1. remove the test file from cache
// 2. curl 10 times before the a response happens (test server should have a mode where its delayed a certain amount of time, but maybe another way is to return after a certain number of responses.
// 3. verify that the origin server only delivers once

fileCacheWriter.rm("/tmp/foo/");
	var g;
	
	for (var i = 0; i < 10; i++) {
		g = function() {
	
			var j = i;
			
			console.log("Curl " + j);
			
			exec('curl localhost:9100/foo/bar2ddd3d.jhtml -s', function(error, stout, stderr) {
				console.log(stout)
			})
		}();
	}
}

app.server.on("listening", curl10)

/* disabled until i can get the writerUrls to be stubbed responses */
/** testing **/

if (process.argv[2] == "test") {

	var fakeReq = function() {
		
		
		
		
		return {}
		
		
	}

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



