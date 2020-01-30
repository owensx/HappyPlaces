'use strict';

var gmap;
var allHappyPlaces = [];
var markersOnMap = [];
var happyPlaceSetIndex = 0;
var maxMarkerOnMapCount = 10;
var maxHappyPlaceCount = 50;

var nextButton = initNextButton();
nextButton.addEventListener('click', function() {
    onNextButtonClick();
});

var previousButton = initPreviousButton();
previousButton.addEventListener('click', function() {
    onPreviousButtonClick();
});

var searchButton = initSearchButton();
searchButton.addEventListener('click', function() {
    var mapCenter = gmap.getCenter();
    onSearchButtonClick(mapCenter.lat(), mapCenter.lng());
});

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
            searchButton.click();
        });

	}, function(error) {
        createMap(latitude, longitude);
        gmap.setZoom(13);//TODO: better way to do this? it triggers the zoom listener
	});
}

function createMap(latitude, longitude) {
    gmap = new google.maps.Map(document.getElementById('map'), {
        zoom: 15
        , zoomControl: false
        , mapTypeControl: false
        , streetViewControlOptions:{
            position: google.maps.ControlPosition.TOP_RIGHT
        }
        , center: {lat: latitude, lng: longitude}
        , styles: [{
            featureType: "poi"
            , elementType: "labels"
            , stylers: [{
                visibility: "off"
            }]
        }]
    });

    var controlButtonsDiv = document.createElement('div');
    controlButtonsDiv.appendChild(previousButton);
    controlButtonsDiv.appendChild(nextButton);

    gmap.controls[google.maps.ControlPosition.TOP_CENTER].push(searchButton);
    gmap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlButtonsDiv);
    //gmap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(bannerDiv);

    google.maps.event.addListener(gmap, 'center_changed', function(){
        searchButton.style.display = "initial";
    });
    google.maps.event.addListener(gmap, 'zoom_changed', function(){
        searchButton.style.display = "initial";
    });
}

function initNextButton(){
    var button = document.createElement('button');
    button.id = "nextButton";
    button.innerHTML = 'Next';
    button.style.margin = "5px";
    button.style.opacity = "50%";
    button.disabled = true;

    return button;
}

function onNextButtonClick() {
    clearMarkers();
    happyPlaceSetIndex++;

    var happyPlaceSet = allHappyPlaces.slice(happyPlaceSetIndex*maxMarkerOnMapCount, (happyPlaceSetIndex*maxMarkerOnMapCount) + maxMarkerOnMapCount);
    $.each(happyPlaceSet, function(index, happyPlace) {
        var happyPlaceName = happyPlace['fields']['name'];
        var latitude = happyPlace['fields']['latitude'];
        var longitude = happyPlace['fields']['longitude'];

        addMarkerToMap(latitude, longitude, happyPlaceName);

    previousButton.style.opacity = "100%";
    previousButton.disabled = false;
    });

    if (happyPlaceSet.length < maxMarkerOnMapCount || (happyPlaceSetIndex*maxMarkerOnMapCount) + maxMarkerOnMapCount == allHappyPlaces.length) {
        nextButton.style.opacity = "50%";
        nextButton.disabled = true;
    }
}

function initPreviousButton(){
    var button = document.createElement('button');
    button.id = "previousButton";
    button.innerHTML = 'Previous';
    button.style.margin = "5px";
    button.style.opacity = "50%";
    button.disabled = true;

    return button;
}

function onPreviousButtonClick(){
    clearMarkers();
    happyPlaceSetIndex--;

    var happyPlaceSet = allHappyPlaces.slice(happyPlaceSetIndex*maxMarkerOnMapCount, (happyPlaceSetIndex*maxMarkerOnMapCount) + maxMarkerOnMapCount);
    $.each(happyPlaceSet, function(index, happyPlace) {
        var happyPlaceName = happyPlace['fields']['name'];
        var latitude = happyPlace['fields']['latitude'];
        var longitude = happyPlace['fields']['longitude'];

        addMarkerToMap(latitude, longitude, happyPlaceName);

        nextButton.style.opacity = "100%";
        nextButton.disabled = false;

        if (happyPlaceSetIndex==0) {
            previousButton.style.opacity = "50%";
            previousButton.disabled = true;
        }
    });
}

function initSearchButton(){
    var button = document.createElement('button');
    button.id = "searchButton";
    button.innerHTML = 'Search This Area';
    button.style.margin = "10px";
    button.style.display = "none";

    return button;
}

function onSearchButtonClick(latitude, longitude){
    clearMarkers();
    clearHappyPlaces();

    happyPlaceSetIndex = 0;

    nextButton.style.opacity = "50%";
    nextButton.disabled = true;
    previousButton.style.opacity = "50%";
    previousButton.disabled = true;

    searchButton.style.display = "none";

    fetchHappyPlaces(latitude, longitude, maxHappyPlaceCount, function(happyPlaces){
        allHappyPlaces = happyPlaces;
        if (allHappyPlaces.length > maxMarkerOnMapCount) {
            nextButton.style.opacity = "100%";
            nextButton.disabled = false;
        }

        var happyPlaceSet = allHappyPlaces.slice(0, maxMarkerOnMapCount);
        $.each(happyPlaceSet, function(index, happyPlace) {
            var happyPlaceName = happyPlace['fields']['name'];
            var latitude = happyPlace['fields']['latitude'];
            var longitude = happyPlace['fields']['longitude'];

            addMarkerToMap(latitude, longitude, happyPlaceName);
        });
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

                return (latitude > sw.lat()+.001 && latitude < ne.lat()-.001 && longitude > sw.lng()+.001 && longitude < ne.lng()-.001);
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