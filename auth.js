'use strict';

var base64url = require('base64url');
var JWT = require('./jwt');
var KeyService = require('./KeyService');

function isAuthenticated(req, res, next) {
  // Guard clauses
  var authorization = req.headers.authorization;
  if (!authorization || !(authorization.search('Bearer ') === 0)) {
    return next(new Error('401 Missing Authorization Header'));
  }
  var token = authorization.split(' ')[1];
  if (!token) {
    return next(new Error('401 Missing Bearer Token'));
  }

  // Unpack JWT
  var components = token.split('.');
  var header = JSON.parse(base64url.decode(components[0]));
  var payload = JSON.parse(base64url.decode(components[1]));
  var signature = components[2];

  // Verify JWT
  KeyService.get(payload.jti)
    .then(function(userKey) {
      var authenticated = JWT.verify(token, userKey);
      if (authenticated) {
        return next();
      }

      return next(new Error('403 Invalid Access Token'));
    });
}

module.exports = {
  isAuthenticated: isAuthenticated
};