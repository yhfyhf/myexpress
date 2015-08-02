var http = require("http");
var Layer = require("./lib/layer");
var makeRoute = require("./lib/route");
var methods = require("methods");
var monkeyPatchRequest = require('./lib/request');
var monkeyPatchResponse = require('./lib/response');

module.exports = function() {
    var index;
    var request, response, next;

    var app = function(req, res, parentNext) {
        index = 0;
        request = req;
        response = res;
        next = parentNext; // save parentNext
        app.monkeyPatch(request, response);
        app.next();
    };

    app.listen = function(port, done) {
        var server = http.createServer(app);
        server.listen(port, done);
        return server;
    };

    app.stack = [];
    app.use = function(path, middleware) {
        if (typeof(path) === "function") {
            middleware = path;
            path = "/";
        }
        app.stack.push(new Layer(path, middleware));
    };

    app.handle = function(req, res, next) {
    };

    app.next = function(err) {
        var layer = app.stack[index++];
        if (layer === undefined) {
            // now at the bottom of the middleware stack
            if (next) {
                // at the end of subapp, should return to the parent app by calling next
                next(err);
            } else {
                response.statusCode = err? 500 : 404;
                response.end();
                return;
            }
        } else {
            var m = layer.handle;
            request.params = {};
            var match = layer.match(request.url);
            if (match) {
                request.params = match['params'];
                if (typeof m.handle === "function") {
                    // this middleware is a subapp
                    if (request.url.indexOf(match.path) === 0) { // strip prefix of parent layer
                        request.url = request.url.substring(match.path.length, request.url.length);
                    }
                    request.app = app._parentApp;
                    response.app = app._parentApp;
                    if (m.stack.length > 0){
                        m(request, response, app.next);
                    } else {
                        app.next(err);
                    }
                }
                try {
                    if (err) {
                        if (m.length >= 4) {
                            m(err, request, response, app.next);
                        } else {
                            app.next(err);
                        }
                    } else {
                        // without error
                        if (m.length < 4) {
                            // this middleware does not handle error
                            m(request, response, app.next);
                        } else {
                            app.next(err);
                        }
                    }
                } catch(e) {
                    // should return 500 for uncaught error
                    app.next(e);
                }
            } else {
                app.next(err);
            }
        }
    };

    methods.forEach(function(method) {
        app[method] = function(path, middleware) {
            var handler = makeRoute(method, middleware);
            if (handler) {
                app.use(path, handler);
            }
        };
    });

    app._parentApp = null;
    app.monkeyPatch = function(req, res) {
        if (!('isExpress' in req)) {
            var oldReq = req.__proto__;
            monkeyPatchRequest.__proto__ = oldReq;
            req.__proto__ = monkeyPatchRequest;
        }
        app._parentApp = req.app;
        req.app = app;
        req.res = res;

        if (!('isExpress' in res)) {
            var oldRes = res.__proto__;
            monkeyPatchResponse.__proto__ = oldRes;
            res.__proto__ = monkeyPatchResponse;
        }
        res.app = app;
        res.req = req;
    };

    return app;
};
