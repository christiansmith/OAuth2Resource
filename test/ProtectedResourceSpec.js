/**
 * Test dependencies
 */

var cwd = process.cwd()
  , path = require('path')
  , chai = require('chai')
  , expect = chai.expect
  , request = require('supertest')
//  , sinon = require('sinon')
  , nock = require('nock')
  ;


/**
 * Should style assertions
 */

chai.should();


/**
 * Test data
 */

var resource = {
  _id: '3c', 
  secret: '40f8404d3500cc029516'
}

var client = {
  _id: '2b', 
  secret: '89fd45975b90035b5f51'
}

var access_token = '0396f91c7703a2060099';

var config = {
  endpoint: 'http://localhost:3000/access', 
  resource_id: resource._id, 
  resource_secret: resource.secret
};


/**
 * Test app
 */

// app dependencies
var express = require('express')
  , authorize = require('../index')(config)
  , app = express()
  ;

// app config
app.configure(function () {
  app.use(express.bodyParser());
  app.use(app.router);

  // Error handler
  app.use(function (err, req, res, next) {
    var error = (err.errors)
      ? { errors: err.errors }
      : { error: err.message, error_description: err.description };
    res.send(err.statusCode || 500, error);
  });
});

// Protected route
app.get('/protected', authorize, function (req, res) {
  res.send('protected resource');
});



/**
 * Mock authorization server
 */

var whatever = nock('http://localhost:3000/')

  // valid request
  .matchHeader('Authorization', 'Basic ' + new Buffer(resource._id + ':' + resource.secret).toString('base64'))
  .post('/access', 'access_token=' + access_token + '&client_id=' + client._id + '&scope=limited')
  .reply(200, { authorized: true })

  // mismatching client
  .matchHeader('Authorization', 'Basic ' + new Buffer(resource._id + ':' + resource.secret).toString('base64'))
  .post('/access', 'access_token=' + access_token + '&client_id=unknown&scope=limited')
  .reply(400, { error: 'invalid_request', error_description: 'Client mismatch' })

  // unknown access token
  .matchHeader('Authorization', 'Basic ' + new Buffer(resource._id + ':' + resource.secret).toString('base64'))
  .post('/access', 'access_token=unknown&client_id=' + client._id + '&scope=limited')
  .reply(400, { error: 'invalid_request', error_description: 'Unknown access token' })          

  // insufficient scope
  .matchHeader('Authorization', 'Basic ' + new Buffer(resource._id + ':' + resource.secret).toString('base64'))
  .post('/access', 'access_token=' + access_token + '&client_id=' + client._id + '&scope=insufficient')
  .reply(400, { error: 'insufficient_scope', error_description: 'Insufficient scope' }) 
  ;


/**
 * Specs
 */

describe('Protected Resource Response', function () {

  describe('with a valid request', function () {

    before(function (done) {
      request(app)
        .get('/protected?client_id=' + client._id + '&scope=limited')
        .set('Authorization', 'Bearer ' + access_token)
        .end(function (error, response) {
          err = error;
          res = response;
          done();
        });
    });

    it('should respond 2xx', function () {
      res.statusCode.toString()[0].should.equal('2');
    });

    it('should check the cache for an access token object');
    it('should cache the access token object with an expiration');
    it('should set the request token');

    it('should pass through to the endpoint', function () {
      res.text.should.equal('protected resource');
    });

  });


  describe('with a missing client', function () {

    before(function (done) {
      request(app)
        .get('/protected?scope=limited')
        .set('Authorization', 'Bearer ' + access_token)
        .end(function (error, response) {
          err = error;
          res = response;
          done();
        });
    });

    it('should respond 400', function () {
      res.statusCode.should.equal(400);
    });

    it('should respond with JSON', function () {
      res.headers['content-type'].should.contain('application/json');
    });

    it('should respond with "invalid_request" error', function () {
      res.body.error.should.equal('invalid_request');
    });

    it('should respond with "Missing client id" error description', function () {
      res.body.error_description.should.equal('Missing client id');
    });

  });


  describe('with a mismatching client', function () {

    before(function (done) {
      request(app)
        .get('/protected?client_id=unknown&scope=limited')
        .set('Authorization', 'Bearer ' + access_token)
        .end(function (error, response) {
          err = error;
          res = response;
          done();
        });
    });

    it('should respond 400', function () {
      res.statusCode.should.equal(400);
    });

    it('should respond with JSON', function () {
      res.headers['content-type'].should.contain('application/json');
    });

    it('should respond with "invalid_request" error', function () {
      res.body.error.should.equal('invalid_request');
    });

    it('should respond with "Client mismatch" error description', function () {
      res.body.error_description.should.equal('Client mismatch');
    });

  });


  describe('with a missing access token', function () {

    before(function (done) {
      request(app)
        .get('/protected?client_id=' + client._id + '&scope=limited')
        .end(function (error, response) {
          err = error;
          res = response;
          done();
        });
    });

    it('should respond 400', function () {
      res.statusCode.should.equal(400);
    });

    it('should respond with JSON', function () {
      res.headers['content-type'].should.contain('application/json');
    });

    it('should respond with "invalid_request" error', function () {
      res.body.error.should.equal('invalid_request');
    });

    it('should respond with "Missing access token" error description', function () {
      res.body.error_description.should.equal('Missing access token');
    });

  });
  

  describe('with an unknown access token', function () {

    before(function (done) {
      request(app)
        .get('/protected?client_id=' + client._id + '&scope=limited')
        .set('Authorization', 'Bearer unknown')
        .end(function (error, response) {
          err = error;
          res = response;
          done();
        });
    });

    it('should respond 400', function () {
      res.statusCode.should.equal(400);
    });

    it('should respond with JSON', function () {
      res.headers['content-type'].should.contain('application/json');
    });

    it('should respond with "invalid_request" error', function () {
      res.body.error.should.equal('invalid_request');
    });

    it('should respond with "Unknown access token" error description', function () {
      res.body.error_description.should.equal('Unknown access token');
    });

  });


  describe('with an expired access token', function () {});  


  describe('with missing scope', function () {

    before(function (done) {
      request(app)
        .get('/protected?client_id=' + client._id)
        .set('Authorization', 'Bearer ' + access_token)
        .end(function (error, response) {
          err = error;
          res = response;
          done();
        });
    });

    it('should respond 400', function () {
      res.statusCode.should.equal(400);
    });

    it('should respond with JSON', function () {
      res.headers['content-type'].should.contain('application/json');
    });

    it('should respond with "insufficient_scope" error', function () {
      res.body.error.should.equal('insufficient_scope');
    });

    it('should respond with "Insufficient scope" error description', function () {
      res.body.error_description.should.equal('Insufficient scope');
    });

  });
  

  describe('with insufficient scope', function () {

    before(function (done) {
      request(app)
        .get('/protected?client_id=' + client._id + '&scope=insufficient')
        .set('Authorization', 'Bearer ' + access_token)
        .end(function (error, response) {
          err = error;
          res = response;
          done();
        });
    });

    it('should respond 400', function () {
      res.statusCode.should.equal(400);
    });

    it('should respond with JSON', function () {
      res.headers['content-type'].should.contain('application/json');
    });

    it('should respond with "insufficient_scope" error', function () {
      res.body.error.should.equal('insufficient_scope');
    });

    it('should respond with "Insufficient scope" error description', function () {
      res.body.error_description.should.equal('Insufficient scope');
    });

  });

});