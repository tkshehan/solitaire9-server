const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {User} = require('./models');
const router = express.Router();
const validateError = require('./validate');

// Post to register a new User

router.post('/', jsonParser, (req, res) => {
  const error = validateError(req);
  if (error) {
    return res.status(422).json(Object.assign({}, error, {
      code: 422,
      reason: 'ValidationError',
    }));
  }

  // Attempt to create user with validated fields
  let {username, password, firstName = '', lastName = ''} = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({username})
      .count()
      .then((count) => {
        if (count > 0) {
          return Promise.reject({
            code: 422,
            reason: 'ValidationError',
            message: 'Username already taken',
            location: 'username',
          });
        }
        // If there is no existing user, hash the password
        return User.hashPassword(password);
      })
      .then((hash) => {
        return User.create({
          username,
          password: hash,
          firstName,
          lastName,
        });
      })
      .then((user) => {
        return res.status(201).json(user.serialize());
      })
      .catch((err) => {
        if (err.reason === 'ValidationError') {
          return res.status(err.code).json(err);
        }
        res.status(500).json({code: 500, message: 'Internal server error'});
      });
});

module.exports = {router};
