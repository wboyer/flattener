Flattener
=============

An implementation of a caching server with the following:

* A server listinening for requests
* A `fileCacheReader` that checks to see if the request can be serviced from the file system
* A `fileCacheWriter` that can make a request to an origin server, and store the result in the file system
* A `refreshManager` that manages requests, keeps a queue of pending requests, prioritizes that queue, and passes them on to the `fileCacheWriter`

To Do
-------

* write out the test harness, include the tracking server in the test file, include the server as well.
* figure out what headers need to be passed through, ignored, taken into account
* build out logic to canonicalize requested urls (including the query strings)
* build out logic for determining if something in cache needs to be refreshed
* add a clear cache that will remove the tmp directory
* figure out where to store the variables like, port, cache dir path


Test Cases
------------

* multiple readers requesting the same url, we only  one requst to goes to origin, but we want the result to service all waiting requestors

* what if we have multiple requestors, then more get added during the piping of the response? do we attach them to the file end event?


Considerations
----------------

* How are we going to configure it

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

