const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();

router.use(bodyParser.json());

const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    alogrithm: 'HS256'
  });
};

// Login with username and password
const localAuth = passport.authenticate('local', {session: false});
router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.serialize());
  res.json({authToken});
});


// Exchange valid JWT for new one
const jtwAuth = passport.authenticate('jwt', {session: false});
router.post('/refresh', jtwAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

module.exports = {router};