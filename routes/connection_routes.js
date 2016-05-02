const express = require('express');
const Item = require(__dirname + '/../models/item');
const User = require(__dirname + '/../models/user');
const Connection = require(__dirname + '/../models/connection');
const jsonParser = require('body-parser').json();
const jwtAuth = require(__dirname + '/../lib/jwt_auth');
const handleDBError = require(__dirname + '/../lib/handle_db_error');

const connectionRouter = module.exports = exports = express.Router();

/* Retrieves all connections of the authenticated user that have been accepted
   and attaches each connections' items */
connectionRouter.get('/connections', jwtAuth, (req, res) => {
  Connection.find({ user2: req.user._id, accepted: true }).exec()
    .then((connections) => {
      const connectionPromises = connections.map((connection) => {
        const connectionId = connection.user1;
        const itemProm = Item.find({ userId: connectionId }).exec();
        const userProm = User.findOne({ _id: connectionId }).exec();

        return Promise.all([itemProm, userProm])
          .then((resolutions) => {
            const items = resolutions[0];
            const user = resolutions[1];
            const username = user.username;
            const location = user.location;
            const profilePic = user.profilePic;

            return Object.assign(connection.toObject(), { items, username, location, profilePic });
          });
      });
      return Promise.all(connectionPromises);
    })
    .then((connectionsComposed) => {
      if (connectionsComposed.length === 0) return res.status(200).json({msg: "No connections"});
      res.status(200).json(connectionsComposed);
    })
    .catch((err) => handleDBError(err, res));
});

/* Retrieves all connections of the authenticated user that are pending approval
   and attaches the user's basic (non-secure) information */
connectionRouter.get('/pending', jwtAuth, (req, res) => {
  console.log('Inside pending route');
  /* Retrieve all connection requests (i.e. other users requested to connect
    with the logged in user) */
  Connection.find({ user2: req.user._id, accepted: false }).exec()
    .then((connections) => {
      console.log(connections);

      const connectionPromises = connections.map((connection) => {
        const connectionId = connection.user1;
        const userProm = User.findOne({ _id: connectionId }).exec();

        return Promise.all([userProm])
          .then((resolutions) => {
            const user = resolutions[0];
            const username = user.username;
            const location = user.location;
            const profilePic = user.profilePic;

            return Object.assign(connection.toObject(), { username, location, profilePic });
          });
        });
          console.log(connectionPromises);
          return Promise.all(connectionPromises);
      })
      .then((connectionsComposed) => {
        if (connectionsComposed.length === 0) return res.status(200).json({msg: "No pending requests"});
        res.status(200).json(connectionsComposed);
      })
      .catch((err) => handleDBError(err, res));
});


/* Create a new connection with a user if the connection does not yet exist */
connectionRouter.post('/connections', jwtAuth, jsonParser, (req, res) => {
  console.log(req.body);
  // Search for an existing connection between logged in user and requested user
  User.findOne({ _id: req.body.userId }).exec()
    .then((data) => {
      if (!data) throw new Error('Attempting to Connect to Invalid User');
      // if the user is valid, check if connection already exists
      return Connection.find({
        $or: [
          { user1: req.user._id, user2: req.body.userId, accepted: true },
          { user1: req.body.userId, user2: req.user._id, accepted: true }
        ]}).exec();
    })
    .then((data) => {
      console.log(data.length);
      if (data.length !== 0) throw new Error('Already Connected to that User');
      // if the user is valid, check if connection already exists
      return Connection.find({
        $or: [
          { user1: req.user._id, user2: req.body.userId, accepted: false },
          { user1: req.body.userId, user2: req.user._id, accepted: false }
        ]}).exec();
    })
    .then((data) => {
      console.log(data.length);
      // if it does, throw an error
      if (data.length !== 0) throw new Error('Request Already Pending');
      // if it doesn't, create the connection
      var newConnection = new Connection();
      newConnection.user1 = req.user._id;
      newConnection.user2 = req.body.userId;
      return newConnection.save();
    })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      // Check if this was an error we threw instead of a
      // mongoose promise rejection
      if (err instanceof Error) {
        return res.status(400).json({ msg: err.message });
      }
      handleDBError(err, res);
    });
});

/* Accept the pending connection invitation */
connectionRouter.put('/connections/:id', jwtAuth, jsonParser, (req, res) => {
  var connectionData = req.body;
  delete connectionData._id;

  Connection.findOne({ user1: req.params.id, user2: req.user._id, accepted: true }).exec()
    .then((data) => {
      if (data) throw new Error('Already Connected to User');
      // if the user is valid, check if connection already exists
      return Connection.update({ user1: req.params.id, user2: req.user._id }, { accepted: true }).exec();
    })
    .then((data) => {
      console.log(data);
      if (data.nModified === 0) throw new Error('No pending requests from that user');
      if (data.nModified === 1) return res.status(200).json({msg: 'Accepted connection'});
    })
    .catch((err) => {
      // Check if this was an error we threw instead of a
      // mongoose promise rejection
      if (err instanceof Error) {
        return res.status(400).json({ msg: err.message });
      }
      handleDBError(err, res);
    });
});

/* Delete a connection if you no longer want to be connected to a user.
  :id specifies the user that you want to disconnect from */
connectionRouter.delete('/connections/:id', jwtAuth, (req, res) => {

  console.log(req.params.id);
  console.log(req.user._id);

  Connection.find({
    $or: [
      { user1: req.params.id, user2: req.user._id, accepted: true },
      { user1: req.user._id, user2: req.params.id, accepted: true }
    ]}).exec()
    .then((data) => {
      console.log(data);
      if (String(req.params.id) === String(req.user._id))
        throw new Error('Cannot Delete Connection to Oneself');
      if (data.length === 0) throw new Error('You Are Not Connected To That User');
      // if the user is valid, check if connection already exists
      return Connection.remove({ user1: req.params.id, user2: req.user._id, accepted: true }).exec();
    })
    .then((data) => {
      console.log(data);
      if (data.result.n === 0) throw new Error('Connection was not deleted');
      if (data.result.n === 1) return res.status(200).json({msg: 'Deleted connection'});
    })
    .catch((err) => {
      // Check if this was an error we threw instead of a
      // mongoose promise rejection
      if (err instanceof Error) {
        return res.status(400).json({ msg: err.message });
      }
      handleDBError(err, res);
    });
});
