var http = require('http');


http.createServer(function (req, res) {

console.log(req.url)

	var respond = function(req, res) {

		code = 200;
		head = {"Content-Type": "text/plain"};
		body = "Tracked " + req.url;
		encoding = 'utf8';	
	
		res.writeHead(code, head);
		res.write(body, encoding);
		res.end();
	
	}
	
	respond(req, res)

}).listen(9100, "0.0.0.0");
