http = require("http");

module.exports = function() {
    var index;
    var request, response;

    var app = function(req, res) {
        index = 0;
        request = req;
        response = res;
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
            response.statusCode = err? 500 : 404;
            response.end();
            return;
        } else {
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
        m(request, response, app.next);
    };

    return app;
};
