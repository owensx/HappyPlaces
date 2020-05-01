'use strict';

$(document).ready(function(){
    initOpenClose();

    $("#happyPlaceForm select[name='neighborhood']").change(function(){
        var neighborhoodId = $("#happyPlaceForm select[name='neighborhood']").val();
        setHappyPlaceOptions(neighborhoodId);
    });

    $("#happyPlaceForm input[name='name']").change(function(){
        $("#happyPlaceForm select[name='happy_place']").val('default')
    });
});

function setHappyPlaceOptions(neighborhoodId){
    var requestBody = {};

    if (neighborhoodId != ''){
        requestBody['neighborhoodId'] = neighborhoodId;
    }

    $.getJSON("/happyPlaces", requestBody, function(response) {
        $("#happyPlaceForm select[name='happy_place']").empty();
        $("#happyPlaceForm select[name='happy_place']").append("<option text='Select HappyPlace' value='default'>"+
                                                           "Select HappyPlace</option>");

        var happyPlaces = response['body']

        $.each(JSON.parse(happyPlaces), function(index, happyPlace){
            $("#happyPlaceForm select[name='happy_place']").append(
                $("<option>")
                .val(happyPlace['id'])
                .html(happyPlace['name'])
            );
        });
    });
}

function onSearchButtonClick(){
    var name = $("#happyPlaceForm input[name='name']").val()
    var neighborhood = $("#happyPlaceForm select[name='neighborhood'] option:selected").text()
    var city = $("#happyPlaceForm input[name='city']").val()

	if(name == '') {
	    alert('Please provide a name');
	    return;
	}

	if(neighborhood == '') {
	    alert('Please select a neighborhood');
	    return;
	}

    $('#searchResults').empty();
    $("#searchingIcon").show();

	var queryString = name + ' ' + neighborhood + ' ' + city;

    var requestBody = { "queryString": queryString
                    , "count": 5 }

	$.getJSON("/googlePlaces", requestBody, function(response) {
        $("#searchingIcon").hide();

	    var googlePlaces = response['body'];

	    if(googlePlaces.length == 0){
	        alert('Google returned zero results! Try again.')
	        return;
	    }

        $("#crossInstaMessage").show();
        $("#happyPlaceForm input[name='cross']").show();
        $("#happyPlaceForm label[for='id_cross']").text("Cross");
        $("#happyPlaceForm input[name='instagram_handle']").show();
        $("#happyPlaceForm label[for='id_instagram_handle']").text("Instagram");

		$.each(googlePlaces, function(index, googlePlace){
		    var name = googlePlace["name"]
		    var address = googlePlace["address"]
		    var placeId = googlePlace["place_id"]

		    $('#searchResults').append(
                '<tr>'+
                '<td>'+ name +'</td>'+
                '<td>'+ address +'</td>'+
                '<td><button '+
                    'onclick="saveHappyPlace(\''+placeId+'\')"'+
                    '>Add'+
                '</button></td>'+
                '</tr>'
            );
		});

        $('#searchResults').css('border', '1px solid black');
        $('#searchResults').css('align', 'center');
        $('td').css('border', '1px solid black');
	});
}

function saveHappyPlace(placeId){
    var neighborhoodId = $("#happyPlaceForm select[name='neighborhood'] option:selected").val()
    var cross = $("#happyPlaceForm input[name='cross']").val()
    var instagramHandle= $("#happyPlaceForm input[name='instagram_handle']").val()

    var saveHappyPlaceRequest = {
        "google_place_id": placeId
        , "neighborhood_id": neighborhoodId
        , "cross": cross
        , "instagram_handle": instagramHandle
    }

    $.post( "/happyPlaces",saveHappyPlaceRequest)
        .done(function(saveHappyPlaceResponse){
            alert('Saved Happy Place!');
            $("#happyPlaceForm select[name='happy_place']").append("<option value='"
                                                           + saveHappyPlaceResponse["id"]+"'>"
                                                           + saveHappyPlaceResponse["name"] + "</option>");
            $("#happyPlaceForm select[name='happy_place']").val(saveHappyPlaceResponse["id"]);
        }).fail(function(request, textStatus, thrownError){
            alert('Failed to save Happy Place ' + request.status + ' ' + textStatus + ' ' + thrownError)
        });
}

function saveHappyHour(){
    if ($("#happyPlaceForm select[name='happy_place']").val() == 'default'
        || $("#happyPlaceForm select[name='happy_place']").val() == '' ){
        alert('Please select a HappyPlace');
        return;
    }

    var happy_place_id = $("#happyPlaceForm select[name='happy_place']").val();
    var notes = $("#happyHourForm input[name='notes']").val();
    var start = $("#happyHourForm input[name='start']").val();
    var end = $("#happyHourForm input[name='end']").val();
    var beer = $("#happyHourForm input[name='beer']").val();
    var wine_glass = $("#happyHourForm input[name='wine_glass']").val();
    var wine_bottle = $("#happyHourForm input[name='wine_bottle']").val();
    var well = $("#happyHourForm input[name='well']").val();
    var shot_beer = $("#happyHourForm input[name='shot_beer']").val();
    var sunday = $("#happyHourForm input[name='sunday']").is(":checked");
    var monday = $("#happyHourForm input[name='monday']").is(":checked");
    var tuesday = $("#happyHourForm input[name='tuesday']").is(":checked");
    var wednesday = $("#happyHourForm input[name='wednesday']").is(":checked");
    var thursday = $("#happyHourForm input[name='thursday']").is(":checked");
    var friday = $("#happyHourForm input[name='friday']").is(":checked");
    var saturday = $("#happyHourForm input[name='saturday']").is(":checked");

    saveHappyHourRequest = {
        happy_place_id: happy_place_id
        , notes: notes
        , start: start
        , end: end
        , beer: beer
        , wine_glass: wine_glass
        , wine_bottle: wine_bottle
        , well: well
        , shot_beer: shot_beer
        , sunday: sunday
        , monday: monday
        , tuesday: tuesday
        , wednesday: wednesday
        , thursday: thursday
        , friday: friday
        , saturday: saturday
    }

    $.post( "/happyHours", saveHappyHourRequest)
        .done(function(data){
            alert('Saved Happy Hour!');
            $('#happyHourForm input').val('');
            $('#happyHourForm input').prop('checked', false);
	        $("input#id_start").attr('disabled', false);
	        $("input#id_end").attr('disabled', false);
        }).fail(function(request, textStatus, thrownError){
            alert('Failed to save Happy Hour ' + request.status + ' ' + textStatus + ' ' + thrownError)
        });
}

function setHappyHourDays(buttonName){
	clearHappyHourDays();

	switch (buttonName){
		case 'daily':
			$("#happyHourForm #id_sunday").prop('checked', true);
			$("#happyHourForm #id_monday").prop('checked', true);
			$("#happyHourForm #id_tuesday").prop('checked', true);
			$("#happyHourForm #id_wednesday").prop('checked', true);
			$("#happyHourForm #id_thursday").prop('checked', true);
			$("#happyHourForm #id_friday").prop('checked', true);
			$("#happyHourForm #id_saturday").prop('checked', true);
			break;

		case 'weekdays':
			$("#happyHourForm #id_monday").prop('checked', true);
			$("#happyHourForm #id_tuesday").prop('checked', true);
			$("#happyHourForm #id_wednesday").prop('checked', true);
			$("#happyHourForm #id_thursday").prop('checked', true);
			$("#happyHourForm #id_friday").prop('checked', true);
			break;

		case 'weekends':
			$("#happyHourForm #id_sunday").prop('checked', true);
			$("#happyHourForm #id_saturday").prop('checked', true);
	    	break;
	}
}

function clearHappyHourDays(){
	$("#happyHourForm #id_sunday").prop('checked', false);
    $("#happyHourForm #id_monday").prop('checked', false);
    $("#happyHourForm #id_tuesday").prop('checked', false);
    $("#happyHourForm #id_wednesday").prop('checked', false);
    $("#happyHourForm #id_thursday").prop('checked', false);
    $("#happyHourForm #id_friday").prop('checked', false);
    $("#happyHourForm #id_saturday").prop('checked', false);
}

function initOpenClose(){
	$("input#id_start").attr('disabled', false);
	$("input#id_end").attr('disabled', false);

    $("input#fromOpen").change(function(){
        if($("input#fromOpen").prop('checked')){
            $("input#id_start").val("04:00:01");
	        $("input#id_start").attr('disabled', true);
        } else {
	        $("input#id_start").attr('disabled', false);
            $("input#id_start").val("");
        }
    });

	$("input#toClose").change(function(){
        if($("input#toClose").prop('checked')){
            $("input#id_end").val("04:00:00");
	        $("input#id_end").attr('disabled', true);
        } else {
	        $("input#id_end").attr('disabled', false);
            $("input#id_end").val("");
        }
    });
}

function clearForm(formId){
	$(formId).find("input[type=text], textarea").val("");
}