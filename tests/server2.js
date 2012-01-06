/* TODOs
	- move from "http.createclient" to newer style of http.get (does this have to do with agent)
	- make sure we aren't limiting the number of requests per host
	- how do i figure out where the gzipping is happening, is akamai doing it?
	- how do i troubleshoot why the request appears to hang... is it me, or origin, or the limit?
	- how can i use the etag header.
	- make the recursive directory create/verify exists smarter and more performant
	
	- not cacheable:
		The following response headers flag a response as uncacheable unless they are ignored:

		Set-Cookie
		Cache-Control containing "no-cache", "no-store", "private", or a "max-age" with a non-numeric or 0 value
		Expires with a time in the past
		X-Accel-Expires: 0
*/

var http = require('http');
var fs = require('fs');
var path = require('path');

var origin = "www.mtv-jd.mtvi.com";
var cacheDir = "tmp";
var port = 1337;


http.createServer(function (req, res) {

	var req_parts = req.url.substr(1).split("/")
	var req_file = req_parts.pop() || "index.html";
	var req_dir = [] + req_parts.join("/") + "/";

	/*
	console.log("\nrequesting +++++++++++++++++++++++++++")
	console.log(req.url)
	console.log(req_parts)
	console.log(req_dir)
	console.log(req_file)
	*/
	


	var prepare_paths = function(parts, cb) {
		var test = [];
		
		var mkdirs = function(next_item) { 
		
			if (!next_item) {
				if (cb) cb()
				return
			}
				
//			console.log(next_item)

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
	console.time("prepare_paths:" + req.url)
	prepare_paths([cacheDir,"headers"].concat(req_parts), function() {
		prepare_paths([cacheDir,"body"].concat(req_parts), function() {
			console.timeEnd("prepare_paths:" + req.url)
			checkCache(req_dir + req_file);
		})
	})

	

	var checkCache = function(key) {
	
		// console.log("checking cache for key: " + key)
		console.time("checkCache:" + req.url)

		fs.readFile(cacheDir + '/headers/' + key, function (err, data) {
			console.timeEnd("checkCache:" + req.url)
			if (err) { 
//				console.log(err)
				if (err.code == 'ENOENT') {
					setCache(key)
				}
				return false;
			}
			
			var clientResponse = JSON.parse(data)
			res.writeHead(+clientResponse.statusCode, clientResponse.headers);
			var cachedResponse = fs.createReadStream(cacheDir + '/body/' + key);
			cachedResponse.pipe(res)	

		});
	}

	var setCache = function(key) {
	
		var site = http.createClient(80, req.headers.host);
	
		// TEMP: disable gzip header
		req.headers['accept-encoding'] = "";

		// TEMP: disable cache header
		req.headers['if-none-match'] = "";
		req.headers['if-modified-since'] = "";
		
		console.log('requesting:' + req.url)
		console.time('request:' + req.url)
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
				console.timeEnd('request:' + req.url)

			});
			
			response.pipe(bodyFile);
			
		});	
		
	}
	
	req.headers.host = origin
	
	// console.log("Request for " + req.url + "[" + app.encode(req.url) + "]")
//	checkCache(req.url);
	


}).listen(port, "0.0.0.0");


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

console.log('Server running at http://0.0.0.0:' + port +'/');
