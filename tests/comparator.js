var http = require('http');

/* this is the main server that handles all requests.
   needs to check the file cache, pass through request to origin
   and stuff.
      - should canonicalize the requested url
*/

http.createServer(function (req, res) {


 if (req.url == "/checkQueue") {

 	refreshManager.checkQueue();

 } else {
	console.log(req.url)
	refreshManager.add(req.url, res)
	
}

}).listen(9100, "0.0.0.0");


var fileCacheReader = function() {

	// check the file system
	// if its there, pipe to response
	//    then check for cache valid
	// if its not send to cache writer, passing req and res

}()

var fileCacheWriter = function() {
	
	var origin = "localhost";
	
	var write = function(item) {

		console.log("requesting " + item.url)

		var request = http.request({"port":9200, "path":item.url}, function(response) {
			console.log("response " + item.url)
				response.setMaxListeners(0); 

			while(item.waiting.length > 0)
				response.pipe(item.waiting.pop());
				
			refreshManager.requestDone(item.url);

			// write to file.
	
			
			});
		
		request.end();

	}

	return {
		"write":write
	}

}()


var refreshManager = function () {

	var MAX_REQUESTS = 100;

	var _queue = [];
	var _map = {};
	
	var processing = 0;

	var add = function(url, res) {

		var pos;
		
		if (_map[url]) {
			console.log("inc")
			_map[url].count++;
			
			// just for my testing
			if (_map[url].count >= 9) {
				console.log("refreshing")
			 	refreshManager.checkQueue();
			}

		} else {

			_map[url] = {
				"url": url,
				"count": 0,
				"waiting": []
			}
	
			pos = _queue.push(_map[url]);
			
			_map[url].queueEntry = _queue[pos-1];
		}
		
		if (res) {

			_map[url].waiting.push(res);
		}

		return _map[url]
		
	}
	
	var compare = function(item1, item2) {
	
		if (item1.waiting.length > item2.waiting.length)
			return -1
			
		if (item2.waiting.length > item1.waiting.length)
			return 1
			
		if (item1.count > item2.count)
			return -1
			
		if (item2.count > item1.count)
			return 1
	
		return 0
	}
	
	var next = function() {

		var _next;
		
		if (!_queue.length  || processing == MAX_REQUESTS)
			return false
		
		processing++;
		
		_queue.sort(compare);
		
		_next = _queue.shift();

		delete _next.queueEntry

		return _next
	}

	var checkQueue = function() {
		console.log("checking")

		var item = next();

		if (item) {
			fileCacheWriter.write(item)
		}
	}
	
	var requestDone = function(url) {
		if (true) {
			delete _map[url];
		}
	}
	
	return {
		"add": add,
		"next": next,
		"checkQueue": checkQueue,
		"requestDone": requestDone,
		"_queue": _queue,
		"_map": _map
	}

}()



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