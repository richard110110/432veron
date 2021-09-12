const hotelKey = "3e6ae58f1f4304d575cb1a739147986f";

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

//Google Place library自带的initAutocompletefunction

function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13,
        mapTypeId: 'roadmap'
    });
    //获得input box的id

    var input = document.getElementById('placeSearch');
    //searchbox是google place里面自带的function
    var searchBox = new google.maps.places.SearchBox(input);
    //一旦map的bound变了，searchbox的bound跟着变
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    //var markers = [];
    //searchbox添加place——changed监听器
    searchBox.addListener('places_changed', function() {
        //get place是把seachbox推荐的地址给获取到
        var places = searchBox.getPlaces();

        //如果place长度为0，地址无效
        if (places.length == 0) {
            alert("nothing found, please reenter a valid place");
            return;
        }

        //清空所有marker

        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        //调用geocoder api，解析placesearch里的地址


        var geocoder = new google.maps.Geocoder();
        var address = document.getElementById('placeSearch').value;

        //用geocoder里的geocode函数解析address
        geocoder.geocode({ 'address': address }, function(results, status) {
            //如果解析成功，获取经纬度以及列出天气
            //如果解析不成功，地址重输
            if (status == google.maps.GeocoderStatus.OK) {
                console.log(results);
                console.log(results[0]);
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();

                console.log(latitude + " " + longitude);

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

            //打印出place的输出内容
            //得到place里的标准地址（判断是否是新洲）
            console.log(place);
            console.log(place.formatted_address);

            if (place.formatted_address.includes("NSW")) {
                console.log(place.formatted_address);
                console.log("NSW");
                //新洲触发新洲疫情数据
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

            // Create a marker for the searched place.

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

//根据map和地址触发新州疫情api
function NSWCovid19(map, address) {
    //判断map是建好的
    console.log(map.center.lat());
    console.log(map.center.lng());
    console.log(address);
    //准备一个object，用来输入到server
    var formData = { name: "NSW" };

    $.ajax({
        type: "POST",
        url: "/getNSWCovid19",
        data: formData,
        async: true,
        success: function(result) {
            console.log(result);

            //建窗口信息
            var infoWindow = new google.maps.InfoWindow();
            //根据新州疫情case信息，建所有的marker，每个case有一个marker
            markers = result.data.monitor.map((each, i) => {
                    var marker = new google.maps.Marker({
                            position: {
                                lat: parseFloat(each.Lat),
                                lng: parseFloat(each.Lon)
                            },
                            label: i.toString(),
                            map: map
                        })
                        //给每个marker加上窗口信息
                    google.maps.event.addListener(marker, "click", function(e) {
                        infoWindow.setContent(`<div> <p><i class="fas fa-building me-3"></i>${each.Address}</p><p><i class="fas fa-calendar me-3"></i>${each.Date}</p></div>`)
                        infoWindow.open(map, marker);
                    })

                    return marker;
                })
                //数据呈现密集型有很多的爆发点， 用clusterer显示那个地点的数据最多。
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
}

var formData = { name: "John", surname: "Doe", age: "31" }; //Array 

function testAjax() {
    console.log("click");
    $.ajax({
        type: "POST",
        url: "/ajax",
        data: formData,
        async: true,
        success: function(result) {
            console.log(result);
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