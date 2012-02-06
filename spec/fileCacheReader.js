// Node tests
var buster = require("buster");
var fileCacheReader = require("../fileCacheReader.js");
var refreshManager = require('../refreshManager');
var fs = require('fs');


var fixtures = {
	"tmp/file_does_not_exist.header": [
		{
			"code": 'ENOENT'
		},
		undefined
	],
	
	"tmp/file_exists.header": [
		undefined,
		{
			"statusCode": 200,
			"headers": {
				"server":"Apache/2.0.63 (Unix) mod_jk/1.2.27",
				"content-length":"20",
				"content-type":"text/html;charset=utf-8",
				"cache-control":"max-age=112",
				"date":"Tue, 17 Jan 2012 17:18:47 GMT",
				"connection":"close"		
			}
		
		}
	],
	
	
}

var notThere = "file_does_not_exist"
var there = "file_exists"
var responseStub = {
	"writeHead": function(code, headers) {
		return true
	}
};

		
buster.testCase("read an url from cache", {

	setUp: function() {
	
		this.fs = this.stub(fs, "readFile", function(url, callback) {
				if (fixtures[url]) {
					callback.apply(this, fixtures[url]);
				}

			});	



	},

	tearDown: function() {
		this.fs.restore()
	},
	
    "should return false if there is no url passed": function () {

		assert.same(false,fileCacheReader.read());

    },

    "should return false if there is an url but no response passed": function () {

		assert.same(false,fileCacheReader.read(notThere));

    },

    "should call refreshManager.add(url) when file does not exist": function () {
		this.rmAddStub = this.stub(refreshManager, "add");	

		fileCacheReader.read(notThere, responseStub);
		assert.called(this.rmAddStub)

		this.rmAddStub.restore()
    },

    "//should parse data into json, verify it has statusCode and headers, create a readstream at cachedir/url, then call pipe on the readstream with response as the argument when file exists": function () {

//		fileCacheReader.read(there, responseStub);

    },




    
});


