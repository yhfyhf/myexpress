# myexpress
Build my own web framework for Node.js similar to [`Express`](http://expressjs.com).

## Usage
```javascript
var express = require("myexpree");
var app = express();
app.use(function (req, res, next) {
  // ......
  next();
});
app.listen(4000);
```

## Features
* Build a middleware stack similar to [`Connect`](https://github.com/senchalabs/connect)
  * Mount midldlewares to handle requests and responses
  * Support error handling middlewares
  * Add sub-app as a middleware
  * Request Path matcher
* Developing...

## Test
Based on test-driven development(TDD).
```
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
