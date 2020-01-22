'use strict';
var gmap;
var allHappyPlaces = [];
var markersOnMap = [];
var happyPlaceSetIndex = 0;
var maxMarkerOnMapCount = 10;
var maxHappyPlaceCount = 50;

$(document).ready(function() {
    initMap();
});

function initMap() {
    var latitude = 40.679
    var longitude = -73.936

    navigator.geolocation.getCurrentPosition(function(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        createMap(latitude, longitude);

        google.maps.event.addListenerOnce(gmap, 'idle', function() {
            fetchHappyPlaces(latitude, longitude, maxHappyPlaceCount, function(happyPlaces){
                allHappyPlaces = happyPlaces;

                var happyPlaceSet = allHappyPlaces.slice(0, maxMarkerOnMapCount);
                $.each(happyPlaceSet, function(index, happyPlace) {
                    var happyPlaceName = happyPlace['fields']['name'];
                    var latitude = happyPlace['fields']['latitude'];
                    var longitude = happyPlace['fields']['longitude'];

                    addMarkerToMap(latitude, longitude, happyPlaceName);
                });
            });
        });

	}, function(error) {
        createMap(latitude, longitude);
        gmap.setZoom(13);//TODO: better way to do this? it triggers the zoom listener
	});
}

function createMap(latitude, longitude) {
    gmap = new google.maps.Map(document.getElementById('map'), {
        zoom: 15
        , center: {lat: latitude, lng: longitude}
        , styles: [{
            featureType: "poi"
            , elementType: "labels"
            , stylers: [{
                visibility: "off"
            }]
        }]
    });

    var nextButton = document.createElement('button');
    nextButton.id = "nextButton";
    nextButton.innerHTML = 'Next';
    nextButton.style.margin = "10px";
    nextButton.style.display = "none";

    nextButton.addEventListener('click', function() {
        clearMarkers();
        happyPlaceSetIndex++;

        var happyPlaceSet = allHappyPlaces.slice(happyPlaceSetIndex*maxMarkerOnMapCount, (happyPlaceSetIndex*maxMarkerOnMapCount) + maxMarkerOnMapCount);
        $.each(happyPlaceSet, function(index, happyPlace) {
            var happyPlaceName = happyPlace['fields']['name'];
            var latitude = happyPlace['fields']['latitude'];
            var longitude = happyPlace['fields']['longitude'];

            addMarkerToMap(latitude, longitude, happyPlaceName);
        });

        previousButton.style.display = "initial";

        if (happyPlaceSet.length < maxMarkerOnMapCount || (happyPlaceSetIndex*maxMarkerOnMapCount) + maxMarkerOnMapCount == allHappyPlaces.length) {
            nextButton.style.display = "none";
        }
    });

    var previousButton = document.createElement('button');
    previousButton.id = "previousButton";
    previousButton.innerHTML = 'Previous';
    previousButton.style.margin = "10px";
    previousButton.style.display = "none";

    previousButton.addEventListener('click', function() {
        clearMarkers();
        happyPlaceSetIndex--;

        var happyPlaceSet = allHappyPlaces.slice(happyPlaceSetIndex*maxMarkerOnMapCount, (happyPlaceSetIndex*maxMarkerOnMapCount) + maxMarkerOnMapCount);
        $.each(happyPlaceSet, function(index, happyPlace) {
            var happyPlaceName = happyPlace['fields']['name'];
            var latitude = happyPlace['fields']['latitude'];
            var longitude = happyPlace['fields']['longitude'];

            addMarkerToMap(latitude, longitude, happyPlaceName);
        });

        nextButton.style.display = "initial";

        if (happyPlaceSetIndex == 0) {
            previousButton.style.display = "none";
        }
    });

    var searchButton = document.createElement('button');
    searchButton.id = "searchButton";
    searchButton.innerHTML = 'Search This Area';
    searchButton.style.margin = "10px";
    searchButton.style.display = "none";

    searchButton.addEventListener('click', function() {
        clearMarkers();
        clearHappyPlaces();

        happyPlaceSetIndex = 0;

        var newCenter = gmap.getCenter();

        latitude = newCenter.lat();
        longitude = newCenter.lng();

        nextButton.style.display = "none";
        previousButton.style.display = "none";
        searchButton.style.display = "none";

        fetchHappyPlaces(latitude, longitude, maxHappyPlaceCount, function(happyPlaces){
            allHappyPlaces = happyPlaces;
            if (allHappyPlaces.length > maxMarkerOnMapCount) {
                $("#nextButton").css('display', "initial");
            }

            var happyPlaceSet = allHappyPlaces.slice(0, maxMarkerOnMapCount);
            $.each(happyPlaceSet, function(index, happyPlace) {
                var happyPlaceName = happyPlace['fields']['name'];
                var latitude = happyPlace['fields']['latitude'];
                var longitude = happyPlace['fields']['longitude'];

                addMarkerToMap(latitude, longitude, happyPlaceName);
            });
        });
    });

    var controlButtonsDiv = document.createElement('div');
    controlButtonsDiv.appendChild(previousButton);
    controlButtonsDiv.appendChild(nextButton);

    gmap.controls[google.maps.ControlPosition.TOP_CENTER].push(searchButton);
    gmap.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlButtonsDiv);

    google.maps.event.addListener(gmap, 'center_changed', function(){
        searchButton.style.display = "initial";
    });
    google.maps.event.addListener(gmap, 'zoom_changed', function(){
        searchButton.style.display = "initial";
    });
}

function fetchHappyPlaces(latitude, longitude, count, callback){
    var bounds = gmap.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    getHappyPlacesForLatLng(latitude, longitude, count, function(response){
        var happyPlaces = JSON.parse(response['body'])
            .filter(function(happyPlace){
                var latitude = happyPlace['fields']['latitude'];
                var longitude = happyPlace['fields']['longitude'];

                return (latitude > sw.lat() && latitude < ne.lat() && longitude > sw.lng() && longitude < ne.lng());
            });

        callback(happyPlaces);
    });
}

function addMarkerToMap(latitude, longitude, happyPlaceName){
	var marker = new google.maps.Marker({
		map: gmap
		, position: {lat: latitude, lng: longitude}
		, animation: google.maps.Animation.DROP
		, label: {
		    text: happyPlaceName
		    , fontWeight: "500"
		}
		, icon: {
		    url: 'static/icons/marker.png'
		    , labelOrigin: new google.maps.Point(10,-7)
		    , scaledSize: new google.maps.Size(22,35)
		    }
	});

	marker.addListener('click', function(){
	    gmap.panTo(marker.getPosition());
	});

    markersOnMap.push(marker);
}

function clearHappyPlaces() {
    allHappyPlaces = [];
}

function clearMarkers() {
    for (var i = 0; i < markersOnMap.length; i++) {
      markersOnMap[i].setMap(null);
    }

    markersOnMap = [];
}

function getHappyPlacesForLatLng(latitude, longitude, count, callback) {
    var url = "/happyPlaces?latitude=" + latitude + "&longitude=" + longitude + "&count=" + count;

    $.getJSON(url, function(response) {
        callback(response);
    });
}

function getTodaysHappyHours(happyPlaceId, callback) {
    var days = 'M';
    var url = "/happyHours?happyPlaceId=" + happyPlaceId + "&days=" + days;

    $.getJSON(url, function(response) {
        callback(response);
    });
}