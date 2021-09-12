//console.log("hello");

const hotelKey = "3e6ae58f1f4304d575cb1a739147986f";

// var myHeaders = new Headers();
// myHeaders.append("Cookie", "nsw=5aea9d26ec7cf2ac30a01a527a3fa236491bb470875c5e5aad874f488dfea14e67cf72a9");

var requestOptions = {
    method: 'GET',
    headers: { 'Cookie': "nsw=5aea9d26ec7cf2ac30a01a527a3fa236491bb470875c5e5aad874f488dfea14e67cf72a9" },
    redirect: 'follow'
};
let map;
let bounds
let service;
let currentwindow;
let panel;
let infowindow;
let markers = [];

function convertKeltoCel(temperature) {
    return (temperature - 273.15).toFixed(2);
}

function getLocalhotel() {
    var latitude = localStorage.getItem('latitude');
    var longitude = localStorage.getItem('longitude');
    console.log(latitude);
    console.log(longitude);


    var formData = { lat: latitude, lng: longitude };


    $.ajax({
        type: "POST",
        url: "/localHotel",
        data: formData,
        async: true,
        success: function(result) {
            console.log(result);

            // document.getElementById("display").innerHTML = result;
            // console.log(result);
        },
        error: function(xhr, exception, thrownError) {
            console.log(xhr);
            console.log(exception);
            console.log(thrownError);


        }

    })
}

function getLocalWeather(latitude, longitude) {
    console.warn(latitude);
    console.warn(longitude);
    var formData = { lat: latitude, lng: longitude };
    $.ajax({
        type: "POST",
        url: "/localWeather",
        data: formData,
        async: true,
        success: function(result) {
            console.log(result);
            // document.getElementById("weather").style.visibility = "visible";
            document.getElementById("weatherCard").innerHTML = "";
            var weatherDetail = document.createElement('div');
            weatherDetail.setAttribute("id", "weatherDetail");
            //weatherDetail.innerHTML = `<div class="test">hello</div>`;l

            weatherDetail.innerHTML = `<div class="weather-icon" style="background-image: url(http://openweathermap.org/img/wn/${result.weather[0].icon}@2x.png)"></div>` +
                `<div class="weatherInfo">${result.weather[0].description}</div>` +
                `<div class="weatherInfo"><i class='fas fa-temperature-high'></i>${convertKeltoCel(result.main.temp_max)}</div>` +
                `<div class="weatherInfo"><i class='fas fa-temperature-low'></i>${convertKeltoCel(result.main.temp_min)}</div>` +
                `<div class="weatherInfo"><i class='fas fa-wind'></i>${result.wind.speed}</div>`;





            document.getElementById("weatherCard").appendChild(weatherDetail);
            // document.getElementById("display").innerHTML = result;
            // console.log(result);
        },
        error: function(xhr, exception, thrownError) {
            console.log(xhr);
            console.log(exception);
            console.log(thrownError);
            // var msg = "";
            // if (xhr.status === 0) {
            //     msg = "Not connect.\n Verify Network.";
            // } else if (xhr.status == 404) {
            //     msg = "Requested page not found. [404]";
            // } else if (xhr.status == 500) {
            //     msg = "Internal Server Error [500].";
            // } else if (exception === "parsererror") {
            //     msg = "Requested JSON parse failed.";
            // } else if (exception === "timeout") {
            //     msg = "Time out error.";
            // } else if (exception === "abort") {
            //     msg = "Ajax request aborted.";
            // } else {
            //     msg = "Error:" + xhr.status + " " + xhr.responseText;
            // }
            // if (callbackError) {
            //     callbackError(msg);
            // }

        }

    })


}

function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13,
        mapTypeId: 'roadmap'
    });

    var input = document.getElementById('placeSearch');
    var searchBox = new google.maps.places.SearchBox(input);
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    //var markers = [];
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            alert("nothing found, please reenter a valid place");
            return;
        }

        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        var geocoder = new google.maps.Geocoder();
        var address = document.getElementById('placeSearch').value;

        geocoder.geocode({ 'address': address }, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();

                console.log(latitude + " " + longitude);
                getLocalWeather(latitude, longitude);
                localStorage.setItem('latitude', latitude);
                localStorage.setItem('longitude', longitude);

                // document.getElementById("localhotel").addEventListener("click", getLocalHotel(latitude, longitude));
                // let hotelButton = document.createElement("button");
                // hotelButton.innerHTML = "Get hotel";
                // hotelButton.addEventListener("click", getLocalHotel(latitude, longitude));
                // //   hotelButton.onclick = getLocalHotel(latitude, longitude);
                // document.getElementById("buttonContainer").appendChild(hotelButton);

                // listNearby(map, latitude, longitude);

                // listWeather(latitude, longitude);
                // listRestaurant(latitude, longitude);
                // listHotel(latitude, longitude);

            } else {
                alert("please reenter a valid place");
            }
        });

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            // if (restaurantListener == 1) {
            //     console.log("nearby resyaurant ready");
            // }
            console.log(place);
            console.log(place.formatted_address);
            if (place.formatted_address.includes("NSW")) {
                console.log("NSW");
                NSWCovid19(map, place.formatted_address);

            } else {
                console.warn("not NSW" + place.formatted_address);
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    })
}

function NSWCovid19(map, address) {
    console.log(map);
    console.log(address);
    var formData = { name: "NSW" };

    $.ajax({
        type: "POST",
        url: "/getNSWCovid19",
        data: formData,
        async: true,
        success: function(result) {
            console.log(result);
            const markers = result.data.monitor.map((each, i) => {

                    //var currentWindow = new google.maps.Infowindow();
                    var currentWindow = new google.maps.InfoWindow({
                        content: `<div class="card">` +
                            `<div class="venue-container"><i class='fas fa-building'></i>  ${each.Venue}</div>` +
                            `<div class="address-container"><i class='fas fa-map'></i>  ${each.Address}</div>` +
                            `<div class="date-container"><i class='fas fa-calendar-alt'></i>  ${each.Date}</div>` +
                            `<div class="suburb-container"><i class='fas fa-map-marker-alt'></i>  ${each.Suburb}</div>` +

                            `</div>`
                    });

                    var covidIcon = {
                        url: "https://www.acgr.edu.au/wp-content/uploads/2020/03/Coronavirus-COVID-19.jpg",
                        scaledSize: new google.maps.Size(20.5, 29.5),
                        anchor: new google.maps.Point(20.75, 48.5) // anchor
                    }

                    var marker = new google.maps.Marker({
                        position: {
                            lat: parseFloat(each.Lat),
                            lng: parseFloat(each.Lon)
                        },
                        label: i.toString(),
                        icon: covidIcon,
                        map: map
                    })
                    marker.addListener("click", () => {
                        // 
                        console.log(each);
                        currentWindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: false,
                        });
                    })

                    return marker;

                })
                // 集成marker，集中统计在同一块区域
            new MarkerClusterer(map, markers, {
                imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            });
            // document.getElementById("display").innerHTML = result;
            // console.log(result);
        },
        error: function(xhr, exception, thrownError) {
            console.log(xhr);
            console.log(exception);
            console.log(thrownError);
            // var msg = "";
            // if (xhr.status === 0) {
            //     msg = "Not connect.\n Verify Network.";
            // } else if (xhr.status == 404) {
            //     msg = "Requested page not found. [404]";
            // } else if (xhr.status == 500) {
            //     msg = "Internal Server Error [500].";
            // } else if (exception === "parsererror") {
            //     msg = "Requested JSON parse failed.";
            // } else if (exception === "timeout") {
            //     msg = "Time out error.";
            // } else if (exception === "abort") {
            //     msg = "Ajax request aborted.";
            // } else {
            //     msg = "Error:" + xhr.status + " " + xhr.responseText;
            // }
            // if (callbackError) {
            //     callbackError(msg);
            // }

        }

    })
}

function getData(data) {
    console.log(data);
    // console.log(data.data.monitor);
    data.data.monitor.forEach(element => {
        // console.log(element)
        // console.log(element.Alert);
        // console.log(element.Lon);
    });

    // data.forEach((each) => {
    //     // console.log(each.Address);
    // })
}

var formData = { name: "John", surname: "Doe", age: "31" }; //Array 

function testAjax() {
    console.log("click");
    $.ajax({
        type: "POST",
        url: "/ajax",
        data: formData,
        // dataType: "json",

        // contentType: "application/json; charset=utf-8",
        async: true,
        success: function(result) {
            console.log(result);
            // document.getElementById("display").innerHTML = result;
            // console.log(result);
        },
        error: function(xhr, exception, thrownError) {
            console.log(xhr);
            console.log(exception);
            console.log(thrownError);


        }

    })
}



fetch("https://data.nsw.gov.au/data/dataset/0a52e6c1-bc0b-48af-8b45-d791a6d8e289/resource/f3a28eed-8c2a-437b-8ac1-2dab3cf760f9/download/covid-case-locations-20210717-1753.json", requestOptions)
    .then(response => response.json())
    .then(result =>
        getData(result),

        //  getData(result.time)
    )
    .catch(error => console.log('error', error)); //


console.log(document.getElementById("data").innerText);
console.log(typeof(document.getElementById("data").innerText));
console.log(JSON.parse(document.getElementById("data").innerText));