//File: controllers/films.js
var mongoose = require('mongoose');
var Film  = mongoose.model('FilmDet');

//GET - Return all Film in the DB
exports.findAllFilm = function(req, res) {
	Film.find(function(err, Film) {
    	if(err) res.send(500, err.message);
    	console.log('GET /films')
		res.status(200).jsonp(Film);
	}).limit(10);
};

//GET - Return a Film with specified ID
exports.findById = function(req, res) {
	Film.findById(req.params.id, function(err, film) {
    if(err) return res.send(500, err.message);

    console.log('GET /film/' + req.params.id);
		res.status(200).jsonp(film);
	});
};

//POST - Insert a new Film in the DB
exports.addFilm = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var Film = new Film({
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

	Film.save(function(err, Film) {
		if(err) return res.send(500, err.message);
    res.status(200).jsonp(Film);
	});
};

//PUT - Update a register already exists
exports.updateFilm = function(req, res) {

	Film.findById(req.params.id, function(err, Film) {
		Film.title  			= req.body.title;
		Film.director  		= req.body.director;
		Film.actors  			= req.body.actors;
		Film.genres  			= req.body.genres;
		Film.topic  			= req.body.topic;
		Film.synopsis  		= req.body.synopsis;
		Film.originalTitle  	= req.body.originalTitle;
		Film.year  			= req.body.year;
		Film.country  		= req.body.country;
		Film.rating  			= req.body.rating;
		Film.ratingCount  	= req.body.ratingCount;

		Film.save(function(err) {
			if(err) return res.send(500, err.message);
      res.status(200).jsonp(Film);
		});
	});
};

//DELETE - Delete a Film with specified ID
exports.deleteFilm = function(req, res) {
	Film.findById(req.params.id, function(err, Film) {
		Film.remove(function(err) {
			if(err) return res.send(500, err.message);
      res.status(200);
		})
	});
};
