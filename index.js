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

    app.next = function() {
        var m = app.stack[index];
        if (m === undefined) {
            response.statusCode = 404;
            response.end();
            return;
        }
        index++;
        m(request, response, app.next);
    };

    return app;
};
