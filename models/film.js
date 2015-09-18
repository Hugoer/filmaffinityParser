var mongoose = require('mongoose'),
  Schema   = mongoose.Schema;

var filmSchema = new Schema({
  idFilm:         String,
  lastUpdate:     { type: Date, default: Date.now }
});

var Film = mongoose.model('Film', filmSchema);

module.exports = Film;