'use strict';

// DOTENV  ( read our enviroment variable)
// after that i should write .env file to put the secret key inside it (api keys)
require('dotenv').config();

const express = require('express');

//CORS = Cross origin resource sharing 
// to give permision for who can touch my server
const cors = require('cors');

//we need the superagent to get the response
const superagent = require('superagent');


//if the process.env.PORT true git the port inside the .env , if false will giv || PORT 3000
const PORT = process.env.PORT || 3000;
// git the express methods to app variable
const app = express();

// any one can touch my server app (open to any body)
app.use(cors());


app.get('/', (req, res) => {
    res.status(200).send('it work');
});

// http://localhost:3030/location?city=lynnwood
app.get('/location', (req, res) => {
    // // res.send('you are in the location route');
    // const locationData = require('./data/location.json');
    // console.log(locationData);
    // const locationObjData = new Location(city, locationData);
    // res.send(locationObjData);

    //  1c8585018e3ecc   my key for location
    const city = req.query.city; // we hold our data inside city variable that it have data after the (/location?data) 
    let key = process.env.LOCATIONIQ_KEY;
    let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

    superagent.get(url)
        .then(savedData => {
            // console.log(savedData);
            const locationObjData = new Location(city, savedData.body);
            res.status(200).json(locationObjData);
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
        });
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
        });
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



app.get('*', (req, res) => {
    res.status(404).send('Not Found');
});

app.use((error, req, res) => {
    res.status(500).send(error);
});



app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});