var request = require("supertest")
  , expect = require("chai").expect
  , http = require("http");

var express = require("../");

describe("App get method:",function() {
  var app;

  before(function() {
    app = express();
    app.get("/foo",function(req,res) {
      res.end("foo");
    });
  });

  it("should respond for GET request",function(done) {
    request(app).get("/foo").expect("foo").end(done);
  });

  it("should 404 non GET requests",function(done) {
    request(app).post("/foo").expect(404).end(done);
  });

  it("should 404 non whole path match",function(done) {
    request(app).get("/foo/bar").expect(404).end(done);
  });
});

describe("All http verbs:",function() {
  var methods,app;

  try {
    methods = require("methods");
  } catch(e) {
    methods = [];
  }

  beforeEach(function() {
    app = express();
  });

  methods.forEach(function(method) {
    it("responds to "+method,function(done) {
      app[method]("/foo",function(req,res) {
        res.end("foo");
      });

      if(method == "delete")
        method = "del";

      request(app)[method]("/foo").expect(200).end(done);
    });
  });
});