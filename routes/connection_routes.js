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
      return Connection.findOne({ user1: req.user._id, user2: req.body.userId }).exec()
    })
    .then((data) => {
      // if it does, throw an error
      if (data) throw new Error('Already connected to user');
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
  Connection.update({_id: req.params.id}, { accepted: true }, (err) => {
    if (err) return handleDBError(err, res);
    res.status(200).json({msg: 'Accepted connection'});
  });
});

/* Delete a connection if you no longer want to be connected to a user.
  :id specifies the user that you want to disconnect from */
connectionRouter.delete('/connections/:id', jwtAuth, (req, res) => {
  console.log(req.params.id);
  console.log(req.user._id);
  Connection.remove({ user1: req.params.id, user2: req.user._id }, (err, data) => {
    if (err) return handleDBError(err, res);
    res.status(200).json({msg: 'Deleted connection'});
  });
});
