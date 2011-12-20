
var refreshManager = function () {

	var MAX_REQUESTS = 100;

	var _queue = [];
	var _map = {}
	
	var processing = 0;

	var add = function(url) {
		var pos;
		
		if (_map[url]) {
		
			_map[url].count++;

		} else {

			_map[url] = {
				"url": url,
				"count": 0,
			}
	
			pos = _queue.push(_map[url]);
			
			_map[url].queueEntry = _queue[pos-1];
		}
		
	}
	
	var compare = function(item1, item2) {

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
		console.log(_queue[0])
		
		_next = _queue.shift();
		console.log(_next.url)
		console.log(_next.queueEntry)
		delete _next.queueEntry
		console.log(_next.queueEntry)
		return _next
	}

	return {
		"add": add,
		"next": next
	}

}()





/** testing **/
var assert = require("assert");


var test;
var urls = ["url1", "url2", "url3", "url2", "url4", "url2", "url5", "url1", "url2", "url6"];

var sorted = ["url2", "url1", "url3", "url4", "url5", "url6"]

urls.forEach(function(ele, ind, arr) {
	requestQueue.add(ele);
})


while (test = requestQueue.next().url) {
	val = sorted.shift();
	console.log(test + ", " + val)
	assert.equal(test, val, "Should be " + val + ", was " + test)
}


/*
	test that when we get next, we break the links between the _map and the queue

*/

