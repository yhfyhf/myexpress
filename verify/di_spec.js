var request = require("supertest")
  , expect = require("chai").expect
  , http = require("http");

var express = require("../");

var inject;

try {
  inject = require("../lib/injector");
} catch(e) {}

describe("app.factory",function() {
  var app, fn;
  beforeEach(function() {
    app = express();
    fn = function() {};
    app.factory("foo",fn);
  });

  it("should add a factory in app._factories",function() {
    expect(app._factories).to.be.an("object");
    expect(app._factories).to.have.property("foo",fn);
  });
});

describe("Handler Dependencies Analysis:",function() {
  function handler(foo,bar,baz) {}
  function noargs() {}

  it("extracts the parameter names",function() {
    expect(inject(noargs).extract_params()).to.deep.equal([]);
    expect(inject(handler).extract_params()).to.deep.equal(["foo","bar","baz"]);
  });
});

describe("Implement Dependencies Loader:",function() {
  var app, injector, loader;
  beforeEach(function() {
    app = express();
  });

  function load(handler,cb) {
    injector = inject(handler,app);
    loader = injector.dependencies_loader();
    loader(cb);
  }

  describe("load named dependencies:",function() {
    beforeEach(function() {
      app.factory("foo",function fooFactory(req,res,next) {
        next(null,"foo value");
      });

      app.factory("bar",function barFactory(req,res,next) {
        next(null,"bar value");
      });
    });

    it("loads values",function(done) {
      handler = function(bar,foo) {};
      load(handler,function(err,values) {
        expect(values).to.deep.equal(["bar value","foo value"]);
        done();
      });
    });
  });


  describe("dependencies error handling:",function() {
    beforeEach(function() {
      app.factory("foo",function fooFactory(req,res,next) {
        next(new Error("foo error"));
      });

      app.factory("bar",function barFactory(req,res,next) {
        throw new Error("bar error");
      });
    });

    it("gets error returned by factory",function(done) {
      function handler(foo) {};
      load(handler,function(err) {
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.equal("foo error");
        done();
      });
    });

    it("gets error thrown by factory",function(done) {
      function handler(bar) {};
      load(handler,function(err) {
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.equal("bar error");
        done();
      });
    });

    it("gets an error if factory is not defined",function(done) {
      function handler(baz) {};
      load(handler,function(err) {
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.equal("Factory not defined: baz");
        done();
      });
    });
  });

  describe("load bulitin dependencies:",function() {
    it("can load req, res, and next",function(done) {
      var req = 1,
          res = 2,
          next = 3;

      function handler(next,req,res) {}
      injector = inject(handler,app);
      loader = injector.dependencies_loader(req,res,next);
      loader(function(err,values) {
        expect(values).to.deep.equal([3,1,2]);
        done();
      });
    });
  });

  describe("pass req and res to factories",function() {
    it("can calls factories with req, res",function(done) {
      var req = 1,
          res = 2;
      app.factory("foo",function(req,res,cb) {
        cb(null,[req,res,"foo"]);
      });
      function handler(foo) {};

      injector = inject(handler,app);
      loader = injector.dependencies_loader(req,res);
      loader(function(err,values) {
        var args = values[0];
        expect(args[0]).to.equal(req);
        expect(args[1]).to.equal(res);
        done();
      });
    });
  });
});

describe("Implement Injector Invokation:",function() {
  var app, injector;
  beforeEach(function() {
    app = express();
    app.factory("foo",function(req,res,next) {
      next(null,"foo value");
    });
  });

  it("can call injector as a request handler",function(done) {
    var req = 1,
        res = 2,
        next = 3;
    function handler(res,foo) {
      expect(res).to.equal(2);
      expect(foo).to.equal("foo value");
      done();
    }
    injector = inject(handler,app);
    injector(req,res,next);
  });

  it("calls next with error if injection fails",function(done) {
    var req = 1,
        res = 2;
    function next(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.equal("Factory not defined: unknown_dep");
      done();
    }

    function handler(unknown_dep) {};
    injector = inject(handler,app);
    injector(req,res,next);
  });
});

describe("Implement app.inject",function() {
  var app;
  beforeEach(function() {
    app = express();
    app.factory("foo",function(res,req,cb) {
      cb(null,"hello from foo DI!");
    })
  });

  it("can create an injector",function(done) {
    app.use(app.inject(function (res,foo) {
      res.end(foo);
    }));
    request(app).get("/").expect("hello from foo DI!").end(done);
  });
});