const mongoose = require('mongoose');

// user1 is the user that requests the connection
// user2 is the target of the connection request
var connectionSchema = new mongoose.Schema({
  user1: String,
  user2: String,
  accepted: { type: Boolean, default: false }
});

module.exports = exports = mongoose.model('Connection', connectionSchema);
