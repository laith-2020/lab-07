'use strict';

// DOTENV  ( read our enviroment variable)
// after that i should write .env file to put the secret key inside it (api keys)
require('dotenv').config();

const express = require('express');
//CORS = Cross origin resource sharing /to give permision for who can touch my server
const cors = require('cors');
//we need the superagent to get the response
const superagent = require('superagent');
const pg = require('pg');

//if the process.env.PORT true git the port inside the .env , if false will giv || PORT 3000
const PORT = process.env.PORT || 3000;
// git the express methods to app variable
const app = express();
// any one can touch my server app (open to any body)
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);


app.get('/yelp', handlerYelp);

app.get('/', (req, res) => {
    res.status(200).send('it work');
});

// http://localhost:3030/location?city=lynnwood
app.get('/location', (req, res) => {

    let SQL = `SELECT * FROM location WHERE search_query=$1;`;
    const city = req.query.city; // we hold our data inside city variable that it have data after the (/location?data) 
    let safeValue1 = [city];

    client.query(SQL, safeValue1)
        .then(results => {
            // console.log(results);
            if (results.rows.length > 0) {
                res.status(200).json(results.rows);
            } else {
                //  1c8585018e3ecc   my key for location
                let key = process.env.LOCATIONIQ_KEY;
                let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

                superagent.get(url)
                    .then(savedData => {
                        // console.log(savedData);
                        const locationObjData = new Location(city, savedData.body);
                        let SQL2 = ` INSERT INTO location (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4)`;
                        let safeValues = [city, locationObjData.formatted_query, locationObjData.latitude, locationObjData.longitude];

                        client.query(SQL2, safeValues)
                            .then(results => {
                                res.status(200).json(locationObjData);
                                // console.log(results);
                            })
                    });
            }
        })
        .catch(error => {

            app.use((error, req, res) => {
                res.status(500).send(error);
            });
        });
});


function Location(city, locationData) {
    this.search_query = city;
    this.formatted_query = locationData[0].display_name;
    this.latitude = locationData[0].lat;
    this.longitude = locationData[0].lon;
}

// for weather
app.get('/weather', (req, res) => {

    // second way with map to render the result on the page
    // let weatherResult = weatherData.data.map((item, idx) => {
    //     const weatherObjData = new Weather(item);
    //     return weatherObjData;
    //     // console.log('heloooooo', item);
    // });
    // res.send(weatherResult);

    const city = req.query.city; // we hold our data inside city variable that it have data after the (/location?data) 
    const lat = req.query.latitude;
    const lon = req.query.longitude;
    //  494a266d52bd45abb2575d8de8cc7399	mykey for weather
    let weatherKey = process.env.MYWEATHER_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${weatherKey}`;

    superagent.get(url)
        .then(savedDataWeather => {
            let arr = [];
            savedDataWeather.body.data.forEach((item, idx) => {
                if (idx < 8) {
                    let weatherObjData = new Weather(item);
                    arr.push(weatherObjData);

                } else {
                    console.log(idx);
                }
            });
            res.status(200).json(arr);
        })
});

function Weather(weatherDescription) {
    this.forecast = weatherDescription.weather.description;
    this.time = new Date(weatherDescription.valid_date).toDateString();
}

app.get('/trails', (req, res) => {
    // 200828621-995dc429b6b581202ec03f92e292d9f9  my trails key
    let trailsKer = process.env.TRAILS_KEY;
    const lat = req.query.latitude;
    const lon = req.query.longitude;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${trailsKer}`;
    // console.log('helllllll before');
    superagent.get(url)
        .then(savedTrailsData => {
            let trailsResult = savedTrailsData.body.trails.map((item, idx) => {
                let trailsObjData = new Trails(item);
                return trailsObjData;
            });
            res.status(200).json(trailsResult);
        })

});

function Trails(trailsData) {
    this.name = trailsData.name;
    this.location = trailsData.location;
    this.length = trailsData.length;
    this.stars = trailsData.stars;
    this.star_votes = trailsData.star_votes;
    this.summary = trailsData.summary;
    this.trail_url = trailsData.trail_url;
    this.conditions = trailsData.conditions;
    this.condition_date = new Date(trailsData).toDateString();
    this.condition_time = new Date(trailsData).toTimeString();

}

//dafb748c57a66d2723ad793002acb4db

// http://localhost:3030/movies?query=amman

app.get('/movies', (req, res) => {
    const city = req.query.search_query;
    let moviesKey = process.env.MOVIES_KEY;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${moviesKey}&query=${city}`;
    // let url = `https://api.themoviedb.org/3/movie/550?api_key=${moviesKey}`;


    superagent.get(url)
        .then(moviesSavedData => {
            let moviesResult = moviesSavedData.body.results.map((item, idx) => {
                return new Movies(item);
                // console.log(moviesObject);
            })
            res.status(200).json(moviesResult);
            // .catch(error => {
            //     app.use((error, req, res) => {
            //         res.status(500).send(error);
            //     });
        });
})



function Movies(moviesData) {

    this.title = moviesData.title;
    this.overview = moviesData.overview;
    this.average_votes = moviesData.vote_average;
    this.total_votes = moviesData.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${moviesData.poster_path}`;
    this.image_url = moviesData.poster_path;
    this.popularity = moviesData.popularity;
    this.released_on = moviesData.release_date;

}

//  yelp key

// WQxD6XM_3e7vgw16-0Jy2GB6N83MXJ9xFzqZ0G9I2DjUYodB5LB_w0eU1V46st2uSJGAHOYGg1dHmjtZw9HdKBKiHYMmmXDZlUyB1iptSys37inhKrybvS_a-ekIX3Yx

// const getYelp = require("/server");
// app.get("/yelp", getYelp);

function handlerYelp(request, response) {
    let city = request.query.search_query;
    getYelp(city)
        .then(data => {
            response.status(200).send(data);
        });
}

//https://api.yelp.com/v3/businesses/search?latitude=${Location.all[0].latitude}&longitude=${Location.all[0].longitude

function getYelp(city) {
    // app.get('/yelp', (req, res) => {
    // let city = req.query.search_query;
    const url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
    return superagent
        .get(url)
        .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
        .then((savedYelpData) => {
            const yelpObject = savedYelpData.body.businesses.map((item) => {
                return new Yelp(item);
            });
            return yelpObject;
        });

}

function Yelp(yelpData) {

    this.name = yelpData.name;
    this.image_url = yelpData.image_url;
    this.price = yelpData.price;
    this.rating = yelpData.rating;
    this.url = yelpData.url;

    //   {
    //     "name": "Pike Place Chowder",
    //     "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg",
    //     "price": "$$   ",
    //     "rating": "4.5",
    //     "url": "https://www.yelp.com/biz/pike-place-chowder-seattle?adjust_creative=uK0rfzqjBmWNj6-d3ujNVA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=uK0rfzqjBmWNj6-d3ujNVA"
    //   },
    //   {
    //     "name": "Umi Sake House",
    //     "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/c-XwgpadB530bjPUAL7oFw/o.jpg",
    //     "price": "$$   ",
    //     "rating": "4.0",
    //     "url": "https://www.yelp.com/biz/umi-sake-house-seattle?adjust_creative=uK0rfzqjBmWNj6-d3ujNVA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=uK0rfzqjBmWNj6-d3ujNVA"
    //   },
    //   ...
}


app.get('*', (req, res) => {
    res.status(404).send('Not Found');
});


app.use((error, req, res) => {
    res.status(500).send(error);
});

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        });
    })