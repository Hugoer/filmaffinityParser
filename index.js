var Crawler = require("crawler"),
    $ = require('cheerio'),
    config = require('./config.json'),
    jsonfile = require('jsonfile'),
    fs = require('fs'),
    request = require('request'),
    giSearch = require('google-images2'),
    moment = require('moment'),
    exec = require('child_process').exec;

var log = function(obj){
    if ( config.debug ){
        console.log(obj);
    }
};
function run_cmd(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
};

var downloadThumbnail = function(uri, name ,callback){
    
    callback = callback || function( ){ };

    if ( config.downloadImages ){

        if ( uri ){

            request.head(uri, function(err, res, body){

                if ( err ){
                    
                    log(err);

                }else{
                    log('content-type:', res.headers['content-type']);
                    log('content-length:', res.headers['content-length']);

                    var stream = request(uri);
                    stream.pipe(
                        fs.createWriteStream('./IMG/'+name)
                            .on('error', function(){
                                stream.read();
                            })
                        )
                    .on('close', function() {
                        callback('Done!');
                    });                    

                }

            });

        }

    }

};

/*// Queue just one URL, with default callback
c.queue('http://joshfire.com');

// Queue a list of URLs
c.queue(['http://jamendo.com/','http://tedxparis.com']);*/

function Film( filmDirector, filmTitle, filmActors, genres, topic, synopsis, originalTitle, year, country, rating, ratingCount ){

    this.director = filmDirector;
    this.title = filmTitle;
    this.actors = filmActors; 
    this.genres = genres;
    this.topics = topic;
    this.synopsis = synopsis;
    this.originalTitle = originalTitle;
    this.year = year;
    this.country = country;
    this.rating = rating.replace(',','.');
    this.ratingCount = ratingCount;
    this.lastUpdate = moment.utc().format();
};

var filmAffinitySearch = function( title ){
    return 'http://www.filmaffinity.com/es/search.php?stype=title&stext=' + encodeURIComponent( title );
};

// var getLengthByIndex = function( character ){
//     var urlDummie = config.urlMain + character + '_1.html'
//     c.queue({
//       uri: urlDummie,
//         jQuery: true,
// userAgent: config.userAgent,
//         forceUTF8: true,
//         callback: function (error, result, $) {
//             return 
//         }
//     });    
// };

// insertIdFilm = function( idFilm ){
//     var mongoose = require('mongoose');
//     mongoose.connect('mongodb://localhost:27017/films');

//     var db = mongoose.connection;

//     // db.on('error', function (err) {
// log('connection error', err);
//     // });

//     // db.on('open', function () {
//     //     // log('Opennnn');
//     // });

//     var myFilm = require('./models/film');
//     var filmInsert = new myFilm(idFilm);

//     filmInsert.save(function( err, data ){
        
// log(err);
//         // log('Close');
//         db.close();  
//     })
// };


getAllUrl = function( urlFilmList ){
    log('getAllUrl - urlFilmList.length : ' + urlFilmList.length );
    var filmList = [];
    var c = new Crawler({
        maxConnections : config.maxConnections,
        jQuery: true,
        userAgent: config.userAgent,
        forceUTF8: true,
        callback: function (error, result, $) {
            var $actors,
                $genres,
                $topics,
                actorsList = [],
                genresList = [],
                topicsList = [],
                title,
                synopsis,
                originalTitle,
                year,
                country,
                rating,
                ratingCount,
                thumbnailName;

            if (error) {
                log(error);
            }else{
                // log('InGetDataFromUrl');
                try{
                    $actors = $($('.movie-info')[0]).find('a[href*="/es/search.php?stype=cast"]');
                    $genres = $($('.movie-info')[0]).find('a[href*="/es/moviegenre.php?genre"]');
                    $topics = $($('.movie-info')[0]).find('a[href*="/es/movietopic.php?topic"]');

                    title = $('#main-title span').text();
                    synopsis = $($($('.movie-info')[0]).find('dd').last()[0]).text();
                    originalTitle = $($('.movie-info dd')[0]).text().trim();
                    year = $($($('.movie-info')[0]).find('dd[itemprop="datePublished"]')[0]).text();
                    country = $('#country-img').parent().text().trim();
                    rating = $('#movie-rat-avg').text().trim();
                    ratingCount = $('#movie-count-rat span').text();
                    thumbnailName = $('#movie-main-image-container img').attr('src');

                    for (var i = 0; i < $actors.length; i++) {
                        actorsList.push( $($actors[i]).text().trim() );
                    };

                    for (var i = 0; i < $genres.length; i++) {
                        genresList.push( $($genres[i]).text().trim() );
                    };

                    for (var i = 0; i < $topics.length; i++) {
                        topicsList.push( $($topics[i]).text().trim() );
                    };                

                    log('Recogiendo datos de: ' + title);

                    var film = new Film( 
                                    $('.directors span a span').text() ,
                                    title,
                                    actorsList,
                                    genresList,
                                    topicsList,
                                    synopsis,
                                    originalTitle,
                                    year,
                                    country,
                                    rating,
                                    ratingCount
                                );

                    // log( film.toString() );

                    thumbnailName = thumbnailName.substring(thumbnailName.lastIndexOf('/')+1,thumbnailName.length);

                    if ( config.downloadImages ){
                        giSearch.search( title + ' ' + year + ' filmaffinity', function (err, images) {
                            
                            if ( images[0] ){
                                // downloadThumbnail( images[0].unescapedUrl, thumbnailName );
                                log ('descarga hecha: ' + images[0].unescapedUrl ) ;
                            }
                        });
                    }

                    // jsonfile.writeFileSync( config.pathFile + originalTitle.split(' ').join('_') + '.JSON' , film);
                    //film
                    filmList.push(film);

                }catch(err){
                    log ('Error: ' + err);
                }

            }
        },
        onDrain: function(){
            log('onDrain - getAllUrl');
            var mongoose = require('mongoose');
            mongoose.connect('mongodb://localhost:27017/films');

            var db = mongoose.connection;

            var myFilmDet = require('./models/filmDet');
            //movieId inserta tooooodos los ids pero en un campo y separados por comas.
            var filmInsert;
            var res = [];

            for (var i = 0; i < filmList.length; i++) {
                log('Insertando datos de: ' + filmList[i].title );
                filmInsert = new myFilmDet( filmList[i] );
                filmInsert.save(function (err) {
                    res.push(err);
                });                
            };
            
            db.close();

            if ( res.length > 0  ) log(res);
        }
    });

    c.queue(urlFilmList);    
}

getAllFilmsByCharacter = function( urlHtmlIndex ){    
    log('urlHtmlIndex on getAllFilmsByCharacter : ' + urlHtmlIndex.length );
    var movieId = [];
    var c = new Crawler({
        maxConnections : config.maxConnections,
        jQuery: true,
        userAgent: config.userAgent,
        forceUTF8: true,
        callback: function (error, result, $) {
            var movieUrl = '';
            // log(result);
            $('.fa-shadow').each(function(index, a) {
                // movieUrl = config.initialUrl + $($(a).find('.mc-title a')[0]).attr('href');
                // getDataFromUrl( movieUrl );
                movieUrl = $(a).find('.movie-card').data('movie-id');
                log(config.urlFilm + movieUrl + '.html');
                movieId.push( config.urlFilm + movieUrl + '.html');       

            });

        },
        onDrain: function(){

            getAllUrl ( movieId.slice(1,config.maxArrayElements) );
        }
    });

    //== Hacer un bucle para no meter tantísimas llamadas ( es un objeto con 114.000 urls. )
    //== Poner algo que se sepa el progreso lo más preciso posible.
    //== Revisar en 0-9 por qué faltan películas en la base de datos.
    //== Control de errores en "Insertando datos de: "
    var maxArrayElements = config.maxArrayElements,
        arraySliced = [];

    arraySpliced = urlHtmlIndex.slice(1,maxArrayElements);
    log('maxArrayElements ' + maxArrayElements );
    log('urlHtmlIndex ' + arraySpliced.length);
    c.queue(arraySpliced);
};



var getAllFilmsUrls = function(){

    var urlIndexGeneral = config.filmsPagination.split('@'),
        url = '',
        filmsUrls = []
        filmId = [];

    //http://www.filmaffinity.com/es/allfilms_0-9_1.html
    //la parte '0-9' es la que se guarda en urlIndexGeneral.
    //la parte '1' es un contador que dependerá del resultado actual, habrá que capturarlo.
    for (var i = 0; i < urlIndexGeneral.length; i++) {
        if (!!urlIndexGeneral[i]){
            var urlHtml = config.urlMain + urlIndexGeneral[i] + '_1.html'
            log('urlIndexGeneral - ' + urlHtml);
            //Cogemos la primera página de cada caracter para poder conocer cuántas páginas hay de películas que empiecen por ese caracter.
            filmsUrls.push(urlHtml);
        }
    };
    


    var c = new Crawler({
        maxConnections : config.maxConnections,
        jQuery: true,
        userAgent: config.userAgent,
        forceUTF8: true,
        callback: function (error, result, $) {
            
            var lastIndex = $($('.pager')[0]).find('a').eq(-2).text();
            var characterHref = $($('.pager')[0]).find('a').eq(-2).attr('href');
            var indexSeparator = 0,
                chr = '';

            if ( characterHref ){

                characterHref = characterHref.replace('allfilms_','');
                indexSeparator = characterHref.indexOf('_');
                chr = characterHref.substring(0,indexSeparator);

                if (lastIndex) {
                    
                    for (var j = 0; j < lastIndex; j++) {
                        var urlHtmlIndex = config.urlMain + chr + '_'+ j + '.html';
                        // log(indexSeparator  + ' - ' + chr + ' - ' + j + ' - ' + lastIndex );
                        // getAllFilmsByCharacter( urlHtmlIndex );
                        log(urlHtmlIndex)
                        filmId.push(urlHtmlIndex);
                    };
                }

            }

        },
        onDrain: function(){
            if (filmId.length > 0){
                getAllFilmsByCharacter( filmId );
            }else{
                log('No Results on getAllFilmsUrls');
            }
            
        }
    });

    log(filmsUrls.length);

    c.queue(filmsUrls);


};

var getDataFromUrl = function( url ){
    log(url);
    c.queue({
      uri: url,
        jQuery: true,
        userAgent: config.userAgent,
        forceUTF8: true,
        callback: function (error, result, $) {
            // log('InGetDataFromUrl');
            var $actors,
                $genres,
                $topics,
                actorsList = [],
                genresList = [],
                topicsList = [],
                title,
                synopsis,
                originalTitle,
                year,
                country,
                rating,
                ratingCount,
                thumbnailName;

            if (error) {
                log(error);
            }else{
                // log('InGetDataFromUrl');
                try{
                    $actors = $($('.movie-info')[0]).find('a[href*="/es/search.php?stype=cast"]');
                    $genres = $($('.movie-info')[0]).find('a[href*="/es/moviegenre.php?genre"]');
                    $topics = $($('.movie-info')[0]).find('a[href*="/es/movietopic.php?topic"]');

                    title = $('#main-title span').text();
                    synopsis = $($($('.movie-info')[0]).find('dd').last()[0]).text();
                    originalTitle = $($('.movie-info dd')[0]).text().trim();
                    year = $($($('.movie-info')[0]).find('dd[itemprop="datePublished"]')[0]).text();
                    country = $('#country-img').parent().text().trim();
                    rating = $('#movie-rat-avg').text().trim();
                    ratingCount = $('#movie-count-rat span').text();
                    thumbnailName = $('#movie-main-image-container img').attr('src');

                    for (var i = 0; i < $actors.length; i++) {
                        actorsList.push( $($actors[i]).text().trim() );
                    };

                    for (var i = 0; i < $genres.length; i++) {
                        genresList.push( $($genres[i]).text().trim() );
                    };

                    for (var i = 0; i < $topics.length; i++) {
                        topicsList.push( $($topics[i]).text().trim() );
                    };                

                    var film = new Film( 
                                    $('.directors span a span').text() ,
                                    title,
                                    actorsList,
                                    genresList,
                                    topicsList,
                                    synopsis,
                                    originalTitle,
                                    year,
                                    country,
                                    rating,
                                    ratingCount
                                );

                    // log( film.toString() );

                    thumbnailName = thumbnailName.substring(thumbnailName.lastIndexOf('/')+1,thumbnailName.length);

                    if ( config.downloadImages ){
                        giSearch.search( title + ' ' + year + ' filmaffinity', function (err, images) {
                            
                            if ( images[0] ){
                                // downloadThumbnail( images[0].unescapedUrl, thumbnailName );
                                log ('descarga hecha: ' + images[0].unescapedUrl );
                            }
                        });
                    }

                    jsonfile.writeFileSync( config.pathFile + originalTitle.split(' ').join('_') + '.JSON' , film);

                    var mongoose = require('mongoose');
                    mongoose.connect('mongodb://localhost:27017/films');

                    var db = mongoose.connection;

                    // db.on('error', function (err) {
                    log('connection error', err);
                    // });

                    // db.on('open', function () {
                    //     // log('Opennnn');
                    // });

                    var myFilm = require('./models/filmDet');
                    var filmInsert = new myFilm(film);

                    filmInsert.save(function( err, data ){
                        
                        log(err);
                        // log('Close');
                        db.close();  
                    })

                }catch(err){
                    log ('Error: ' + err);
                }

            }

        }  
    });    
};

getAllFilmsUrls();

// getDataFromUrl('http://www.filmaffinity.com//es/film186215.html');
// getDataFromUrl('http://www.filmaffinity.com/es/film832057.html');

//Realizar búsqueda por película:
// c.queue({
//   uri: filmAffinitySearch('Harry Potter'),
//     jQuery: true,
//     userAgent: config.userAgent,
//     forceUTF8: true,
//     callback: function (error, result, $) {

//         var url;

//         if (error) {
//             log(error);
//         }else{
//             log( $('#mt-content-cell #main-title').text() );
//             $('.fa-shadow').each(function(index, a) {
//                 url = config.initialUrl + $($(a).find('.mc-title a')[0]).attr('href');
//                 getDataFromUrl( url );
//             });
//         }

//     }  
// });
/*
Crear fichero log ( Hora Inicio + cambio de 'character' + Hora Fin )
Diferenciar entre series y películas.
*/