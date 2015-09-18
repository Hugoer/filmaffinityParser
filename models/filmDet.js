var mongoose = require('mongoose'),
  Schema   = mongoose.Schema;

var filmDetSchema = new Schema({
  title:          String ,
  director:       String ,
  actors:         [String],
  genres:         [String],
  topic:          String,
  synopsis:       String,
  originalTitle:  String,
  year:           Number,
  country:        String,
  rating:         Number,
  ratingCount:    Number,
  idFilm:         Number
});

var FilmDet = mongoose.model('FilmDet', filmDetSchema);

module.exports = FilmDet;