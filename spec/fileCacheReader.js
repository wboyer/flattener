// Node tests
var buster = require("buster");
var fileCacheReader = require("../fileCacheReader.js");
var refreshManager = require('../refreshManager');

buster.testCase("read an url from cache", {

	setUp: function() {
		this.p = this.stub(refreshManager, "add");	
	},

	tearDown: function() {
		this.p.restore();	
	},
	
    "should return if there is no url passed": function () {

		assert.same(false,fileCacheReader.read());

    },

    "should call refreshManager.add(url) when url does not exist": function () {
		var url = "/fixtures/file_does_not_exist"
		
		fileCacheReader.getHeader({"code":'ENOENT'})
		assert.called(this.p)

    },




    
});


