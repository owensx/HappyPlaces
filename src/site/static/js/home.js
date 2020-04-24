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

var todayOnlyCheckbox = document.createElement("INPUT");
todayOnlyCheckbox.setAttribute("type", "checkbox");
todayOnlyCheckbox.setAttribute("id", "checkboxId");

var todayOnlyCheckboxLabel = document.createElement('label');
todayOnlyCheckboxLabel.htmlFor = "checkboxId";
todayOnlyCheckboxLabel.innerHTML = "TODAY ONLY";
todayOnlyCheckboxLabel.setAttribute("style","font-weight: 1000");

todayOnlyCheckbox.addEventListener('click', function() {
    searchButton.click();
});

var statusMarkerMap = {
    'NONE': 'static/icons/marker.png'
    , 'ACTIVE': 'static/icons/active_marker.png'
    , 'UPCOMING': 'static/icons/marker.png'
};

//$(document).ready(function() {
//    initMap();
//});

function initMap() {
    var latitude = 40.679
    var longitude = -73.936

    navigator.geolocation.getCurrentPosition(function(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        createMap(latitude, longitude, 15);

        google.maps.event.addListenerOnce(gmap, 'idle', function() {
            searchButton.click();
        });

	}, function(error) {
        createMap(latitude, longitude, 13);
	});
}

function createMap(latitude, longitude, zoomLevel) {
    gmap = new google.maps.Map(document.getElementById('map'), {
        zoom: zoomLevel
        , zoomControl: false
        , mapTypeControl: false
        , streetViewControl: false
        , fullscreenControl: false
        , center: {lat: latitude, lng: longitude}
        , styles: [{
            featureType: "poi"
            , elementType: "labels"
            , stylers: [{visibility: "off"}]
        }]
    });

    var controlButtonsDiv = document.createElement('div');
    controlButtonsDiv.appendChild(previousButton);
    controlButtonsDiv.appendChild(searchButton);
    controlButtonsDiv.appendChild(nextButton);


    var todayButtonDiv = document.createElement('div');
    todayButtonDiv.appendChild(todayOnlyCheckbox);
    todayButtonDiv.appendChild(todayOnlyCheckboxLabel);
    todayButtonDiv.style.backgroundColor = "black";
    todayButtonDiv.style.height = "24px";
    todayButtonDiv.style.width = "90px";
    todayButtonDiv.style.borderStyle = "solid"
    todayButtonDiv.style.borderRadius = "10px";

    gmap.controls[google.maps.ControlPosition.TOP_CENTER].push(controlButtonsDiv);
    gmap.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(todayButtonDiv);
    //gmap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(bannerDiv);

    google.maps.event.addListener(gmap, 'center_changed', function(){
        searchButton.style.opacity = "100%";
        searchButton.disabled = false;
    });
    google.maps.event.addListener(gmap, 'zoom_changed', function(){
        searchButton.style.opacity = "100%";
        searchButton.disabled = false;
    });
}

function initNextButton(){
    var button = document.createElement('button');
    button.id = "nextButton";
    button.innerHTML = 'Next 10';
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
        addMarkerToMap(happyPlace);
    });

    previousButton.style.opacity = "100%";
    previousButton.disabled = false;

    if (happyPlaceSet.length < maxMarkerOnMapCount || (happyPlaceSetIndex*maxMarkerOnMapCount) + maxMarkerOnMapCount == allHappyPlaces.length) {
        nextButton.style.opacity = "50%";
        nextButton.disabled = true;
    }
}

function initPreviousButton(){
    var button = document.createElement('button');
    button.id = "previousButton";
    button.innerHTML = 'Previous 10';
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
        addMarkerToMap(happyPlace);
    });

    nextButton.style.opacity = "100%";
    nextButton.disabled = false;

    if (happyPlaceSetIndex==0) {
        previousButton.style.opacity = "50%";
        previousButton.disabled = true;
    }
}

function initSearchButton(){
    var button = document.createElement('button');
    button.id = "searchButton";
    button.innerHTML = 'Search Area';
    button.style.margin = "5px";

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
    searchButton.style.opacity = "50%";
    searchButton.disabled = true;

    var todayOnly = todayOnlyCheckbox.checked;

    fetchHappyPlaces(latitude, longitude, todayOnly, maxHappyPlaceCount, function(happyPlaces){
        allHappyPlaces = happyPlaces;
        if (allHappyPlaces.length > maxMarkerOnMapCount) {
            nextButton.style.opacity = "100%";
            nextButton.disabled = false;
        }

        var happyPlaceSet = allHappyPlaces.slice(0, maxMarkerOnMapCount);
        $.each(happyPlaceSet, function(index, happyPlace) {
            addMarkerToMap(happyPlace);
        });
    });

    $("#bannerTop").html('<p>Select A HappyPlace For HappyHour Info</p>');
    $("#bannerBottom").html('');
    if (todayOnly){
        $("#bannerBottom").html('<img src="/static/icons/active_marker.png" style="width: 22px; height:35px;"><p style="margin:auto">indicates active now!</p>');
    }

    $("#bannerDays").html(
        '<p class="dayBlock">Su</p>'+
        '<p class="dayBlock">M</p>' +
        '<p class="dayBlock">Tu</p>' +
        '<p class="dayBlock">W</p>' +
        '<p class="dayBlock">Th</p>' +
        '<p class="dayBlock">F</p>' +
        '<p class="dayBlock" style="border-right: none">Sa</p>');

}

function fetchHappyPlaces(latitude, longitude, todayOnly, count, callback){
    var bounds = gmap.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var date = new Date();

    if (todayOnly) {
        getHappyPlacesWithStatusForLatLng(latitude, longitude, ["S","M","T","W","R","F","Y"][date.getDay()], date.getHours().toString() + date.getMinutes().toString(), count, function(response){
            var happyPlaces = JSON.parse(response['body'])
                .filter(function(happyPlace){
                    var latitude = happyPlace['latitude'];
                    var longitude = happyPlace['longitude'];

                    return (latitude > sw.lat()+.001 && latitude < ne.lat()-.001 && longitude > sw.lng()+.001 && longitude < ne.lng()-.001);
                });

            callback(happyPlaces);
        });
    } else {
        getHappyPlacesForLatLng(latitude, longitude, count, function(response){
            var happyPlaces = JSON.parse(response['body'])
                .filter(function(happyPlace){
                    var latitude = happyPlace['latitude'];
                    var longitude = happyPlace['longitude'];

                    return (latitude > sw.lat()+.001 && latitude < ne.lat()-.001 && longitude > sw.lng()+.001 && longitude < ne.lng()-.001);
                });

            callback(happyPlaces);
        });
    }
}

function addMarkerToMap(happyPlace){
    var happyPlaceName = happyPlace['name'];
    var address = happyPlace['address'];
    var cross = happyPlace['cross'];
    var site = happyPlace['site'];
    var latitude = happyPlace['latitude'];
    var longitude = happyPlace['longitude'];

    var happyHours = happyPlace['happy_hours'];

    var happyPlaceStatus = happyPlace['status'];
    if(typeof happyPlaceStatus === 'undefined') {
        happyPlaceStatus = 'NONE';
    }

	var marker = new google.maps.Marker({
		map: gmap
		, position: {lat: latitude, lng: longitude}
		, animation: google.maps.Animation.DROP
		, label: {
		    text: happyPlaceName
		    , fontWeight: "500"
		}
		, icon: {
		    url: statusMarkerMap[happyPlaceStatus]
		    , labelOrigin: new google.maps.Point(10,-7)
		    , scaledSize: new google.maps.Size(21,32)
		}
	});

	marker.addListener('click', function(){
	    gmap.panTo(marker.getPosition());
	    setBannerHtml(happyPlaceName, address, cross, site, happyHours);
	});

    markersOnMap.push(marker);
}

function setBannerHtml(happyPlaceName, address, cross, site, happyHours){
	happyHours = happyHours.filter(function(happyHour){
        var dayOfWeek = [
            "sunday"
            , "monday"
            , "tuesday"
            , "wednesday"
            , "thursday"
            , "friday"
            , "saturday"
        ][new Date().getDay()];

        return happyHour[dayOfWeek];
    });

    $("#bannerTop").html(
        '<a id="bannerTopHappyPlace" href="' + site + '">' + happyPlaceName + '</a>' +
        '<p id="bannerTopAddress">' + address + '</p>'

    );

    var bannerBottomHtml = '';

	if (happyHours.length == 0){
		bannerBottomHtml = '<p style="margin: auto">' + 'No Specials Today!' + '</p>';
	} else {

		happyHours.forEach(function(happyHour){
			var start = formatTime(happyHour['start']);
			var end = formatTime(happyHour['end']);
			var notes = happyHour['notes'];

			bannerBottomHtml += '<p class="bannerBottomTime">' + ' ' + start + ' - ' + end + '</p>';

            if (notes != ''){
				bannerBottomHtml += '<p class="bannerBottomSpecial">' + notes + '</p>';
			}

		});
	}

    $("#bannerBottom").html(bannerBottomHtml);
}

function formatTime(time) {
    if (time == '04:00:00') {return 'CLOSE';}
    else if (time == '04:00:01') {return 'OPEN';}
    else {
        var splitTime = time.split(':');
        var suffix = 'a';

        var hour = parseInt(splitTime[0]);
        if (hour >= 12) {
            suffix = 'p';
        }

        if (hour > 12) {
            hour = hour - 12;
        } else if (hour == 0) {
            hour = 12;
        }

        var minute = ':' + splitTime[1];

        if (minute == ':00') {
            minute = '';
        }

        return hour.toString() + minute + suffix;
    }
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

function getHappyPlacesWithStatusForLatLng(latitude, longitude, day, time, count, callback) {
    var url = "/happyPlacesStatus?latitude="+ latitude
        + "&longitude=" + longitude
        + "&day=" + day
        + "&time=" + time
        + "&status=ACTIVE,UPCOMING"
        + "&count=" + count;

    $.getJSON(url, function(response) {
        callback(response);
    });
}
