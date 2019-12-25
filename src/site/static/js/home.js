'use strict';
var gmap;
var markersOnMap = [];

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

    var searchButton = document.createElement('button');
    searchButton.innerHTML = 'Search This Area';
    searchButton.style.margin = "10px";
    searchButton.index = 1;
    searchButton.style.display = "none";

    searchButton.addEventListener('click', function() {
        clearMarkers();
        addMarkersToMap(gmap.getCenter().lat(), gmap.getCenter().lng());
        searchButton.style.display = "none";
    });

    gmap.controls[google.maps.ControlPosition.TOP_CENTER].push(searchButton);

    google.maps.event.addListener(gmap, 'center_changed', function(){
        searchButton.style.display = "initial";
    });
    google.maps.event.addListener(gmap, 'zoom_changed', function(){
        searchButton.style.display = "initial";
    });
}

function addMarkersToMap(latitude, longitude){
    var bounds = gmap.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    getHappyPlacesForLatLng(latitude, longitude, 10, function(response){
        var happyPlaces = JSON.parse(response['body']);

//        if (happyPlaces.length <= 10){
////                disableNextButton();
//        }

        $.each(happyPlaces, function(index, happyPlace){
            var happyPlaceId = happyPlace['pk']
            var latitude = happyPlace['fields']['latitude']
            var longitude = happyPlace['fields']['longitude']

            if (latitude > sw.lat() && latitude < ne.lat() && longitude > sw.lng() && longitude < ne.lng()){
                getTodaysHappyHours(happyPlaceId, function(response){
                    var happyHours = JSON.parse(response['body']);
                    var infoWindowHTML = createInfoWindowHTML(happyPlace['fields']['name'], happyHours);
                    addMarkerToMap(latitude, longitude, infoWindowHTML, happyPlace['fields']['name']);
                });
            }
        });
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
//

//
function createInfoWindowHTML(happyPlaceName, happyHours){
	var infoWindowHTML = '';

	if (happyHours.length == 0){
		infoWindowHTML += '<br style = "clear: left;">' + '<p>' + 'No Specials Today!' + '</p>';
	} else {
		happyHours.forEach(function(happyHour){
			var start = happyHour['fields']['start'];
			var end = happyHour['fields']['end'];
			var displayNotes = happyHour['fields']['notes'];
//			var icons = specialDetails[3];

			infoWindowHTML += '<p style = "margin-top: 28px; margin-bottom: 0px;">' + start + '-' + end + ':' + '</p>';
//			icons.forEach(function(icon){
//				infoHtml += getIconHtml(icon);
//			});

			if (displayNotes != ''){
				infoWindowHTML += '<br style = "clear: left;"> <p style = "margin-top: 2px; color: black">' + displayNotes + '</p>';
			}
		});
	}

	return  '<u style = "font-size: 22px; margin: 0px";>' + happyPlaceName + '</u>' + infoWindowHTML;
}
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