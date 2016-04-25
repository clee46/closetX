const mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
  imageUrl: String,
  size: String,
  color: String,
  description: String,
  userId: mongoose.Schema.Types.ObjectId
});

module.exports = exports = mongoose.model('Item', itemSchema);
