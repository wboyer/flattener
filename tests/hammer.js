var exec = require('child_process').exec;

var g;

for (var i = 0; i < 10; i++) {
	g = function() {
		var j = i;
		exec('curl localhost:9100/foo/bar2dd33.jhtml -s ', function(error, stout, stderr) {
			console.log("request " + j + ":" + stout);
		})
	}();
}
