Flattener
=============

An implementation of a caching server with the following characteristics:

* A server listinening for requests
* A `fileCacheReader` that checks to see if the request can be serviced from the file system
* A `fileCacheWriter` that can make a request to an origin server, and store the result in the file system
* A `refreshManager` that manages requests, keeps a queue of pending requests, prioritizes that queue, and passes them on to the `fileCacheWriter`

To Do
-------

* write out the test harness, include the tracking server in the test file, include the server as well.


Test Cases
------------

* multiple readers requesting the same url, we only want one requst to go to origin, but we want the result to service all waiting requestors

* what if we have multiple requestors, then more get added during the piping of the response? do we attach them to the file end event?




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

