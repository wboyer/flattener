var http = require('http');
var path = require('path');
var fs = require('fs');

var refreshManager = require('./refreshManager');
	
var origin = "localhost";
var port = 9200;
var cacheDir = "tmp";

function log (args) {
	console.log("fileCacheWriter.js: " + args);
}

var write = function(item, callback) {

	log("requesting " + item.url)
	
	var reqParts = item.url.substr(1).split("/")
	var reqFile = reqParts.pop() || "index.html";
	var reqDir = [] + reqParts.join("/") + "/";
	var url = reqDir + reqFile;


	prepare_paths([cacheDir].concat(reqParts), function() {

		var request = http.request({"port":port, "path":item.url}, function(response) {
		
			log("response " + item.url)
		
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
			
			callback();
			refreshManager.requestDone(item.url);
			
		});
		
		request.end();

	})

}

var rm = function (url, callback) {
	fs.unlink(url, function(err) {
		callback()
	});
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


/** testing **/

if (process.argv[2] == "test") {


	var assert = require("assert");
	log("running tests");
	
	var tests = {
		"rm() returns 'EONENT' when file  doesn't exist": function() {
			rm(__dirname + "/foo/bar", function(res){
				assert.equal(res, "ENOENT", "file doesn't exist")
				next();
			});
		},

		"write() creates a file ": function() {
			var old_http = http;
			http.request = function(req, res) {
				return {
					"responseCode": 200,
					"headers": {
						"foo":"bar"
					},
					"body": "test body content",
					"end": function() {
						res({
						 "setMaxListeners": function() {
						 	return true;
						 },
						 "pipe": function(s) {
						 	s.end();
						 	return true;
						 }

						});
						return true;
					}
				}
			}
			write({ 
					"url": __dirname + "/foo/bar",
					"waiting": []
				}, function(res){
					assert.equal(fs.statSync( __dirname + "/" + cacheDir  + "/foo/bar").isFile(), "ENOENT",  __dirname + "/" + cacheDir +"/foo/bar doesn't exist")
				http.request = old_http.request;
				next();
			});
		}		
		
	}
	
	testsArray = []
	for (key in tests) {
		testsArray.push(key)
	}

	var next = function () {
		var item = testsArray.pop();
		log(item)
		tests[item]();
	}
	
	next();
																																																																																																																																																																																																																																																																																																																																																																																																																									
}


