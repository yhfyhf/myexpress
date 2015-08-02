var mime = require('mime');
var accepts = require('accepts');
var proto = {};
proto.isExpress = true;

proto.type = function(type) {
    this.setHeader('Content-Type', mime.lookup(type));
};

proto.default_type = function(type) {
    if (!this.hasDefaultType) {
        this.hasDefaultType = true;
        this.type(type);
    }
};

proto.redirect = function(statusCode, path) {
    if (!path) {
        path = statusCode;
        statusCode = 302;
    }
    this.writeHead(statusCode, {
        'Location': path,
        'Content-Length': 0
    });
    this.end();
};

proto.format = function(handle) {
    var req = this.req;
    var acceptTypes = Object.keys(handle);
    var accept = accepts(req);
    var primaryType = accept.types(acceptTypes);

    if (primaryType == '*/*') {
        var err = new Error("Not Acceptable");
        err.statusCode = 406;
        throw err;
    }
    this.type(primaryType);
    handle[primaryType].call(this);
};

module.exports = proto;
