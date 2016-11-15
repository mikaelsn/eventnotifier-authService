'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var express = require('express');
var router = express.Router();

var User = require('./usermodel');
var KeyService = require('./KeyService');

// Register
router.post('/users', function(req, res, next) {
  var params = _.pick(req.body, 'username', 'password');
  if (!params.username || !params.password) {
    return res.status(400).send({error: 'username and password ' +
                                'are required parameters'});
  }

  User.findOrCreate({username: params.username}, {password: params.password}, function(err, user, created) {
    if (err) {
      return res.status(400).send({error: err});
    }
    if (!created) {
      return res.status(409).send({error: 'User with that username ' +
                                  'already exists.'});
    }
    return res.status(201).send(user);
  });
});

// Login
router.post('/sessions', function(req, res, next) {
  var params = _.pick(req.body, 'username', 'password', 'deviceId');
  if (!params.username || !params.password || !params.deviceId) {
    return res.status(400).send({error: 'username, password, and deviceId ' +
                                'are required parameters'});
  }

  var user = User.findOne({username: params.username});
  var passwordMatch = function(userResult) {
    if (_.isNull(userResult)) {
      return res.status(404).send({error: 'User does not exist'});
    }
    var result = userResult.comparePassword(params.password);
    console.log("result:"+ result);
    return result;
  };

  Promise.join(user, passwordMatch, function(userResult, passwordMatchResult) {
    if (!passwordMatchResult) {
      return res.status(403).send({
        error: 'Incorrect password'
      });
    }

    return KeyService.set(userResult, params.deviceId)
        .then(function(token) {
          res.status(200).send({
            accessToken: token
          });
        });
  })
    .catch(function(error) {
      console.log(error);
      next(error);
    });
});

// Get Session
router.get('/sessions/:sessionKey', function(req, res, next) {
  var sessionKey = req.params.sessionKey;
  if (!sessionKey) {
    return res.status(400).send({error: 'sessionKey is a required parameters'});
  }

  KeyService.get(sessionKey)
    .then(function(result) {
      if (_.isNull(result)) {
        return res.status(404).send({error: 'Session does not exist or has ' +
                                    'expired. Please sign in to continue.'});
      }
      res.status(200).send({userKey: result});
    })
    .catch(function(error) {
      console.log(error);
      next(error);
    });
});

// Logout
router.delete('/sessions/:sessionKey', function(req, res, next) {
  var sessionKey = req.params.sessionKey;
  if (!sessionKey) {
    return res.status(400).send({error: 'sessionKey is a required parameter'});
  }

  KeyService.delete(sessionKey)
    .then(function(result) {
      if (!result) {
        return res.status(404).send();
      }
      res.status(204).send();
    })
    .catch(function(error) {
      console.log(error);
      next(error);
    });
});

module.exports = router;