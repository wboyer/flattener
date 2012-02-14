Flattener
=============

An implementation of a caching server with the following:

* A server listinening for requests
* A `fileCacheReader` that checks to see if the request can be serviced from the file system
* A `fileCacheWriter` that can make a request to an origin server, and store the result in the file system
* A `refreshManager` that manages requests, keeps a queue of pending requests, prioritizes that queue, and passes them on to the `fileCacheWriter`

Getting Started
-------

* Currently being developed against nodejs v0.6.8 
* Download/checkout the code
* From within the root of the project directory: `node server.js`
* This should start the server: `Caching Server: listening on: 9100`
* Currently configuration is done in each file:
	* in `server.js`, the port the cache proxy is listening on is set to 9100
	* in `fileCacheWriter.js` the origin server is set to "www.mtv.com", the cache directory is set to "tmp" (relative to the directory we are running in)
	* in `fileCacheReader.js` the cache directory is again set to "tmp" (need a plan to remove duplication)
	
Visiting <http://localhost:9100/> should return the index page at <http://www.mtv.com/> and cause a .header and a cache file to be written in the tmp directory.   	

Blockers
-----------

* sometimes requests hang for a very long time.  then the problem goes away.  I need to collect more information on how to reproduce.

To Do
-------

* write out the test harness, include the tracking server in the test file, include the server as well.
* figure out what headers need to be passed through, ignored, taken into account
* build out logic to canonicalize requested urls (including the query strings)
* build out logic for determining if something in cache needs to be refreshed
* add a clear cache that will remove the tmp directory
* figure out where to store the variables like, port, cache dir path
* boom!

Test Cases
------------

* multiple readers requesting the same url, we only  one requst to goes to origin, but we want the result to service all waiting requestors

* what if we have multiple requestors, then more get added during the piping of the response? do we attach them to the file end event?


Considerations
----------------

* How are we going to configure it


Markup Examples
----------------
### here is an h3

This is what a code block looks like

    var x = function() {
       for (var i = 0; i < 10; i++) {
          alert();
       }
    }

and use back ticks to do it in line `foo.bar = "yow";`

### this is how you do a link:

[greggraf](http://www.greggraf.com/)

