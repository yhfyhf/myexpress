var Layer = function(path, middleware) {
    this.path = path;
    this.handle = middleware;
};

Layer.prototype['match'] = function(pattern) {
    if (pattern.indexOf(this.path) === 0) {
        return { "path": this.path };
    } else {
        return undefined;
    }
};

module.exports = Layer;
