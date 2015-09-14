exports = module.exports = function(app, mongoose) {

  var mongoose = require('mongoose'),
      Schema   = mongoose.Schema;

  var filmSchema = new Schema({
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
    ratingCount:    Number
  });

  mongoose.model('FilmSchema', filmSchema);

};