// Node tests
var buster = require("buster");
var fileCacheReader = require("../fileCacheReader.js");
var	refreshManager = require('../refreshManager');


buster.testCase("handle header file read", {

    "should call refreshManager.add() if read returns ENOENT": function () {
        // Wraps "aMethod". The original method is called, and you can also
        // do stub like assertions with it.
        this.stub(refreshManager, "add");
        fileCacheReader.handle('ENOENT')
        assert.calledOnce(refreshManager.add);
    }
});


buster.testCase("read", {

    "should return if there is no url passed": function () {
    }
});

