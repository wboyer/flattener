var http = require('http');

http.createServer(function (req, res) {

	var respond = function(req, res) {

		code = 203;
		head = {"Content-Type": "text/plain"};
		body = "Tracked " + req.url;
		encoding = 'utf8';	
	
		res.writeHead(code, head);
		res.write(body, encoding);
		res.end();
	
	}


	console.log("tracking " + req.url)

	console.log("waiting " + req.url)

	setTimeout(function() {
		respond(req, res)
		console.log("done waiting " + req.url)

	}, 5000)
	
	
}).listen(9200, "0.0.0.0");

console.log("listening on :9200");
