var http = require('http');

var httpProxy = http.createServer(function (req, res) {

	refreshManager.add(req.url, res)
	refreshManager.checkQueue();


}).listen(9100, "0.0.0.0");


var fileCacheWriter = function() {

	
	var origin = "localhost";
	
	
	var write = function(item) {

		console.log("requesting")

		var request = http.request({"port":9200, "path":item.url}, function(response) {
			console.log("response")
			
			while(item.waiting.length > 0)
				response.pipe(item.waiting.pop());
			
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
	var _map = {}
	
	var processing = 0;

	var add = function(url, res) {

		var pos;
		
		
		if (_map[url]) {

			_map[url].count++;

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
		"_queue": _queue
	}

}()




/** testing **/
var assert = require("assert");


var test;
var urls = ["/url1", "/url2", "/url3", "/url2", "/url4", "/url2", "/url5", "/url1", "/url2", "/url6"];
var writerUrls = [0,0,0,0,0,0,1,0,0,0]
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
	test that when we get next, we break the links between the _map and the queue

*/
console.log("\n Waiting test")

urls.forEach(function(ele, ind, arr) {

	if (writerUrls[ind]) {
	
		http.get({
			"port":9100,
			"path": ele
		});
		
	} else {
	
		refreshManager.add(ele);
		refreshManager.checkQueue();


	}
	
})


