const express = require('express');
const User = require(__dirname + '/../models/user.js');
const jsonParser = require('body-parser').json();
const handleDBError = require(__dirname + '/../lib/handle_db_error.js');
const basicHTTP = require(__dirname + '/../lib/basic_http.js');
const emailValidation = require(__dirname + '/../lib/email_validation.js');
const saveUser = require(__dirname + '/../lib/save_new_user.js');

var authRouter = module.exports = exports = express.Router();

authRouter.post('/signup', jsonParser, (req, res) => {

  if (!(req.body.email || '').length && !emailValidation(req.body.email)) {
    return res.status(400).json({ msg: 'Please Enter an Email' });
  }

  if (!emailValidation(req.body.email)) {
    return res.status(400).json({ msg: 'Please Enter a Valid Email' });
  }

  if (!(req.body.username || '').length) {
    return res.status(400).json({ msg: 'Please Enter a User Name' });
  }

  if (!((req.body.password || '').length > 7)) {
    return res.status(400)
      .json({ msg: 'Please Enter a Password Longer Than 7 Characters' });
  }

  if (!(req.body.password === req.body.confirmpassword)) {
    return res.status(400).json({ msg: 'Passwords Do Not Match' });
  }

  // Check that the user does not already exist in the database
  User.find({
    $or: [{ 'username': req.body.username },
    { 'authentication.email': req.body.email }]
  }, (err, data) => {
    if (err) return handleDBError(err, res);
    if (data.length) {
      return res.status(400)
        .json({ msg: 'User Already Exists' });
    }
    saveUser(req, res);
  });

});

authRouter.get('/login', basicHTTP, (req, res) => {
  User.findOne({ 'authentication.email': req.basicHTTP.email }, (err, user) => {

    if (err) return handleDBError(err, res);

    if (!user) return res.status(401).json({ msg: 'User Does Not Exist' });

    if (!user.comparePassword(req.basicHTTP.password)) {
      return res.status(401).json({ msg: 'Incorrect Password' });
    }

    res.json({
      msg: 'Logged in successfully!',
      token: user.generateToken()
    });
  });
});
