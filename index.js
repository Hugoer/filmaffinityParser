var Crawler = require("crawler"),
    $ = require('cheerio'),
    config = require('./config.json'),
    jsonfile = require('jsonfile');

var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, result, $) {
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
        $('a').each(function(index, a) {
            var toQueueUrl = $(a).attr('href');
            c.queue(toQueueUrl);
        });
    }
});

var log = function(obj){
    console.log(obj);
};
/*// Queue just one URL, with default callback
c.queue('http://joshfire.com');

// Queue a list of URLs
c.queue(['http://jamendo.com/','http://tedxparis.com']);*/

function Film( filmDirector, filmTitle, filmActors, genres, topic, synopsis, originalTitle, year, country ){

    this._director = filmDirector;
    this._title = filmTitle;
    this._actors = filmActors; 

    this._genres = genres;
    this._topics = topic;
    this._synopsis = synopsis;
    this._originalTitle = originalTitle;
    this._year = year;
    this._country = country;

    this.getActors = function(){
        return JSON.stringify(this._actors);
    };

    this.toString = function(){
        // return 'Título: "' + this._title 
        //     + '" - director: "' + this._director 
        //     + '" - Sinopsis: "' + this._synopsis 
        //     + '" - Año: "' + this._year 
        //     + '" - País: ' + this._country ;
        return 'Título: "' + this._title 
            + '" - director: "' + this._director 
            + '" - Año: "' + this._year 
            + '" - País: ' + this._country ;        
    };

};

var filmAffinitySearch = function( title ){
    return 'http://www.filmaffinity.com/es/search.php?stype=title&stext=' + encodeURIComponent( title );
};

var getLengthByIndex = function( character ){
    var urlDummie = config.urlMain + character + '_1.html'
    c.queue({
      uri: urlDummie,
        jQuery: true,
        forceUTF8: true,
        callback: function (error, result, $) {
            return 
        }
    });    
};

 getAllFilmsByCharacter = function( character, index ){
    c.queue({
      uri: config.urlMain + character + '_'+ index + '.html' ,
        jQuery: true,
        forceUTF8: true,
        callback: function (error, result, $) {

            // log(result);
            $('.fa-shadow').each(function(index, a) {
                var url = config.initialUrl + $($(a).find('.mc-title a')[0]).attr('href');
                getDataFromUrl( url );
            });

        }
    });
};

var getAllFilmsUrls = function(){

    var urlIndexGeneral = config.filmsPagination.split('@'),
        url;

    //http://www.filmaffinity.com/es/allfilms_0-9_1.html
    //la parte '0-9' es la que se guarda en urlIndexGeneral.
    //la parte '1' es un contador que dependerá del resultado actual, habrá que capturarlo.
    for (var i = 0; i < urlIndexGeneral.length; i++) {
        
        //Cogemos la primera página de cada caracter para poder conocer cuántas páginas hay de películas que empiecen por ese caracter.
        c.queue({
          uri: config.urlMain + urlIndexGeneral[i] + '_' + '_1.html' ,
            jQuery: true,
            forceUTF8: true,
            callback: function (error, result, $) {

                var lastIndex = $($('.pager')[0]).find('a').eq(-2).text();
                var characterHref = $($('.pager')[0]).find('a').eq(-2).attr('href');
                var indexSeparator = 0;

                if ( characterHref ){

                    characterHref = characterHref.replace('allfilms_','');
                    indexSeparator = characterHref.indexOf('_');
                    characterHref = characterHref.substring(0,indexSeparator);

                    if (lastIndex) {
                        
                        for (var j = 0; j < lastIndex; j++) {
                            log( characterHref + ' - ' + j + ' - ' + lastIndex );
                            getAllFilmsByCharacter( characterHref, j );
                        };
                    }

                }

            }
        });

    };

};

getAllFilmsUrls();

var getDataFromUrl = function( url ){
    log(url);
    c.queue({
      uri: url,
        jQuery: true,
        forceUTF8: true,
        callback: function (error, result, $) {
            log('InGetDataFromUrl');
            var $actors,
                $genres,
                $topics,
                actorsList = [],
                genresList = [],
                topicsList = [],
                synopsis,
                originalTitle,
                year,
                country;

            if (error) {
                log(error);
            }else{
                // log('InGetDataFromUrl');
                try{
                    $actors = $($('.movie-info')[0]).find('a[href*="/es/search.php?stype=cast"]');
                    $genres = $($('.movie-info')[0]).find('a[href*="/es/moviegenre.php?genre"]');
                    $topics = $($('.movie-info')[0]).find('a[href*="/es/movietopic.php?topic"]');

                    synopsis = $($($('.movie-info')[0]).find('dd').last()[0]).text();
                    originalTitle = $($('.movie-info dd')[0]).text().trim();
                    year = $($($('.movie-info')[0]).find('dd[itemprop="datePublished"]')[0]).text();
                    country = $('#country-img').parent().text().trim();

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
                                     $('#main-title span').text(),
                                     actorsList,
                                     genresList,
                                     topicsList,
                                     synopsis,
                                     originalTitle,
                                     year,
                                     country
                                );
                    // log( $($('.movie-info dd')[0]).text().trim() );
                    log( film.toString() );
                    // log( JSON.stringify(film) );
                    // log('');
                    jsonfile.writeFileSync( config.pathFile + originalTitle.split(' ').join('_') + '.JSON' , film);
                }catch(err){
                    log ('Error: ' + err);
                }

            }

        }  
    });    
};


getDataFromUrl('http://www.filmaffinity.com//es/film186215.html');

//Realizar búsqueda por película:
/*c.queue({
  uri: filmAffinitySearch('Harry Potter'),
    jQuery: true,
    forceUTF8: true,
    callback: function (error, result, $) {

        var url;

        if (error) {
            log(error);
        }else{
            log( $('#mt-content-cell #main-title').text() );
            $('.fa-shadow').each(function(index, a) {
                url = config.initialUrl + $($(a).find('.mc-title a')[0]).attr('href');
                getDataFromUrl( url );
            });
        }

    }  
});*/
/*
Diferenciar entre series y películas.
*/