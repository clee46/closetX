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

  Item.findOne({_id: req.params.id}).exec()
    .then((item) => {
      if (String(item.userId) === String(req.user._id)) {
        Item.update({_id: req.params.id }, itemData, (err, data) => {
          if (err) return handleDBError(err, res);
          res.status(200).json({msg: 'Updated item'});
        });
      }
      else {
        res.status(200).json({msg: 'You are not authorized to update this item'});
      }
    })
});

itemRouter.delete('/items/:id', jwtAuth, (req, res) => {
  Item.findOne({_id: req.params.id}).exec()
    .then((item) => {
      if (String(item.userId) === String(req.user._id)) {
        Item.remove({_id: req.params.id}, (err) => {
          if (err) return handleDBError(err, res);
          res.status(200).json({msg: 'Deleted item'});
        });
      }
      else {
        res.status(200).json({msg: 'You are not authorized to delete this item'});
      }
    })
});
