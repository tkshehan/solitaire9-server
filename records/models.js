const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const RecordSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  time: Number,
  date: {
    type: Date,
    default: Date.now(),
  },
});

RecordSchema.methods.serialize = function() {
  return {
    username: this.username,
    score: this.score,
    time: this.time,
    date: this.date,
    id: this.id,
  };
};

const Record = mongoose.model('Record', RecordSchema);

module.exports = {Record};

