//File: controllers/films.js
var mongoose = require('mongoose');
var FilmSchema  = mongoose.model('FilmSchema');

//GET - Return all filmSchema in the DB
exports.findAllFilmSchema = function(req, res) {
	FilmSchema.find(function(err, filmSchema) {
    	if(err) res.send(500, err.message);
    	console.log('GET /films')
		res.status(200).jsonp(filmSchema);
	});
};

//GET - Return a FilmSchema with specified ID
exports.findById = function(req, res) {
	FilmSchema.findById(req.params.id, function(err, film) {
    if(err) return res.send(500, err.message);

    console.log('GET /film/' + req.params.id);
		res.status(200).jsonp(film);
	});
};

//POST - Insert a new FilmSchema in the DB
exports.addFilmSchema = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var filmSchema = new FilmSchema({
		title: 			req.body.title,
		director: 		req.body.director,
		actors: 		req.body.actors,
		genres: 		req.body.genres,
		topic: 			req.body.topic,
		synopsis: 		req.body.synopsis,
		originalTitle: 	req.body.originalTitle,
		year: 			req.body.year,
		country: 		req.body.country,
		rating: 		req.body.rating,
		ratingCount: 	req.body.ratingCount
	});

	filmSchema.save(function(err, filmSchema) {
		if(err) return res.send(500, err.message);
    res.status(200).jsonp(filmSchema);
	});
};

//PUT - Update a register already exists
exports.updateFilmSchema = function(req, res) {

	FilmSchema.findById(req.params.id, function(err, filmSchema) {
		filmSchema.title  			= req.body.title;
		filmSchema.director  		= req.body.director;
		filmSchema.actors  			= req.body.actors;
		filmSchema.genres  			= req.body.genres;
		filmSchema.topic  			= req.body.topic;
		filmSchema.synopsis  		= req.body.synopsis;
		filmSchema.originalTitle  	= req.body.originalTitle;
		filmSchema.year  			= req.body.year;
		filmSchema.country  		= req.body.country;
		filmSchema.rating  			= req.body.rating;
		filmSchema.ratingCount  	= req.body.ratingCount;

		filmSchema.save(function(err) {
			if(err) return res.send(500, err.message);
      res.status(200).jsonp(filmSchema);
		});
	});
};

//DELETE - Delete a FilmSchema with specified ID
exports.deleteFilmSchema = function(req, res) {
	FilmSchema.findById(req.params.id, function(err, filmSchema) {
		filmSchema.remove(function(err) {
			if(err) return res.send(500, err.message);
      res.status(200);
		})
	});
};
