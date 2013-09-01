/**
 * Module dependencies
 */

var request = require('request')
  , util = require('util');


/**
 * Exports
 */

module.exports = function (config) {

  /**
   * HTTP client with default authentication
   */

  var agent = request.defaults({
    auth: {
      user: config.resource_id,
      pass: config.resource_secret
    }
  });


  /**
   * Cache authorization responses DRAFT
   */
  
  //var cache = {
  //  get: function (access_token, callback) {
  //    client.hget('auth', access_token, function (err, token) {
  //      if (err) { return callback(err); }
  //      callback(null, JSON.parse(token));
  //    });
  //  },
  //  set: function (token, callback) {
  //    var access_token = token.access_token
  //      , json = JSON.stringify(token)
  //      ; 
  //
  //    client.hset('auth', access_token, json, function (err, result) {
  //      if (err) { return callback(err); }
  //      callback(null, result);
  //    });
  //  }
  //}


  /**
   * Authorization server interaction
   */

  function authorize (access_token, scope, callback) {
//    cache.get(access_token, function (err, token) {
//      if (err) { return callback(err); }
//      if (token) { return callback(null, token); }
//
//      agent.post(config.endpoint, { 
//        json: true,
//        form: {
//          access_token: access_token,
//          client_id: client_id,
//          scope: scope
//        } 
//      }, function (err, res, body) {
//        if (err) { return callback(err); }
//        if (body.error) { return callback(body); }
//        
//        cache.set(access_token, body);
//        callback(null, body);
//      });    
//    });

    agent.post(config.endpoint, { 
      json: true,
      form: {
        access_token: access_token,
//        client_id: client_id,
        scope: scope
      } 
    }, function (err, res, body) {
      if (err) { return callback(err); }
      if (body.error) { return callback(body); }
      callback(null, body);
    });
  }


  /**
   * Middleware
   */

  function middleware (req, res, next) {

    var headers = req.headers
      , authorization = headers['authorization'] || ''
      , access_token = authorization.replace(/^Bearer\s/, '')
//      , client_id = req.query.client_id
//      , scope = req.query.scope
      ;

    // fail if there is no access token in the Authorization header
    if (!access_token || access_token === '') { 
      return next(new InvalidRequestError('Missing access token')); 
    }

//    // fail if there is no client_id in the request params
//    if (!client_id) { 
//      return next(new InvalidRequestError('Missing client id')); 
//    }

//    // fail if there is no scope in the request params
//    if (!scope) { 
//      return next(new InsufficientScopeError()); 
//    }

    // if all arguments are valid, verify the token
    authorize(access_token, config.scope, function (err, response) {
      if (err && err.error === 'insufficient_scope') {
        next(new InsufficientScopeError());
      } else if (err) {
        next(new InvalidRequestError(err.error_description));
      } else {
        req.token = response;
        next();        
      }
    });

  }

  return middleware;

};


/**
 * InvalidRequestError
 */

function InvalidRequestError(description) {
  this.name = 'InvalidRequestError';
  this.message = 'invalid_request';
  this.description = description;
  this.statusCode = 400;
  Error.call(this, this.message);
  Error.captureStackTrace(this, arguments.callee);
}

util.inherits(InvalidRequestError, Error);


/**
 * InsufficientScopeError
 */

function InsufficientScopeError() {
  this.name = 'InsufficientScopeError';
  this.message = 'insufficient_scope';
  this.description = 'Insufficient scope';
  this.statusCode = 400;
  Error.call(this, this.message);
  Error.captureStackTrace(this, arguments.callee);
}

util.inherits(InsufficientScopeError, Error);
