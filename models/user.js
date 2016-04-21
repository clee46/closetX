const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
  username: String,
  location: String,
  profilePic: String,
  authentication: {
    email: String,
    password: String
  }
});

userSchema.methods.hashPassword = function(password) {
  // user-provided password is salted 8 times to generate a hash
  // hash is stored in the schema password field and returned
  var hash = this.authentication.password = bcrypt.hashSync(password, 8);
  return hash
};

userSchema.methods.comparePassword = function(password) {
  // return true or false if argument matches the schema's password hash
  return bcrypt.compareSync(password, this.authentication.password);
};

userSchema.methods.generateToken = function() {
  // generates and returns token based on user's unique database ID
  return jwt.sign({id: this._id}, process.env.APP_SECRET || 'changethis');
};

module.exports = exports = mongoose.model('User', userSchema);
