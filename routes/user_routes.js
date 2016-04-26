const express = require('express');
const User = require(__dirname + '/../models/user');
const jsonParser = require('body-parser').json();
const jwtAuth = require(__dirname + '/../lib/jwt_auth');

const userRouter = module.exports = exports = express.Router();

/* Update the user's profile information */
userRouter.put('/profile', jwtAuth, jsonParser, (req, res) => {
  var userData = req.body;
  delete userData._id;
  User.update({_id: req.user._id}, userData, (err) => {
    if (err) return handleDBError(err, res);
    res.status(200).json({msg: 'Updated profile'});
  });
});
