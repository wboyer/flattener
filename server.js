var http = require('http');

var refreshManager = require('./refreshManager');
var fileCacheReader = require('./fileCacheReader');

var port = 9100;

/* this is the main server that handles all requests.
   needs to check the file cache, pass through request to origin
   and stuff.
      - should canonicalize the requested url
*/

var server = http.createServer(function (req, res) {

 if (req.url == "/checkQueue") {
 	refreshManager.checkQueue();

 } else {
	console.log("Cache Server:  " + req.url)
	fileCacheReader.read(req.url, res)
	
	
}

});


server.listen(port, "0.0.0.0", function() {

	console.log("Caching Server: listening on: " + port);
	
});

exports.server = server;