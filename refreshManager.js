var fileCacheWriter = require('./fileCacheWriter');


var MAX_REQUESTS = 100;

var _queue = [];
var _map = {};

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

	checkQueue();

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
	checkQueue();

}
	
exports.add =  add;
exports.next =  next;
exports.checkQueue =  checkQueue;
exports.requestDone =  requestDone;
exports._queue =  _queue;
exports._map =  _map;
	




