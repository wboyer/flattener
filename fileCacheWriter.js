var http = require('http');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;


var refreshManager = require('./refreshManager');
	
var origin = "www.mtv.com";
var port = 80;
var cacheDir = "tmp";

function log (args) {
	console.log("fileCacheWriter.js: " + args);
}

var write = function(item, callback) {

	log("requesting " + item.url)
	
	var reqParts = [cacheDir].concat(item.url.substr(1).split("/"));
	var reqFile = reqParts.pop() || "index.html";
	var reqDir =  reqParts.join("/") + "/";
	var url = reqDir + reqFile;

	console.log("about to prepare paths")
	prepare_paths(reqParts, function() {	
		console.log("starting request: " + item.url)

		var request = http.request({"host":origin, "port":port, "path":item.url}, function(response) {
		
			log("response " + item.url)
		
			response.setMaxListeners(0); 

			var bodyFile = fs.createWriteStream(url) ;
	
			bodyFile.on("close", function () {

				var headerFile = fs.createWriteStream(url + ".header");
	
				headerFile.write(JSON.stringify({"statusCode": response.statusCode, "headers": response.headers }))
				headerFile.end()
	
			});
			
			response.pipe(bodyFile);
	
			while(item.waiting.length > 0)
				response.pipe(item.waiting.pop());
			
			if (typeof callback === 'function') {
				callback();
			}
			
			refreshManager.requestDone(item.url);
			
		});
		
		request.end();

	})

}

var rm = function (url, cb) {

	if (url.indexOf(cacheDir) != 0 ) {
		return
	}

	var callback = function(err) {

		if (typeof cb === 'function') {
			cb(err);
		}
	};
	
	fs.stat(url, function(statErr, stats) {

		if (statErr) {
			return
		}
		
		if (stats.isFile()) {
			console.log("doing unlink")
			fs.unlink(url, callback);

		}

		if (stats.isDirectory()) {
			console.log("doing rm -r")
			exec("rm -r " + url, callback)
		
		}
	
	
	})
}

var prepare_paths = function(parts, cb) {
	console.log("preparing path: " + parts.join("/"))
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
					(err) ? log(err) : mkdirs(parts.shift()) ;
				})
			} else {
				mkdirs(parts.shift())
			}
		})
	}

	mkdirs(parts.shift(), cb)

}

exports.write = write;
exports.rm = rm;
