const express = require('express');
const jwtAuth = require(__dirname + '/../lib/jwt_auth');
const jsonParser = require('body-parser').json();
const Item = require(__dirname + '/../models/item');
const handleDBError = require(__dirname + '/../lib/handle_db_error');

const itemRouter = module.exports = exports = express.Router();

itemRouter.get('/items', jwtAuth, (req, res) => {
  Item.find({ userId: req.user._id }, (err, data) => {
    if (err) return handleDBError(err, res);
    res.status(200).json(data);
  });
});

itemRouter.post('/items', jwtAuth, jsonParser, (req, res) => {
  var newItem = new Item(req.body);
  newItem.userId = req.user._id;
  newItem.save((err, data) => {
    if (err) return handleDBError(err, res);
    res.status(200).json(data);
  });
});

itemRouter.put('/items/:id', jwtAuth, jsonParser, (req, res) => {
  var itemData = req.body;
  delete itemData._id;
  Item.update({_id: req.params.id}, itemData, (err) => {
    if (err) return handleDBError(err, res);
    res.status(200).json({msg: 'success'});
  });
});

itemRouter.delete('/items/:id', jwtAuth, (req, res) => {
  Item.remove({_id: req.params.id}, (err) => {
    if (err) return handleDBError(err, res);
    res.status(200).json({msg: 'success'});
  });
});
