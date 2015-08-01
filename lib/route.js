var makeRoute = function(verb, handler) {
    // If match request.method, returns another handler.
    return function(req, res, next) {
        if (req.method.toLowerCase() == verb) {
            return handler(req, res, next);
        } else {
            next();
        }
    };
};

module.exports = makeRoute;
