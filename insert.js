var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/films');

var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error', err);
});
db.once('open', function () {
    console.log('connected.');
});

var myFilm = require('./models/film');
var filmInsert = new myFilm(
    {
    "director":"Alfonso Cuarón",
    "title":"Harry Potter y el prisionero de Azkaban ",
    "actors":["Daniel Radcliffe","Rupert Grint","Emma Watson","David Thewlis","Michael Gambon","Robbie Coltrane","Alan Rickman","Gary Oldman","Tom Felton","Timothy Spall","Emma Thompson","Maggie Smith","Pam Ferris","Mark Williams","Richard Griffiths","Robert Hardy","Matthew Lewis","Lee Ingleby","Dawn French","Julie Christie","Fiona Shaw","Oliver Phelps","James Phelps","Devon Murray"],
    "genres":["Fantástico","Aventuras","Drama"],
    "topics":["Magia","Viajes en el tiempo","Hombres lobo","Secuela"],
    "synopsis":"Cuando Harry Potter y sus amigos vuelven a Hogwarts para cursar su tercer año de estudios, se ven involucrados en un misterio: de la prisión para magos de Azkaban se ha fugado Sirius Black, un peligroso mago que fue cómplice de Lord Voldemort y que intentará vengarse de Harry Potter. El joven aprendiz de mago contribuyó en gran medida a la condena de Sirius, por lo que hay razones para temer por su vida. (FILMAFFINITY)",
    "originalTitle":"Harry Potter and the Prisoner of Azkaban (Harry Potter 3)",
    "year":"2004",
    "country":"Reino Unido",
    "rating":"6.8",
    "ratingCount":"62.680",
    "lastUpdate":"2015-09-15T22:15:38+00:00"}
);

filmInsert.save(function( err, data ){
    if (err) console.log(err);
    else console.log('Saved : ', data );
})