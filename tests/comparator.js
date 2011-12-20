
var requestQueue = function () {

	var queue = [];
	var _map = {}

	var ord = 0;
	
	var add = function(url) {

		if (_map[url]) {
			_map[url].count++;
		} else {
			_map[url] = {
				"count": 0
				"order": ord++
			}
		
		}
		
		queue.push({
			"url": url,
			"count": 1,
			"order": ord++
		})
	}
	
	var compare = function(item1, item2) {

		if (item1.count > item2.count)
			return -1
			
		if (item2.count > item1.count)
			return 1
	
		if (item1.ord > item2.ord)
			return -1
	
		if (item2.ord > item1.ord)
			return 1
	
		return 0
	}
	
	var next = function() {
		if (!queue.length)
			return false
			
		queue.sort(compare);
		return queue.shift()
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


