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
    arrOfObj = [];
    // console.log(city);
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

var arrOfObj = [];

function Location(city, locationData) {
    //     "search_query": "seattle",
    //     "formatted_query": "Seattle, WA, USA",
    //     "latitude": "47.606210",
    //     "longitude": "-122.332071"
    this.search_query = city;
    this.formatted_query = locationData[0].display_name;
    this.latitude = locationData[0].lat;
    this.longitude = locationData[0].lon;
    arrOfObj.push(this);
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
    //  494a266d52bd45abb2575d8de8cc7399	mykey for weather
    let weatherKey = process.env.MYWEATHER_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${arrOfObj[0].latitude}&lon=${arrOfObj[0].longitude}&key=${weatherKey}`;

    superagent.get(url)
        .then(savedDataWeather => {
            console.log('hellllo', savedDataWeather);

            let weatherResult = savedDataWeather.body.data.map((item, idx) => {
                let weatherDescription = item.weather.description;
                let valid_date = item.valid_date;
                const weatherObjData = new Weather(weatherDescription, valid_date);
                return weatherObjData;

            });
            res.status(200).json(weatherResult);
        });
});

function Weather(weatherDescription, valid_date) {
    this.forecast = weatherDescription;
    this.time = new Date(valid_date).toDateString();
}

app.get('/trails', (req, res) => {

    // 200828621-995dc429b6b581202ec03f92e292d9f9  my trails key
    let trailsKer = process.env.TRAILS_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${arrOfObj[0].latitude}&lon=${arrOfObj[0].longitude}&maxDistance=10&key=${trailsKer}`;

    superagent.get(url)
        .then(savedTrailsData => {
            console.log(savedTrailsData.body);
            const trailsObjData = new Trails(savedTrailsData.body);
            res.status(200).json(savedTrailsData);
        });
});

function Trails(trailsData) {
    //     "name": "Rattlesnake Ledge",
    //     "location": "Riverbend, Washington",
    //     "length": "4.3",
    //     "stars": "4.4",
    //     "star_votes": "84",
    //     "summary": "An extremely popular out-and-back hike to the viewpoint on Rattlesnake Ledge.",
    //     "trail_url": "https://www.hikingproject.com/trail/7021679/rattlesnake-ledge",
    //     "conditions": "Dry: The trail is clearly marked and well maintained.",
    //     "condition_date": "2018-07-21",
    //     "condition_time": "0:00:00 "
    //   },
    //   {
    //     "name": "Mt. Si",
    //     "location": "Tanner, Washington",
    //     "length": "6.6",
    //     "stars": "4.4",
    //     "star_votes": "72",
    //     "summary": "A steep, well-maintained trail takes you atop Mt. Si with outrageous views of Puget Sound.",
    //     "trail_url": "https://www.hikingproject.com/trail/7001016/mt-si",
    //     "conditions": "Dry",
    //     "condition_date": "2018-07-22",
    //     "condition_time": "0:17:22 "


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