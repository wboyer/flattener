var http = require('http');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;


var refreshManager = require('./refreshManager');
	
var origin = "localhost";
var port = 9200;
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


	prepare_paths(reqParts, function() {

		var request = http.request({"port":port, "path":item.url}, function(response) {
		
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
	
	var stub = {
		"request": function(req, res) {
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
		},
		"item": { 
			"url": "/foo/bar2",
			"waiting": []
		}
	};
	
	var tests = {
		"rm() returns false when file  doesn't exist": function() {
			var testpath = cacheDir + "/foo/bar2"
		
			rm(testpath, function(res){
				fs.stat(testpath, function(err) {
					assert.equal(err.code, 'ENOENT',  testpath + " doesn't exist")
					next();
				
				})
			});
		},

		"rm() deletes a file when it exists": function() {
			// create a file

			var testpath = cacheDir + "/testfile"

			fs.writeFile(testpath, "Hey there!", function(err) {
			
					if(err) {
						console.log(err);
					} else {
						console.log("The file was saved!");
						fs.stat(testpath, function(err, stats) {
							assert.equal(stats.isFile(), true, testpath + " exists")
						});
	
						rm(testpath, function(res){
							fs.stat(testpath, function(err) {
								assert.equal(err.code, 'ENOENT',  testpath + " no longer exists")
								next();
							
							})
						});
					}
			
			
			
			}); 
			
		},

		"rm() deletes a directory when it exists": function() {

			fs.stat(cacheDir, function(err, stats) {
				if (!err) {

					assert.equal(stats.isDirectory(), true,  cacheDir +" does exist");
					
					log(cacheDir + " does exist");
					
					rm(cacheDir, function(res){
						fs.stat(cacheDir, function(err) {

							assert.equal(err.code, 'ENOENT',  cacheDir +" doesn't exist")
							log(cacheDir + " doesn't exist");

							next();
						})
					});
				} 
			})


		},

		
		"write() creates a file ": function() {
			return;
			var old_http = http;
			http.request = stub.request;
			
			var testpath = cacheDir + "/foo/bar2";

			
			write(stub.item, function(res){
					log("in write call back")
					fs.stat(testpath, function(err, stats) {
						assert.equal(stats.isFile(), true,  testpath + " exists")
						fs.unlink(testpath) 
						http.request = old_http.request;
						next();
				
					})

			});
		}		
		
	}
	
	var testsArray = []
	for (key in tests) {
		testsArray.push(key)
	}

	var next = function () {
		var item = testsArray.pop();
		if (item) {
			log(item)
			tests[item]();
		}
	}
	
	next();
																																																																																																																																																																																																																																																																																																																																																																																																																									
}


