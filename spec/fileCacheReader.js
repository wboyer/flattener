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
		null,
		'{\
			"statusCode": 200,\
			"headers": {\
				"server":"Apache/2.0.63 (Unix) mod_jk/1.2.27",\
				"content-length":"20",\
				"content-type":"text/html;charset=utf-8",\
				"cache-control":"max-age=112",\
				"date":"Tue, 17 Jan 2012 17:18:47 GMT",\
				"connection":"close"		\
			}\
		}'
	],

	"tmp/file_exists": "this file exists"
	
	
}

var notThere = "file_does_not_exist"
var there = "file_exists"
var responseStub = {
	output: {},
	"writeHead": function(statusCode, headers) {
		this.output.statusCode = statusCode;
		this.output.headers = headers
	}
};

		
buster.testCase("read an url from cache", {

	setUp: function() {
	
		this.fs = this.stub(fs, "readFile", function(url, callback) {
				if (fixtures[url]) {
					callback.apply(this, fixtures[url]);
				}

			});	

		this.fs2 = this.stub(fs, "createReadStream", function(url) {
				if (fixtures[url]) {
					return {
						"pipe": function(res) {
							res.output.body = fixtures[url]
						}
					}
				}

			});	

	},

	tearDown: function() {
		this.fs.restore()
		this.fs2.restore()
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

    "//should not call JSON data if data is not a string": function () {

		// fileCacheReader.read(there, responseStub);

    },

    "should parse data into json, verify it has statusCode and headers, create a readstream at cachedir/url, then call pipe on the readstream with response as the argument when file exists": function () {

		fileCacheReader.read(there, responseStub);
		assert.equals({
			"statusCode": 200,
			"headers": {
				"server":"Apache/2.0.63 (Unix) mod_jk/1.2.27",
				"content-length":"20",
				"content-type":"text/html;charset=utf-8",
				"cache-control":"max-age=112",
				"date":"Tue, 17 Jan 2012 17:18:47 GMT",
				"connection":"close"		
			},
			"body": "this file exists"
		}, responseStub.output)
    },




    
});

var valid = 

buster.testCase("check cache validity", {



	setUp: function() {



	},

	tearDown: function() {
	},
	
    "// should take a header object": function () {

		assert.same(false,fileCacheReader.read());

    },

    "// should return false if ": function () {

		assert.same(false,fileCacheReader.read());

    },




    
});


