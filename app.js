'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var nconf = require('nconf');
nconf.file('config.json');
var auth = require('./auth');
var router = require('./router');

//Init db
var uristring = 'mongodb://' + process.env.AUTHMONGO_PORT_27017_TCP_ADDR + ':' + process.env.AUTHMONGO_PORT_27017_TCP_PORT;
mongoose.Promise = global.Promise; //see https://github.com/Automattic/mongoose/issues/4291
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
  }
});

//Setup middleware.
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

app.listen(8083);
console.log('App started on 8083 at ' + new Date());