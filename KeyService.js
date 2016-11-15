'use strict';

var redis = require('redis');
var Promise = require('bluebird');
var config = require('nconf');
var uuid = require('node-uuid');

var JWT = require('./jwt');
var EXPIRATION_TIME = config.get('key_service:expires_seconds');
//var sessionKey = require('../utils/sessionKey');
Promise.promisifyAll(redis.RedisClient.prototype);

function KeyService() {
  this.client = redis.createClient(
    process.env.REDIS_PORT_6379_TCP_PORT,
    process.env.REDIS_PORT_6379_TCP_ADDR);
  this.client.on('connect', function() {
    console.log('Redis connected.');
  });
  console.log('Connecting to Redis...');
}

// Retrieve a JWT user key
KeyService.prototype.get = function(sessionKey) {
  return this.client.getAsync(sessionKey);
};

// Generate and store a new JWT user key
KeyService.prototype.set = function(user, deviceId) {
  var userKey = uuid.v4();
  var issuedAt = new Date().getTime();
  var expiresAt = issuedAt + (EXPIRATION_TIME * 1000);

  var token = JWT.generate(user, deviceId, userKey, issuedAt, expiresAt);
  var key = "abcd123";

  var setKey = this.client.setAsync(key, userKey);
  var setExpiration = setKey.then(this.client.expireAsync(key,
                                  EXPIRATION_TIME));
  var getToken = setExpiration.then(function() {
    return token;
  });

  return getToken;
};

// Manually remove a JWT user key
KeyService.prototype.delete = function(sessionKey) {
  return this.client.delAsync(sessionKey);
};

module.exports = new KeyService();