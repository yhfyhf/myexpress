var p2re = require("path-to-regexp");

var Layer = function(path, middleware) {
    this.path = path;
    this.handle = middleware;
};

Layer.prototype['match'] = function(path) {
    path = decodeURIComponent(path);
    var pattern = this.path;
    if (pattern[pattern.length - 1] == '/') {
        // strip trailing slash
        pattern = pattern.substring(0, pattern.length - 1);
    }
    var names = [];
    var re = p2re(pattern, names, {end: false});  // `{end: false}` opens prefix matching
    if (re.test(path)) {
        var m = re.exec(path);
        var params = {};
        var i = 1;
        names.forEach(function(name){
            params[name['name']] = m[i++];
        });
        return {
            "path": m[0],
            "params": params
        };
    }
};

module.exports = Layer;
