http = require("http");

module.exports = function() {
    var index;
    var request, response, next;

    var app = function(req, res, parentNext) {
        index = 0;
        request = req;
        response = res;
        next = parentNext; // save parentNext
        app.next();
    };

    app.listen = function(port, done) {
        var server = http.createServer(app);
        server.listen(port, done);
        return server;
    };

    app.stack = [];
    app.use = function(middleware) {
        app.stack.push(middleware);
    };

    app.next = function(err) {
        var m = app.stack[index++];
        if (m === undefined) {
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
            if (m.hasOwnProperty('use')) {
                // this middleware is a subapp
                if (m.stack.length > 0){
                    m(request, response, app.next);
                } else {
                    app.next(err);
                }
            }
            try {
                if (err && m.length >= 4) {
                    m(err, request, response, app.next);
                } else {
                    // without error or this middleware does not handle error
                    m(request, response, app.next);
                }
            } catch(e) {
                // should return 500 for uncaught error
                response.statusCode = 500;
                response.end();
                return;
            }
            app.next(err);
        }
    };

    return app;
};
