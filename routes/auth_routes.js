const express = require('express');
const User = require(__dirname + '/../models/user.js');
const jsonParser = require('body-parser').json();
const handleDBError = require(__dirname + '/../lib/handle_db_error.js');
const basicHTTP = require(__dirname + '/../lib/basic_http.js');
const emailValidation = require(__dirname + '/../lib/email_validation.js');
const saveUser = require(__dirname + '/../lib/save_new_user.js');

var authRouter = module.exports = exports = express.Router();

authRouter.post('/signup', jsonParser, (req, res) => {

  // Check that email field was not empty
  if (!(req.body.email || '').length && !emailValidation(req.body.email)) {
    return res.status(400).json({ msg: 'Please Enter an Email' });
  }

  // Check that email field contained an actual email address
  if (!emailValidation(req.body.email)) {
    return res.status(400).json({ msg: 'Please Enter a Valid Email' });
  }

  // Check that username field was not empty
  if (!(req.body.username || '').length) {
    return res.status(400).json({ msg: 'Please Enter a User Name' });
  }

  // Check that password was long enough
  if (!((req.body.password || '').length > 7)) {
    return res.status(400)
      .json({ msg: 'Please Enter a Password Longer Than 7 Characters' });
  }

  // Check that the two passwords matched
  if (!(req.body.password === req.body.confirmpassword)) {
    return res.status(400).json({ msg: 'Passwords Are Not the Same' });
  }

  // Check that the user does not already exist in the database
  User.find({
    $or: [{ 'username': req.body.username }, { 'email': req.body.email }]
  }, (err, data) => {
    if (err) return handleDBError(err, res);
    if (data.length) {
      return res.status(400)
        .json({ msg: 'User Already Exists! Please Use a Different Username' });
    }
    saveUser(req, res);
  });
});

authRouter.get('/login', basicHTTP, (req, res) => {

});
