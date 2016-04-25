const express = require('express');
const jwtAuth = require(__dirname + '/../lib/jwtAuth');
const jsonParser = require('body-parser').json();
const Item = require(__dirname + '/../models/item');
const handleDBError = require(__dirname + '/../lib/handle_db_error');

const itemRouter = module.exports = exports = express.Router();

itemRouter.post('/items', jwtAuth, jsonParser, (req, res) => {
  var newItem = new Item(req.body);
  newItem.userId = req.user._id;
  newItem.save((err, data) => {
    if (err) return handleDBError(err, res);
    res.status(200).json(data);
  });
});
