var http = require('http');
var path = require('path');
var fs = require('fs');

var refreshManager = require('./refreshManager');
	
var origin = "localhost";
var port = 9200;
var cacheDir = "tmp";

var write = function(item) {

	console.log("requesting " + item.url)
	
	var reqParts = item.url.substr(1).split("/")
	var reqFile = reqParts.pop() || "index.html";
	var reqDir = [] + reqParts.join("/") + "/";
	var url = reqDir + reqFile;


	prepare_paths([cacheDir].concat(reqParts), function() {

		var request = http.request({"port":port, "path":item.url}, function(response) {
		
			console.log("response " + item.url)
		
			response.setMaxListeners(0); 

			var bodyFile = fs.createWriteStream(cacheDir + '/' + url) ;
	
			bodyFile.on("close", function () {

				var headerFile = fs.createWriteStream(cacheDir + '/' + url + ".header");
	
				headerFile.write(JSON.stringify({"statusCode": response.statusCode, "headers": response.headers }))
				headerFile.end()
	
			});
			
			response.pipe(bodyFile);
	
			while(item.waiting.length > 0)
				response.pipe(item.waiting.pop());
				
			refreshManager.requestDone(item.url);
			
		});
		
		request.end();

	})

}

var prepare_paths = function(parts, cb) {

	var test = [];
	
	var mkdirs = function(next_item) { 
	
		if (!next_item) {
			if (cb) cb()
			return
		}

		test.push(next_item)
		path.exists(test.join("/"), function(exists) {
			if (!exists) {
				fs.mkdir(test.join("/"), 0755, function(err) {
					(err) ? console.log(err) : mkdirs(parts.shift()) ;
				})
			} else {
				mkdirs(parts.shift())
			}
		})
	}

	mkdirs(parts.shift(), cb)

}

exports.write = write;



