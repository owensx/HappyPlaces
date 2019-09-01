var gmap;
var markersOnMap = [];

$(document).ready(function() {
    initMap();

//    $("select#city").change(function() {
//        var cityId = $("select#city").val();
//
//        if (cityId != "None"){
//            setNeighborhoodOptions(cityId);
//            getHappyPlacesForCity(cityId, function(response) {
//                updateMap(response['body']);
//            });
//        } else {
//            resetNeighborhoodOptions();
//        }
//	});
//
//    $("select#neighborhood").change(function() {
//        updateMap();
//	});
});

//function resetNeighborhoodOptions() {
//    $("select#neighborhood").empty();
//    $("select#neighborhood").append("<option text='Select Neighborhood' value='None'>"+
//                                                       "Select Neighborhood</option>");
//}
//
//function setNeighborhoodOptions(cityId) {
//    $("select#neighborhood").empty();
//    $("select#neighborhood").append("<option>Fetching Neighborhoods...</option>");
//    $("select#neighborhood").prop('disabled', true);
//
//    getNeighborhoodsForCity(cityId, function(response) {
//        $("select#neighborhood").prop('disabled', false);
//        resetNeighborhoodOptions();
//
//        var neighborhoods = response['body']
//
//        $.each(JSON.parse(neighborhoods), function(index, neighborhood){
//            $("select#neighborhood").append(
//                $("<option>")
//                .val(neighborhood['pk'])
//                .html(neighborhood['fields']['name'])
//            );
//        });
//	});
//    var url = "/neighborhoods?cityId=" + cityId;

//	$.getJSON(url, function(response) {
//        $("select#neighborhood").prop('disabled', false);
//        resetNeighborhoodOptions();
//
//        var neighborhoods = response['body']
//
//        $.each(JSON.parse(neighborhoods), function(index, neighborhood){
//            $("select#neighborhood").append(
//                $("<option>")
//                .val(neighborhood['pk'])
//                .html(neighborhood['fields']['name'])
//            );
//        });
//	});
//}

//function getNeighborhoodsForCity(cityId, callback) {
//    var url = "/neighborhoods?cityId=" + cityId;
//
//    $.getJSON(url, function(response) {
//        callback(response);
//	});
//}
//
//function getHappyPlacesForCity(cityId, callback) {
//    var url = "/happyPlaces?cityId=" + cityId;
//
//    $.getJSON(url, function(response) {
//        callback(response);
//	});
//}

function getHappyPlacesForLatLng(latitude, longitude, count, callback) {
    var url = "/happyPlaces?latitude=" + latitude + "&longitude=" + longitude + "&count=" + count;

    $.getJSON(url, function(response) {
        callback(response);
    });
}

function CenterControl(controlDiv, map) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Search This Area';
    controlUI.appendChild(controlText);

    controlUI.addEventListener('click', function() {
        clearMarkers();
        addMarkersToMap(map.getCenter().lat(), map.getCenter().lng());
        controlDiv.hidden = true;
    });
}

function initMap() {
    var latitude = 40.679
    var longitude = -73.936

    navigator.geolocation.getCurrentPosition(function(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        createMap(latitude, longitude);

        google.maps.event.addListenerOnce(gmap, 'idle', function(){
            addMarkersToMap(latitude, longitude);
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

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, gmap);

    centerControlDiv.index = 1;
    gmap.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

    centerControlDiv.hidden = true;

    google.maps.event.addListener(gmap, 'center_changed', function(){
        centerControlDiv.hidden = false;
    });
    google.maps.event.addListener(gmap, 'zoom_changed', function(){
        centerControlDiv.hidden = false;
    });
}

//function updateMap(happyPlacesJSON) {
//    if ($("select#neighborhood").val() != 'None') {
//        //get happyplaces based on neighborhood
//    } else {
//
//    }
//
////    if (happyPlaces == null) {
////        return;
////    }
//
//    var sumLatitude = 0;
//    var sumLongitude = 0;
//
//    var happyPlaces = JSON.parse(happyPlacesJSON);
//    $.each(happyPlaces, function(index, happyPlace){
//        sumLatitude += happyPlace['fields']['latitude'];
//        sumLongitude += happyPlace['fields']['longitude'];
//    });
//
//    var averageLatitude = sumLatitude / happyPlaces.length;
//    var averageLongitude = sumLongitude / happyPlaces.length;
//
//    gmap.panTo(new google.maps.LatLng(averageLatitude, averageLongitude));
//    gmap.setZoom(15);
//}

function addMarkersToMap(latitude, longitude){
    var bounds = gmap.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    getHappyPlacesForLatLng(latitude, longitude, 10, function(response){
        happyPlaces = JSON.parse(response['body']);

        if (happyPlaces.length <= 10){
//                disableNextButton();
        }

        $.each(happyPlaces, function(index, happyPlace){
            if (happyPlace['fields']['latitude'] > sw.lat() && happyPlace['fields']['latitude'] < ne.lat()
                && happyPlace['fields']['longitude'] > sw.lng() && happyPlace['fields']['longitude'] < ne.lng()){
                addMarkerToMap(happyPlace['fields']['latitude'], happyPlace['fields']['longitude'])
            }
        });
    });
}

function addMarkerToMap(latitude, longitude){
	var marker = new google.maps.Marker({
		map: gmap
		, position: {lat: latitude, lng: longitude}
		, animation: google.maps.Animation.DROP
	});

    markersOnMap.push(marker);
//	var infoWindow = new google.maps.InfoWindow({
//	    content: getInfoWindowHtml(happyPlaceName, specials)
//	});
//
//	marker.addListener('click', function() {
//
//		if (isInfoWindowOpen(infoWindow)) {
//			infoWindow.close();
//		}
//		else {
//			infoWindow.open(map, marker);
//		}
//	});
}

function clearMarkers() {
    for (var i = 0; i < markersOnMap.length; i++) {
      markersOnMap[i].setMap(null);
    }
    markersOnMap = [];
}
//function initMap(mapCenter, markersInfo) {
//	var geocoder = new google.maps.Geocoder();
//	gmap = new google.maps.Map(document.getElementById('map'), {
//		zoom: 15
//		, center: {lat: mapCenter[0], lng: mapCenter[1]}
//		, styles: [{
//            featureType: "poi"
//            , elementType: "labels"
//            , stylers: [{
//            	visibility: "off"
//            }]
//          }]
//	});
//
//	var sumLat = 0;
//	var sumLng = 0;
//	var service = new google.maps.places.PlacesService(gmap);
//
//	markersInfo.forEach(function(markerInfo){
//		addMarkerToMap(geocoder, gmap, markerInfo);
//	});
//
//}
//var gmap;
//
//function init(lastSelectedCity, lastSelectedNeighborhood, photosPath) {
//	//get mobileFlag
//	document.getElementById('mobileFlag').value = jQuery.browser.mobile;
//
////	slideshow(lastSelectedCity, lastSelectedNeighborhood, photosPath);
//
//    $('select#city').val(lastSelectedCity).attr('selected', true);
//
//	//deconstruct spaces for URL
//	var url = "/getNeighborhoods/" + $("select#city").val().replace(/\s/g,'_');
//	$.getJSON(url, function(data) {
//		var options = '<option value="all"> All Neighborhoods </option>';
//		for (var i = 0; i < data.length; i++) {
//			options += '<option value="' + data[i] + '">' + data[i] + '</option>';
//		}
//
//		$("select#neighborhood").html(options);
//		$('select#neighborhood').val(lastSelectedNeighborhood).attr('selected', true);
//	});
//
//    $("select#city").change(function() {
//    	$('select#neighborhood').val('all').attr('selected', true);
//
//    	var slowdown = 3000*36856/4.6784568*89+40/660/3;
//
//		document.getElementById('selectForm').submit();
//	});
//
//    $("select#neighborhood").change(function() {
//		document.getElementById('selectForm').submit();
//	});
//
//    $("input#currentTimeOnly").change(function() {
//		document.getElementById('selectForm').submit();
//	});
//}
//
//function slideshow(lastSelectedCity, lastSelectedNeighborhood, photosPath) {
//	lastSelectedCity = lastSelectedCity.replace(/\s/g,'_');
//	lastSelectedNeighborhood = lastSelectedNeighborhood.replace(/\s/g,'_');
//
//	$.getJSON("/getPhotos/" + lastSelectedCity + "/" + lastSelectedNeighborhood, function(data) {
//
//       		if (lastSelectedNeighborhood == 'all') {
//       			lastSelectedNeighborhood = '';
//       		}
//
//       		var pics = [];
//			for (var x = 1; x <= data; x++) {
//		       	pics[x-1] =	photosPath + lastSelectedCity + "/" + lastSelectedNeighborhood + "/" + x + ".jpg";
//    	    }
//
//        	shuffle(pics);
//
//        	$.backstretch(pics,{duration:6000, fade:1000});
//	});
//}
//

//
//
//function isInfoWindowOpen(infoWindow){
//    var map = infoWindow.getMap();
//    return (map !== null && typeof map !== "undefined");
//}
//

//
//function getInfoWindowHtml(happyPlaceName, specials){
//	var infoHtml = '';
//	var displayNotes = '';
//
//	if (specials == ''){
//		infoHtml = '<br style = "clear: left;>' + '<p>' + 'No Specials Today!' + '</p>';
//	} else {
//		specials.forEach(function(specialDetails){
//			var start = specialDetails[0];
//			var end = specialDetails[1];
//			var displayNotes = specialDetails[2];
//			var icons = specialDetails[3];
//
//			infoHtml += '<p style = "margin-top: 28px; margin-bottom: 0px;">' + start + '-' + end + ':' + '</p>';
//			icons.forEach(function(icon){
//				infoHtml += getIconHtml(icon);
//			});
//
//			if (displayNotes != ''){
//				infoHtml += '<br style = "clear: left;"> <p style = "margin-top: 2px; color: black">' + displayNotes + '</p>';
//			}
//		});
//	}
//
//	return  '<u style = "font-size: 22px; margin: 0px";>' + happyPlaceName + '</u>' + infoHtml;
//}
//
//function getIconHtml(special){
//	specialName = special[0];
//	specialValue = special[1];
//
//	if (specialValue != ''){
//		iconHtml = '<img style="font-size: 15px; float: left; padding-left:5px;" height="20px" src="static/icons/' + specialValue + specialName + '.png"/>';
//		return iconHtml;
//	} else return '';
//}
//
//function shuffle(o) {
//	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
//	return o;
//}
//
///*! Backstretch - v2.0.4 - 2013-06-19
//* http://srobbin.com/jquery-plugins/backstretch/
//* Copyright (c) 2013 Scott Robbin; Licensed MIT */
//(function(a,d,p){a.fn.backstretch=function(c,b){(c===p||0===c.length)&&a.error("No images were supplied for Backstretch");0===a(d).scrollTop()&&d.scrollTo(0,0);return this.each(function(){var d=a(this),g=d.data("backstretch");if(g){if("string"==typeof c&&"function"==typeof g[c]){g[c](b);return}b=a.extend(g.options,b);g.destroy(!0)}g=new q(this,c,b);d.data("backstretch",g)})};a.backstretch=function(c,b){return a("body").backstretch(c,b).data("backstretch")};a.expr[":"].backstretch=function(c){return a(c).data("backstretch")!==p};a.fn.backstretch.defaults={centeredX:!0,centeredY:!0,duration:5E3,fade:0};var r={left:0,top:0,overflow:"hidden",margin:0,padding:0,height:"100%",width:"100%",zIndex:-999999},s={position:"absolute",display:"none",margin:0,padding:0,border:"none",width:"auto",height:"auto",maxHeight:"none",maxWidth:"none",zIndex:-999999},q=function(c,b,e){this.options=a.extend({},a.fn.backstretch.defaults,e||{});this.images=a.isArray(b)?b:[b];a.each(this.images,function(){a("<img />")[0].src=this});this.isBody=c===document.body;this.$container=a(c);this.$root=this.isBody?l?a(d):a(document):this.$container;c=this.$container.children(".backstretch").first();this.$wrap=c.length?c:a('<div class="backstretch"></div>').css(r).appendTo(this.$container);this.isBody||(c=this.$container.css("position"),b=this.$container.css("zIndex"),this.$container.css({position:"static"===c?"relative":c,zIndex:"auto"===b?0:b,background:"none"}),this.$wrap.css({zIndex:-999998}));this.$wrap.css({position:this.isBody&&l?"fixed":"absolute"});this.index=0;this.show(this.index);a(d).on("resize.backstretch",a.proxy(this.resize,this)).on("orientationchange.backstretch",a.proxy(function(){this.isBody&&0===d.pageYOffset&&(d.scrollTo(0,1),this.resize())},this))};q.prototype={resize:function(){try{var a={left:0,top:0},b=this.isBody?this.$root.width():this.$root.innerWidth(),e=b,g=this.isBody?d.innerHeight?d.innerHeight:this.$root.height():this.$root.innerHeight(),j=e/this.$img.data("ratio"),f;j>=g?(f=(j-g)/2,this.options.centeredY&&(a.top="-"+f+"px")):(j=g,e=j*this.$img.data("ratio"),f=(e-b)/2,this.options.centeredX&&(a.left="-"+f+"px"));this.$wrap.css({width:b,height:g}).find("img:not(.deleteable)").css({width:e,height:j}).css(a)}catch(h){}return this},show:function(c){if(!(Math.abs(c)>this.images.length-1)){var b=this,e=b.$wrap.find("img").addClass("deleteable"),d={relatedTarget:b.$container[0]};b.$container.trigger(a.Event("backstretch.before",d),[b,c]);this.index=c;clearInterval(b.interval);b.$img=a("<img />").css(s).bind("load",function(f){var h=this.width||a(f.target).width();f=this.height||a(f.target).height();a(this).data("ratio",h/f);a(this).fadeIn(b.options.speed||b.options.fade,function(){e.remove();b.paused||b.cycle();a(["after","show"]).each(function(){b.$container.trigger(a.Event("backstretch."+this,d),[b,c])})});b.resize()}).appendTo(b.$wrap);b.$img.attr("src",b.images[c]);return b}},next:function(){return this.show(this.index<this.images.length-1?this.index+1:0)},prev:function(){return this.show(0===this.index?this.images.length-1:this.index-1)},pause:function(){this.paused=!0;return this},resume:function(){this.paused=!1;this.next();return this},cycle:function(){1<this.images.length&&(clearInterval(this.interval),this.interval=setInterval(a.proxy(function(){this.paused||this.next()},this),this.options.duration));return this},destroy:function(c){a(d).off("resize.backstretch orientationchange.backstretch");clearInterval(this.interval);c||this.$wrap.remove();this.$container.removeData("backstretch")}};var l,f=navigator.userAgent,m=navigator.platform,e=f.match(/AppleWebKit\/([0-9]+)/),e=!!e&&e[1],h=f.match(/Fennec\/([0-9]+)/),h=!!h&&h[1],n=f.match(/Opera Mobi\/([0-9]+)/),t=!!n&&n[1],k=f.match(/MSIE ([0-9]+)/),k=!!k&&k[1];l=!((-1<m.indexOf("iPhone")||-1<m.indexOf("iPad")||-1<m.indexOf("iPod"))&&e&&534>e||d.operamini&&"[object OperaMini]"==={}.toString.call(d.operamini)||n&&7458>t||-1<f.indexOf("Android")&&e&&533>e||h&&6>h||"palmGetResource"in d&&e&&534>e||-1<f.indexOf("MeeGo")&&-1<f.indexOf("NokiaBrowser/8.5.0")||k&&6>=k)})(jQuery,window);