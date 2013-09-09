# OAuth2Resource

Express middleware for request authorization against [OAuth2Server](https://github.com/christiansmith/OAuth2Server).

## Installation and Usage

OAuth2Server requires protected resources (your API server) to be registered, and provides credentials for authenticating access token verification requests. OAuth2Resource provides middleware for easily authorizing an API request against OAuth2Server. Install it with npm:

    $ npm install oauth2resource


Configure the module with an authorization server endpoint, resource_id, resource_secret, and scope, then use it as route specific middleware. Here's an example Express app.

    // app dependencies
    var express = require('express')
      , app = express();

    // middleware config
    var authorize = require('oauth2resource')({
      endpoint: 'https://HOST:PORT/access', 
      resource_id: RESOURCE_ID, 
      resource_secret: RESOURCE_SECRET,
      scope: SCOPE
    });

    // app config
    app.configure(function () {
      app.use(express.bodyParser());
      app.use(app.router);

      // Error handler
      app.use(function (err, req, res, next) {
        var error = (err.errors)
          ? { errors: err.errors }
          : { error: err.message, error_description: err.description };
        res.send(err.statusCode || 500, error);
      });
    });

    // Protected route
    app.get('/protected', authorize, function (req, res) {
      res.send('protected resource');
    });


Requests to a protected endpoint require a Bearer token:


    $ curl -v 'localhost:3001/protected' -H 'Authorization: Bearer e957468c922c97605aa9'

    > GET /protected HTTP/1.1
    > Host: localhost:3001
    > Accept: */*
    > Authorization: Bearer e957468c922c97605aa9
    >
    < HTTP/1.1 200 OK
    protected resource



## The MIT License

Copyright (c) 2013 Christian Smith http://anvil.io

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
