var http = require('http');
var fs = require('fs');
var path = require('path');

var origin = "www.mtv.com";
var cacheDir = "tmp";


http.createServer(function (req, res) {

	var req_parts = req.url.substr(1).split("/")
	var req_file = req_parts.pop() || "index.html";
	var enc_file = app.encode(req_file);
	var req_dir = [] + req_parts.join("/") + "/";

	console.log("\nrequesting +++++++++++++++++++++++++++")
	console.log(req.url)
	console.log(req_parts)
	console.log(req_dir)
	console.log(req_file)

	


	var prepare_paths = function(parts, cb) {
		var test = [];
		
		var mkdirs = function(next_item) { 
		
			if (!next_item) {
				if (cb) cb()
				return
			}
				
			console.log(next_item)

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

	prepare_paths([cacheDir,"headers"].concat(req_parts), function() {
		prepare_paths([cacheDir,"body"].concat(req_parts), function() {
			checkCache(req_dir + enc_file);
		})
	})

	

	var checkCache = function(key) {
	
		// console.log("checking cache for key: " + key)
		
		fs.readFile(cacheDir + '/headers/' + key, function (err, data) {
			if (err) { 
				console.log(err)
				if (err.code == 'ENOENT') {
					setCache(key)
				}
				return false;
			}
			
			console.log(req.url + " [" + key + "] in cache")

			var clientResponse = JSON.parse(data)
			res.writeHead(+clientResponse.statusCode, clientResponse.headers);
			var cachedResponse = fs.createReadStream(cacheDir + '/body/' + key);
			cachedResponse.pipe(res)	
			console.log("from cache")
		
		});
	}

	var setCache = function(key) {
		var site = http.createClient(80, req.headers.host);
	
		// TEMP: disable gzip header
		req.headers['accept-encoding'] = "";

		// TEMP: disable cache header
		req.headers['if-none-match'] = "";
		req.headers['if-modified-since'] = "";
		
		var request = site.request(req.method, req.url,req.headers);
		request.end();
	
		request.on('response', function (response) {
		
			//	console.log("requested from origin")
			//	console.dir(response)
			//	response.setEncoding('utf8');
			
			var bodyFile = fs.createWriteStream(cacheDir + "/body/" + key);

			bodyFile.on("close", function () {
				var headerFile = fs.createWriteStream(cacheDir + "/headers/" + key);
				// console.log("writing header " + app.encode(req.url))
				headerFile.write(JSON.stringify({"statusCode": response.statusCode, "headers": response.headers }))
				headerFile.on("close", function () {
					checkCache(key)
				});
				headerFile.end()
			});
			
			response.pipe(bodyFile);
			
		});	
		
	}
	
	req.headers.host = origin
	
	// console.log("Request for " + req.url + "[" + app.encode(req.url) + "]")
//	checkCache(req.url);
	


}).listen(1337, "0.0.0.0");


var app = {
	"encode": function (str) {
		return new Buffer(str).toString('base64')
			.replace(/\+/g, '-')		// get rid of + and / so we can put in file system
			.replace(/\//g, '_') 
	
	},
	
	"decode": function (str) {
		return new Buffer(str, 'base64').toString('utf8')
	}
}

console.log('Server running at http://0.0.0.0:1337/');
