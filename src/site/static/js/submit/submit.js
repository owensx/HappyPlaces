function init(){
	windowHeight = document.documentElement.clientHeight;
	
	$("input#fromOpen").change(function(){
   	 	if($(this).prop('checked')){       	 		
   	 		$("input#id_start").attr('disabled', true);
   	 	} else {
   	 		$("input#id_start").val("");
   	 		
   	 		$("input#id_start").attr('disabled', false);
	 		}
   	 });
   	 
   	 $("input#toClose").change(function(){
   	 	if($(this).prop('checked')){       	 		
   	 		$("input#id_end").attr('disabled', true);
   	 	} else {
   	 		$("input#id_end").val("");
   	 		
   	 		$("input#id_end").attr('disabled', false);
   	 	}
   	 });
}

function getMarginHeight(){
	return parseInt($('#form').css("margin-top"));
}

function setHappyHourDays(buttonName){
	clearHappyHourDays();
	  
	switch (buttonName){
		case 'daily':
			$("#happyHourForm #id_days_0").prop('checked', true);
			$("#happyHourForm #id_days_1").prop('checked', true);
			$("#happyHourForm #id_days_2").prop('checked', true);
			$("#happyHourForm #id_days_3").prop('checked', true);
			$("#happyHourForm #id_days_4").prop('checked', true);
			$("#happyHourForm #id_days_5").prop('checked', true);
			$("#happyHourForm #id_days_6").prop('checked', true);
			break;
		
		case 'weekdays':
			$("#happyHourForm #id_days_1").prop('checked', true);
			$("#happyHourForm #id_days_2").prop('checked', true);
			$("#happyHourForm #id_days_3").prop('checked', true);
			$("#happyHourForm #id_days_4").prop('checked', true);
			$("#happyHourForm #id_days_5").prop('checked', true);
			break;
			
		case 'weekends':
			$("#happyHourForm #id_days_0").prop('checked', true);
			$("#happyHourForm #id_days_6").prop('checked', true);
	    	break;
	}
}	
	 
function clearHappyHourDays(){
	$("#happyHourForm #id_days_0").prop('checked', false);
	$("#happyHourForm #id_days_1").prop('checked', false);
	$("#happyHourForm #id_days_2").prop('checked', false);
	$("#happyHourForm #id_days_3").prop('checked', false);
	$("#happyHourForm #id_days_4").prop('checked', false);
	$("#happyHourForm #id_days_5").prop('checked', false);
	$("#happyHourForm #id_days_6").prop('checked', false);
}

function onHappyHourSubmit(){
	$("input#id_start").attr('disabled', false);
	$("input#id_end").attr('disabled', false);  

	if($("input#fromOpen").prop('checked')){
		$("input#id_start").val("00:00:01");
	}
	
	if($("input#toClose").prop('checked')){
		$("input#id_end").val("02:01:00");
	}
}

function onSearchButtonClick(){
    name = $("#happyPlaceForm input[name='name']").val()
    neighborhood = $("#happyPlaceForm select[name='neighborhood']").val()
    address = $("#happyPlaceForm input[name='address']").val()

	if(name == '') {
	    alert('Please provide a name');
	    return;

	}
	if(neighborhood == '') {
	    alert('Please select a neighborhood');
	    return;
	}

	queryString = name + ' ' + neighborhood + ' ' + address;

	$.getJSON("/getPlaceId/" + queryString, function(data) {
		var googlePlaces = data;

        $('#searchResults').empty();
		$.each(googlePlaces, function(index, value){
		    $('#searchResults').append(
                '<tr> <td>'+value["name"]+'</td> <td>'+value["address"]+'</td><td><button>Select</button></td>  </tr>'
            );
		});
        $('#searchResults').css('border', '1px solid black');
        $('#searchResults').css('align', 'center');
        $('td').css('border', '1px solid black');
	});

}

function loadNextGooglePlace() {
	$('#happyPlaceForm #prevButton').show();

	if (++googlePlacesIterator == googlePlaces.length - 1) {
		$('#happyPlaceForm #nextButton').hide();
	}

	$("#happyPlaceForm input#id_name").val(googlePlaces[googlePlacesIterator].name);
	$("#happyPlaceForm input#id_address").val(googlePlaces[googlePlacesIterator].address);
	$("#happyPlaceForm input#id_latitude").val(googlePlaces[googlePlacesIterator].latitude);
	$("#happyPlaceForm input#id_longitude").val(googlePlaces[googlePlacesIterator].longitude);
	$("#happyPlaceForm input#id_site").val(googlePlaces[googlePlacesIterator].site);
	$("#happyPlaceForm input#id_phone").val(googlePlaces[googlePlacesIterator].phone);
	$("#happyPlaceForm input#id_place_id").val(googlePlaces[googlePlacesIterator].placeId);
	
	mapCenter=[googlePlaces[googlePlacesIterator].latitude, googlePlaces[googlePlacesIterator].longitude];
	initMap(mapCenter);	
}

function loadPrevGooglePlace() {
	$('#happyPlaceForm #nextButton').show();
	
	if (--googlePlacesIterator == 0) {
		$('#happyPlaceForm #prevButton').hide();
	}
	
	$("#happyPlaceForm input#id_name").val(googlePlaces[googlePlacesIterator].name);
	$("#happyPlaceForm input#id_address").val(googlePlaces[googlePlacesIterator].address);
	$("#happyPlaceForm input#id_latitude").val(googlePlaces[googlePlacesIterator].latitude);
	$("#happyPlaceForm input#id_longitude").val(googlePlaces[googlePlacesIterator].longitude);
	$("#happyPlaceForm input#id_site").val(googlePlaces[googlePlacesIterator].site);
	$("#happyPlaceForm input#id_phone").val(googlePlaces[googlePlacesIterator].phone);
	$("#happyPlaceForm input#id_place_id").val(googlePlaces[googlePlacesIterator].placeId);
	
	mapCenter=[googlePlaces[googlePlacesIterator].latitude, googlePlaces[googlePlacesIterator].longitude];
	initMap(mapCenter);	
}

function clearForm(formId){
	$(formId).find("input[type=text], textarea").val("");
}