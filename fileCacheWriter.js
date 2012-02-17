var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
	
var cacheDir = "tmp";

function log (args) {
	console.log("fileCacheWriter.js: " + args);
}

var write = function(item, response) {

	log("writing " + item.url)
	
	var reqParts = [cacheDir].concat(item.url.substr(1).split("/"));
	var reqFile = reqParts.pop() || "index.html";
	var reqDir =  reqParts.join("/") + "/";
	var url = reqDir + reqFile;


		var bodyFile = fs.createWriteStream(url) ;
	
		bodyFile.on("close", function () {

			var headerFile = fs.createWriteStream(url + ".header");  // util function?

			headerFile.write(JSON.stringify({"statusCode": response.statusCode, "headers": response.headers }))
			headerFile.end()

		});
		
		response.pipe(bodyFile);

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

var prepare_paths = function(url, cb) {

	var parts = [cacheDir].concat(url.substr(1).split("/"));
	parts.pop();
	
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
					if (err) {
						log(err) 
						if (cb) cb()
						return
					} else {
						mkdirs(parts.shift()) ;
					}
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
exports.prepare_paths = prepare_paths;
