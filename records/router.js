const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', {session: false});

const {Record} = require('./models');
const router = express.Router();

// Post to add a new record
router.post('/', jwtAuth, jsonParser, (req, res) => {
  const requiredFields = ['username', 'score'];
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Record.create({
    username: req.body.username,
    score: req.body.score,
    time: req.body.time || Infinity,
    date: req.body.date || Date.now(),
  })
      .then((record) => res.status(201).json(record.serialize()))
      .catch((err) => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
      });
});

// Get /best to find top scores
router.get('/best/', jsonParser, (req, res) => {
  Record.find({})
      .sort('-score')
      .limit(30)
      .then((records) => {
        res.status(201).json(records);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
      });
});

// Get /times to find best times
router.get('/times/', jsonParser, (req, res) => {
  Record.find({})
      .sort('-time')
      .limit(30)
      .then((records) => {
        res.status(201).json(records);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
      });
});

// Get /latest to get the most recent records
router.get('/latest/', jsonParser, (req, res) => {
  Record.find({})
      .sort('-date')
      .limit(30)
      .then((records) => {
        res.status(201).json(records);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
      });
});

router.get('/date/:username', (req, res) => {
  Record.find({username: req.params.username})
      .sort('-date')
      .limit(30)
      .then((records) => {
        res.status(201).json(records);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
      });
});

module.exports = {router};
