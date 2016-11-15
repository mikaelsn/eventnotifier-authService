'use strict';

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true}
});

UserSchema.pre('save', function (next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
    if (err) return next(err);

    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  console.log(candidatePassword + " : " + this.password);
  var result = bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (!err) {
      console.log("match:" + isMatch);
      return isMatch;
    } else {
      console.log('bcrypt error: ' + err);
    }
  });
};

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', UserSchema);