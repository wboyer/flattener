var http = require('http');

var origin = "www.mtv.com";
var port = 80;

function log (args) {
	console.log("httpReader.js: " + args);
}

function setOrigin (args) {
	origin = args
}
function setPort (args) {
	port = args
}

var read = function(req, callback) {

	var request = http.request({
			"host":origin, 
			"port":port, 
			"path":req.url, 
			"headers": req.headers
		}, function(response) {
		
			log("response " + req.url)
			log("origin " + origin + ":" + port)
		
			response.setMaxListeners(0); // is this really the right place to do this?

			if (typeof callback === 'function') {
				callback(response);
			}
	});
	
		request.end();

}
exports.read = read;
exports.setOrigin = setOrigin;
exports.setPort = setPort;
