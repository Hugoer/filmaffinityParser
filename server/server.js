var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    mongoose        = require('mongoose');

// Connection to DB
mongoose.connect('mongodb://localhost:27017/films', function(err, res) {
  if(err) throw err;
  console.log('Connected to Database');
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

// Import Models and controllers
var models     = require('../models/filmDet')(app, mongoose);
var FilmCtrl = require('../controllers/film');

// Example Route
var router = express.Router();
router.get('/', function(req, res) {
  res.send("Hello world!");
});
app.use(router);

// API routes
var films = express.Router();

films.route('/films')
  .get(FilmCtrl.findAllFilm)
  .post(FilmCtrl.addFilm);

// films.route('/films/:id')
//   .get(FilmCtrl.findById())
//   .put(FilmCtrl.updateFilm)
//   .delete(FilmCtrl.deleteFilm);

app.use('/api', films);

// Start server
app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});