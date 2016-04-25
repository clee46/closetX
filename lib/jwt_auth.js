const User = require(__dirname + '/../models/user.js');
const jwt = require('jsonwebtoken');

/* Middleware that checks if a token is valid.  If it is, then the user is
    assigned to the request */

module.exports = exports = function (req, res, next) {
  try { // First, decode the token
    decoded = jwt.verify(req.headers.token, process.env.APP_SECRET || 'changethis');
  } catch (e) {
    res.status(401).json({msg: 'Unable to decode token'});
  }
  // Then, search database for the user ID stored in the decoded token
  User.findOne({_id: decoded.id}, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(401).json({msg: 'Error searching the database'});
    }
    if (!user) return res.status(401).json({msg: 'User was not found'});
    req.user = user;
    next();
  });
};
