var request = require("supertest")
  , expect = require("chai").expect
  , http = require("http")
  , fs = require("fs");

var express = require("../");

var datatxt = __dirname + "/fixtures/data.txt";

describe("Basic res.sendfile",function() {
  var app;

  beforeEach(function() {
    app = express();
  });

  describe("stream data:",function() {
    beforeEach(function() {
      app.use(function(req,res) {
        file = fs.createReadStream(datatxt);
        res.stream(file);
      });
    });

    it("can stream data to client",function(done) {
      request(app).get("/")
        .expect(200,"1234567890")
        .end(done);
    });

    it("returns empty body for head",function(done) {
      request(app).head("/")
        .expect("")
        .end(done);
    });
  });


  function get(path,options) {
    app.use(function(req,res) {
      res.sendfile(path,options);
    });

    return request(app).get("/");
  }

  describe("stream file data:",function() {
    it("reads file from path",function(done) {
      get(datatxt)
        .expect(200,"1234567890")
        .end(done);
    });

    it("reads file from path relative to root",function(done) {
      get("data.txt", {root: __dirname + "/fixtures/"})
        .expect(200,"1234567890")
        .end(done);
    });
  });

  describe("content headers:",function() {
    it("sets content type",function(done) {
      get(datatxt)
        .expect("Content-Type","text/plain")
        .end(done);
    });

    it("sets content length",function(done) {
      get(datatxt)
        .expect("Content-Length","10")
        .end(done);
    });
  });

  describe("path checking:",function() {
    it("should 404 if fs.stat fails",function(done) {
      get(__dirname + "/no-such-file")
        .expect(404)
        .end(done);
    });

    it("should 403 if file is a directory",function(done) {
      get(__dirname)
        .expect(403)
        .end(done);
    });

    it("should 403 if path contains ..",function(done) {
      get(__dirname + "../foobar")
        .expect(403)
        .end(done);
    });
  });

  describe("Range support",function() {
    it("sets Accept-Range",function(done) {
      get(datatxt)
        .expect("Accept-Range","bytes")
        .end(done);
    });

    it("returns 206 for Range get",function(done) {
      get(datatxt)
        .set("Range","bytes=0-4")
        .expect(206,"12345")
        .expect("Content-Range","bytes 0-4/10")
        .end(done);
    });

    it("returns 416 for unsatisfiable range",function(done) {
      get(datatxt)
        .set("Range","bytes=10-0")
        .expect(416)
        .end(done);
    });

    it("ignores Range if it is invalid",function(done) {
      get(datatxt)
        .set("Range","invalid range")
        .expect(200,"1234567890")
        .end(done);
    });
  });
});