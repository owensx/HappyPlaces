'use strict';

var gmap;
var searchCenter;
var allHappyPlaces = [];
var markersOnMap = [];
var happyPlaceSetIndex = 0;
var maxMarkerOnMapCount = 6;
var maxHappyPlaceCount = 36;
var sidebarIsOpen = false;

var selectedBannerDay = '';
var selectedHappyHours = '';

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

var statusMarkerMap = {
    'NONE': 'static/icons/marker.png'
    , 'ACTIVE': 'static/icons/active_marker.png'
    , 'UPCOMING': 'static/icons/upcoming_marker.png'
};

$(document).ready(function() {
    $("#bannerTop").html('<p class="bannerMessage">Welcome to HappyPlaces!</p>');

    $("#beerFilterButton").click(function(){
        $(this).toggleClass('dayBlockSelected'); //TODO:probably want a different css class
        searchButton.click();
    });

    $("#wellFilterButton").click(function(){
        $(this).toggleClass('dayBlockSelected'); //TODO:probably want a different css class
        searchButton.click();
    });

    $("#wineFilterButton").click(function(){
        $(this).toggleClass('dayBlockSelected'); //TODO:probably want a different css class
        searchButton.click();
    });

    $("#todayFilterButton").click(function(){
        $(this).toggleClass('dayBlockSelected'); //TODO:probably want a different css class
        $("#activeFilterButton").removeClass('dayBlockSelected'); //TODO:probably want a different css class
        searchButton.click();
    });

    $("#activeFilterButton").click(function(){
        $(this).toggleClass('dayBlockSelected'); //TODO:probably want a different css class
        $("#todayFilterButton").removeClass('dayBlockSelected'); //TODO:probably want a different css class
        searchButton.click();
    });

    var filtersSidebarButtonTop = parseInt($("#filtersSidebar").css('top')) + parseInt($("#filtersSidebar").css('height'))/2;
    $("#filtersSidebarButton").css('top', filtersSidebarButtonTop);
    $("#filtersSidebarButton").click(function(){
        toggleSidebar();
        $("#filtersSidebarButtonPopup").fadeOut({"duration":"slow", "start":function(){$("#filtersSidebarButtonPopup").css('transition','0s')}});
    });

    $("#filtersSidebarButtonPopup").css('top', filtersSidebarButtonTop);
    $("#filtersSidebarButtonPopup").css('height', parseInt($("#filtersSidebarButton").css('height')));
    $("#filtersSidebarButtonPopup").css('line-height', $("#filtersSidebarButton").css('height'));
    $("#filtersSidebarButtonPopup").css('left', parseInt($("#filtersSidebarButton").css('width')));
    $("#filtersSidebarButtonPopup").click(function(){
        toggleSidebar();
        $("#filtersSidebarButtonPopup").fadeOut({"duration":"slow", "start":function(){$("#filtersSidebarButtonPopup").css('transition','0s')}});
    });

    var dividerWidth =
        $($(".filterButton").get(0)).innerWidth()
        - parseInt($($(".filterButton").get(0)).css('marginLeft')) - parseInt($($(".filterButton").get(0)).css('marginRight'))
        - parseInt($($(".filterButton").get(0)).css('paddingLeft')) - parseInt($($(".filterButton").get(0)).css('paddingRight'));

    $("#filtersDivider").width(dividerWidth);
});

function initMap() {
    var latitude = 40.679
    var longitude = -73.936
    createMap(latitude, longitude, 13);

// commenting until we support SSL
//    navigator.geolocation.getCurrentPosition(function(position) {
//        latitude = position.coords.latitude;
//        longitude = position.coords.longitude;
//
//        createMap(latitude, longitude, 15);
//
//
//
//        google.maps.event.addListenerOnce(gmap, 'idle', function() {
//            searchButton.click();
//        });
//
//	}, function(error) {
//        createMap(latitude, longitude, 13);
//	});
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

    //for some reason, on apple devices the height of the map div gets set to 0
    //manually updating the height here
    //the 85% comes from the css, they should always match
    //search FINDME-1
    var height = .85 * $('body').height();
    document.getElementById('map').setAttribute("style","height:" + height + "px");

    var controlButtonsDiv = document.createElement('div');
    controlButtonsDiv.appendChild(previousButton);
    controlButtonsDiv.appendChild(searchButton);
    controlButtonsDiv.appendChild(nextButton);

    gmap.controls[google.maps.ControlPosition.TOP_CENTER].push(controlButtonsDiv);
    //gmap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(bannerDiv);

    google.maps.event.addListener(gmap, 'center_changed', function(){
        searchButton.style.opacity = "100%";
    });
    google.maps.event.addListener(gmap, 'zoom_changed', function(){
        searchButton.style.opacity = "100%";
    });
    google.maps.event.addListener(gmap, 'click', function(){
        setDefaultBannerHtml();
        //TODO clear all info windows
        //TODO reset all markers
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
        addMarkerToMap(happyPlace);
    });

    previousButton.style.opacity = "100%";
    previousButton.disabled = false;

    if (happyPlaceSet.length < maxMarkerOnMapCount || (happyPlaceSetIndex*maxMarkerOnMapCount) + maxMarkerOnMapCount == allHappyPlaces.length) {
        nextButton.style.opacity = "50%";
        nextButton.disabled = true;
    }

    gmap.panTo(searchCenter);
}

function initPreviousButton(){
    var button = document.createElement('button');
    button.id = "previousButton";
    button.innerHTML = 'Prev';
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

    gmap.panTo(searchCenter);
}

function initSearchButton(){
    var button = document.createElement('button');
    button.id = "searchButton";
    button.innerHTML = 'Search';
    button.style.margin = "5px";

    return button;
}

function onSearchButtonClick(latitude, longitude){
    clearMarkers();
    clearHappyPlaces();

    happyPlaceSetIndex = 0;
    searchCenter = {lat: latitude, lng: longitude};

    nextButton.style.opacity = "50%";
    nextButton.disabled = true;
    previousButton.style.opacity = "50%";
    previousButton.disabled = true;
    searchButton.style.opacity = "50%";

    var beer = $("#beerFilterButton").attr('class').includes('dayBlockSelected');
    var well = $("#wellFilterButton").attr('class').includes('dayBlockSelected');
    var wine = $("#wineFilterButton").attr('class').includes('dayBlockSelected');
    var todayOnly = $("#todayFilterButton").attr('class').includes('dayBlockSelected');
    var activeOnly = $("#activeFilterButton").attr('class').includes('dayBlockSelected');


    fetchHappyPlaces(latitude, longitude, todayOnly, activeOnly, beer, well, wine, maxHappyPlaceCount, function(happyPlaces){

        allHappyPlaces = happyPlaces;

        if (allHappyPlaces.length == 0) {
            setNoResultsBannerHtml();
        } else {
            setDefaultBannerHtml();
        }

        if (allHappyPlaces.length > maxMarkerOnMapCount) {
            nextButton.style.opacity = "100%";
            nextButton.disabled = false;
        }

        var happyPlaceSet = allHappyPlaces.slice(0, maxMarkerOnMapCount);
        $.each(happyPlaceSet, function(index, happyPlace) {
            addMarkerToMap(happyPlace);
        });
    });

}

function fetchHappyPlaces(latitude, longitude, todayOnly, activeOnly, beer, well, wine, count, callback){
    var bounds = gmap.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var date = new Date();

    var happyPlacesRequest = {
        "latitude": latitude
        , "longitude": longitude
        , "statusDay": ["S","M","T","W","R","F","Y"][date.getDay()]
        , "statusTime": ("0" + date.getHours().toString()).slice(-2) + ("0" + date.getMinutes().toString()).slice(-2)
        , "count": count
    };

    if (todayOnly) {
        happyPlacesRequest["days"] = ["S","M","T","W","R","F","Y"][date.getDay()];
        happyPlacesRequest["status"] = "ACTIVE,UPCOMING";
    }

    if (activeOnly) {
        happyPlacesRequest["days"] = ["S","M","T","W","R","F","Y"][date.getDay()];
        happyPlacesRequest["status"] = "ACTIVE";
    }

    if (beer) {
        happyPlacesRequest["days"] = 1;
    }
    if (well) {
        happyPlacesRequest["well"] = 1;
    }
    if (wine) {
        happyPlacesRequest["wine"] = 1;
    }

    getHappyPlacesForLatLng(happyPlacesRequest, function(response){
        var happyPlaces = JSON.parse(response['body'])
            .filter(function(happyPlace){
                var latitude = happyPlace['latitude'];
                var longitude = happyPlace['longitude'];

                return (latitude > sw.lat()+.001 && latitude < ne.lat()-.001 && longitude > sw.lng()+.001 && longitude < ne.lng()-.001);
            });

        callback(happyPlaces);
    });
}

function addMarkerToMap(happyPlace){
    var happyPlaceName = happyPlace['name'];
    var latitude = happyPlace['latitude'];
    var longitude = happyPlace['longitude'];

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
		    , scaledSize: new google.maps.Size(22.5,30)
		}
	});

	marker.addListener('click', function(){
	    //TODO clear all info windows
	    //TODO reset all markers
	    gmap.panTo(marker.getPosition());
	    setSelectedBannerHtml(happyPlace);
	    //marker.setAnimation(google.maps.Animation.BOUNCE);
	});

    markersOnMap.push(marker);
}

function setSelectedBannerHtml(happyPlace){
    var dayOfWeek = [
        "sunday"
        , "monday"
        , "tuesday"
        , "wednesday"
        , "thursday"
        , "friday"
        , "saturday"
    ][new Date().getDay()];

    var happyPlaceName = happyPlace['name'];
    var happyPlaceGoogleId = happyPlace['google_place_id'];
    var address = happyPlace['address'];
    var site = happyPlace['site'];
    var happyHours = happyPlace['happy_hours'];
    var instagram_handle = happyPlace['instagram_handle'];

    $("#bannerDays").html(
        '<button id="sundayDayBlock" class="dayBlock" onclick="bannerDayOnClick(\'sunday\')">Su</button>'+
        '<button id="mondayDayBlock" class="dayBlock" onclick="bannerDayOnClick(\'monday\')">M</button>' +
        '<button id="tuesdayDayBlock" class="dayBlock" onclick="bannerDayOnClick(\'tuesday\')">Tu</button>' +
        '<button id="wednesdayDayBlock" class="dayBlock" onclick="bannerDayOnClick(\'wednesday\')">W</button>' +
        '<button id="thursdayDayBlock" class="dayBlock" onclick="bannerDayOnClick(\'thursday\')">Th</button>' +
        '<button id="fridayDayBlock" class="dayBlock" onclick="bannerDayOnClick(\'friday\')">F</button>' +
        '<button id="saturdayDayBlock" class="dayBlock" onclick="bannerDayOnClick(\'saturday\')">Sa</button>');


    selectedHappyHours = happyHours;

    selectedBannerDay = document.getElementById(dayOfWeek + "DayBlock");
    selectedBannerDay.className = "dayBlockSelected";
    setBottomBannerHtml(dayOfWeek);

    var bannerTopHtml = '';

    if (site != null) {
        bannerTopHtml +=
            '<div id="bannerTopHappyPlaceInfo">' +
                '<a id="bannerTopHappyPlace" href="' + site + '">' + happyPlaceName + '</a>' +
                '<p id="bannerTopAddress">' + address + '</p>' +
            '</div>';
    } else {
        bannerTopHtml +=
            '<div id="bannerTopHappyPlaceInfo">' +
                '<p id="bannerTopHappyPlace" style="color:black">' + happyPlaceName + '</p>' +
                '<p id="bannerTopAddress">' + address + '</p>' +
            '</div>';
    }

    bannerTopHtml +=
        '<div id="bannerTopIcons" class="iconContainer">' +
            '<a href="https://www.google.com/maps/search/?api=1&query=Google&query_place_id=' + happyPlaceGoogleId + '">' +
                '<img src="/static/icons/mapsicon.png" style="width:28px;height:31px">' +
            '</a>';

    if (instagram_handle != null){
        bannerTopHtml +=
            '<a href="https://instagram.com/' + instagram_handle + '">' +
                '<img src="/static/icons/instaicon.png" style="width:35px;height:35px">' +
            '</a>'
    }

    bannerTopHtml += '</div>';

    $("#bannerTop").html(bannerTopHtml);
}

function bannerDayOnClick(dayOfWeek){
    selectedBannerDay.className = "dayBlock";

    selectedBannerDay = document.getElementById(dayOfWeek + "DayBlock");
    selectedBannerDay.className = "dayBlockSelected";
    setBottomBannerHtml(dayOfWeek);
}

function setDefaultBannerHtml(){
    $("#bannerTop").html('<p class="bannerMessage">Select A HappyPlace for happy hour details.</p>');
    $("#bannerDays").html('');
    $("#bannerBottom").html(
        '<img src="/static/icons/active_marker.png" style="height:30px;">' +
        '<p class="bannerDefaultLegendText">Happening Now</p>' +
        '<img src="/static/icons/upcoming_marker.png" style="height:30px;">' +
        '<p class="bannerDefaultLegendText">Upcoming Today</p>'
    );
}

function setNoResultsBannerHtml(){
    $("#bannerTop").html('<p class="bannerMessage">No results! Try zooming out, or removing a filter.</p>');
    $("#bannerDays").html('');
    $("#bannerBottom").html('');
}

function setBottomBannerHtml(dayOfWeek){
	var happyHours = selectedHappyHours.filter(function(happyHour){
        return happyHour[dayOfWeek];
    });

    var bannerBottomHtml = '';

	if (happyHours.length == 0){
		bannerBottomHtml = '<p class="bannerMessage">' + 'No Specials :(' + '</p>';
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

function getHappyPlacesForLatLng(happyPlacesRequest, callback) {
    var url = "/happyPlaces?latitude=" + happyPlacesRequest["latitude"]
        + "&longitude=" + happyPlacesRequest["longitude"]
        + "&statusDay=" + happyPlacesRequest["statusDay"]
        + "&statusTime=" + happyPlacesRequest["statusTime"]
        + "&count=" + happyPlacesRequest["count"];

    if (happyPlacesRequest["days"] != null) {
        url += "&days=" + happyPlacesRequest["days"];
    }

    if (happyPlacesRequest["status"] != null) {
        url += "&status=" + happyPlacesRequest["status"];
    }

    if (happyPlacesRequest["beer"] != null) {
        url += "&beer=" + happyPlacesRequest["beer"];
    }

    if (happyPlacesRequest["well"] != null) {
        url += "&well=" + happyPlacesRequest["well"];
    }

    if (happyPlacesRequest["wine"] != null) {
        url += "&wine=" + happyPlacesRequest["wine"];
    }

    $.getJSON(url, function(response) {
        callback(response);
    });
}



function toggleSidebar() {
    if (sidebarIsOpen) {
        $("#filtersSidebar").width(0);
        $("#filtersSidebarButton").css({'left': 0});

        document.getElementById("filtersSidebarButtonImg").src = 'static/icons/right_arrow.png';
        sidebarIsOpen = false;
    } else {
        var filterButtonWidth = $($(".filterButton").get(0)).outerWidth();
        var filterButtonMarginLeft = parseInt($($(".filterButton").get(0)).css('marginLeft'));
        var filterButtonMarginRight = parseInt($($(".filterButton").get(0)).css('marginRight'));

        var sideBarWidth = filterButtonWidth + filterButtonMarginLeft + filterButtonMarginRight;

        $("#filtersSidebar").width(sideBarWidth);
        $("#filtersSidebarButton").css({'left': sideBarWidth});

        $("#filtersSidebarButtonPopup").css({'left': sideBarWidth + $("#filtersSidebarButton").width()});


        document.getElementById("filtersSidebarButtonImg").src = 'static/icons/left_arrow.png';
        sidebarIsOpen = true;
    }
}