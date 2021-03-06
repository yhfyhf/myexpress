# myexpress
Build my own web framework for Node.js similar to [`Express`](http://expressjs.com).


## Features
* Middleware stack similar to [`Connect`](https://github.com/senchalabs/connect)
  * Mount midldlewares to handle requests and responses
  * Support error handling middlewares
  * Add sub-app as a middleware
* Request Path matcher and Route handlers
  * Path parameters matching and extraction
  * Nested app prefix path trimming
* Monkey Patching request and response
  * Redirect
  * set `Content-Type` header


## Quick Start

```javascript
var express = require("myexpress");
var app = express();

// handle GET method
app.get('/foo', function(req, res) {
  res.end('GET Foo');
});

// handle POST method
app.post('/foo', function(req, res) {
  res.end('POST Foo');
});

// middleware 1
app.use(function(req, res, next){
  // ......
  next();
});

// error handler
app.use(function(err, req, res, next) {
  // ......
  next(err);
});

// middleware 2, error skip this middlware
app.use(function(req, res, next) {
  // ......
  next();
});

// mount sub-app
var subapp = express();
app.use('/sub', subapp);

// extract paramters
app.use('/user/:id', function (req, res, next) {
  console.log('ID:', req.params.id);
  next();
});

// redirect
app.use("/foo", function(req, res) {
  res.redirect("/bar");
});

app.listen(4000);
```



## Test
Based on test-driven development (TDD).

``` javascript
"dependencies": {
  "accepts": "^1.0.1",
  "methods": "^0.1.0",
  "mime": "^1.2.11",
  "path-to-regexp": "^0.1.2"
},
"devDependencies": {
  "chai": "^3.2.0", 
  "mocha": "^2.2.5", 
  "supertest": "^1.0.1" 
}
```

#### Run Tests
```
$ mocha verify
```
