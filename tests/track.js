var http = require('http');

http.createServer(function (req, res) {

	var delay = 5000;

	var respond = function(req, res) {

		code = 203;
		head = {"Content-Type": "text/plain"};
		body = "Tracked " + req.url + "\nwaited " + delay/1000 + " seconds";
		encoding = 'utf8';	
	
		res.writeHead(code, head);
		res.write(body, encoding);
		res.end();
	
	}


	console.log("Origin Server: tracking " + req.url)

	console.log("Origin Server: waiting " + req.url + " " + delay/1000 + " seconds")

	setTimeout(function() {
		respond(req, res)
		console.log("done waiting " + req.url)

	}, delay)
	
	
}).listen(9200, "0.0.0.0");

console.log("Origin Server: listening on :9200");
