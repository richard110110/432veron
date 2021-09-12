var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
var bodyparser = require('body-parser');
var urlencodedparser = bodyparser.urlencoded({ extended: false })
var axios = require('axios');
var request = require('request');
const { response } = require('express');

const openweatherMapAPI = "ca1fdb01ae588aa56f5c9a69553ef6c5";
const hotelKey = "3e6ae58f1f4304d575cb1a739147986f";


//var header = require('headers');
//var myHeaders = new Headers(); // Currently empty
// var LocalStorage = require('node-localstorage').LocalStorage;
// localStorage = new LocalStorage('./scratch');


/* GET home page. */
router.get('/', function(req, res, next) {
    // var myHeaders = new Headers();
    // header.append("x-rapidapi-host", "coronavirus-monitor.p.rapidapi.com");
    // header.append("x-rapidapi-key", "IoN8git50Kmshpk9GjKmLDxQOnJZp1zZhnRjsnnxAEcwDlh0PA");
    var config = {
        method: 'get',
        url: 'https://data.nsw.gov.au/data/dataset/0a52e6c1-bc0b-48af-8b45-d791a6d8e289/resource/f3a28eed-8c2a-437b-8ac1-2dab3cf760f9/download/covid-case-locations-20210717-1753.json',
        headers: {
            'Cookie': 'nsw=aeee08c4157e7d900a0452cfce2211405c648e62fc62c2cea709412fafc48ce5f3092de5'
        }
    };

    var requestOptions = {
        method: 'GET',
        headers: { "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com", "x-rapidapi-key": "IoN8git50Kmshpk9GjKmLDxQOnJZp1zZhnRjsnnxAEcwDlh0PA" },
        redirect: 'follow'
    };
    fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/latest_stat_by_country.php?country=Australia", requestOptions)
        .then(response => response.json())
        .then(result => res.render('index', { test: JSON.stringify(result) }))
        .catch(error => console.log('error', error));
    // localStorage.setItem('myFirstKey', 'myFirstValue');
    // var myHeaders = new Headers();
    // myHeaders.append("Cookie", "nsw=5aea9d26ec7cf2ac30a01a527a3fa236491bb470875c5e5aad874f488dfea14e67cf72a9");

    // var requestOptions = {
    //     method: 'GET',
    //     headers: { 'Cookie': "nsw=5aea9d26ec7cf2ac30a01a527a3fa236491bb470875c5e5aad874f488dfea14e67cf72a9" },
    //     redirect: 'follow'
    // };

    // fetch("https://data.nsw.gov.au/data/dataset/0a52e6c1-bc0b-48af-8b45-d791a6d8e289/resource/f3a28eed-8c2a-437b-8ac1-2dab3cf760f9/download/covid-case-locations-20210717-1753.json", requestOptions)
    //     .then(response => response.json())
    //     .then(result =>

    //         res.render('index', { test: JSON.stringify(result) })

    //         //  getData(result.time)
    //     )
    //     .catch(error => console.log('error', error)); //

    // fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/latest_stat_by_country.php?country=Australia", {
    //         "method": "GET",
    //         "headers": {
    //             "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
    //             "x-rapidapi-key": "IoN8git50Kmshpk9GjKmLDxQOnJZp1zZhnRjsnnxAEcwDlh0PA"
    //         }
    //     })
    //     .then(response =>
    //         res.render('index', { test: JSON.stringify(response) })
    //     )
    //     .catch(err => {
    //         console.error(err);
    //     });
});

router.get('/test', function(req, res, next) {
    res.render('result', { title: 'result page' });
})

router.post('/ajax', urlencodedparser, function(req, res, next) {
    //console.log(req.)
    console.log(req.body);
    console.log(req.body.name);
    console.log("success get ajax call");
    const result = "<button>halo</button>";
    res.send(result);
})

router.post('/localWeather', urlencodedparser, function(req, res, next) {
    // console.log(req.body.lat);
    // console.log(req.body.lng);

    var APIURL = `https://api.openweathermap.org/data/2.5/weather?lat=${req.body.lat}&lon=${req.body.lng}&appid=${openweatherMapAPI}`;
    console.log(APIURL);

    fetch(APIURL).then(response => response.json()).then(result => res.send(result));
})

router.post('/localHotel', urlencodedparser, function(req, res, next) {
    console.log(req.body.lat);
    console.log(req.body.lng);
    // res.send("hotel");
    var hotelAPI = `https://engine.hotellook.com/api/v2/lookup.json?query=${req.body.lat},${req.body.lng}&lang=en&lookFor=hotel&limit=10&token=${hotelKey}`;
    fetch(hotelAPI).then(function(response) {
            return response.json()
        }).then(function(hotelData) {
            console.log(hotelData);
            for (let i = hotelData.results.hotels.length - 1; i < hotelData.results.hotels.length; i++) {
                console.log(hotelData.results.hotels[i].locationId);
                fetch(`https://engine.hotellook.com/api/v2/static/hotels.json?locationId=${hotelData.results.hotels[i].locationId}&token=${hotelKey}`).then(function(result) {
                    return result.json();
                }).then(function(hotelList) {
                    res.send(hotelList);
                    //    console.log(hotelList);
                })
            }
            // res.send(hotelData);
        })
        // var APIURL = `https://api.openweathermap.org/data/2.5/weather?lat=${req.body.lat}&lon=${req.body.lng}&appid=${openweatherMapAPI}`;
        // console.log(APIURL);

    // fetch(APIURL).then(response => response.json()).then(result => res.send(result));
})


router.post('/getNSWCovid19', urlencodedparser, function(req, res, next) {
    //console.log(req.)
    console.log(req.body);
    console.log(req.body.name);
    console.log("success get covid19 call");

    var requestOptions = {
        method: 'GET',
        headers: { 'Cookie': "nsw=5aea9d26ec7cf2ac30a01a527a3fa236491bb470875c5e5aad874f488dfea14e67cf72a9" },
        redirect: 'follow'
    };

    var options = {
        'method': 'GET',
        'url': 'https://data.nsw.gov.au/data/dataset/0a52e6c1-bc0b-48af-8b45-d791a6d8e289/resource/f3a28eed-8c2a-437b-8ac1-2dab3cf760f9/download/covid-case-locations-20210717-1753.json',
        'headers': {
            'Cookie': 'nsw=aeee08c4157e7d900a0452cfce2211405c648e62fc62c2cea709412fafc48ce5f3092de5'
        }
    };
    // axios(config)
    //     .then(function(response) {
    //         console.log(JSON.stringify(response.data));
    //     })
    //     .catch(function(error) {
    //         console.log(error);
    //     });
    // 打开postman， 新洲apitag，code部分自动生成，frech->axios->request
    request(options, function(error, response) {
        if (error) throw new Error(error);
        //  console.log(typeof response.body);
        // trim()消除空格键，
        //  console.log(JSON.parse((response.body).trim()));
        res.send(JSON.parse((response.body).trim()));
        //res.send(JSON.parse(response.body))
    });
    // fetch("https://data.nsw.gov.au/data/dataset/0a52e6c1-bc0b-48af-8b45-d791a6d8e289/resource/f3a28eed-8c2a-437b-8ac1-2dab3cf760f9/download/covid-case-locations-20210717-1753.json", requestOptions)
    //     .then(function(response) {
    //         console.log(JSON.stringify(response))
    //         console.log(JSON.parse(response.text()));

    //         return response.json();
    //     })
    //     .then(result =>

    //         res.send(result)


    //     )
    //     .catch(error => console.log('error', error));
    // const result = "covid19 here";
})
module.exports = router;