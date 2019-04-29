$(document).ready(function(){
    $("#happyPlaceForm select[name='neighborhood']").change(function(){
        neighborhoodId = $("#happyPlaceForm select[name='neighborhood']").val();
        setHappyPlaceOptions(neighborhoodId);
    });
    $("#happyPlaceForm input[name='name']").change(function(){
        $("#happyPlaceForm select[name='happy_place']").val('default')
    });
});

function setHappyPlaceOptions(neighborhoodId){
    var requestBody = {};

    if (neighborhoodId != ''){
        requestBody['neighborhood_id'] = neighborhoodId;
    }

    $.getJSON("/happyPlaces", requestBody, function(response) {
        $("#happyPlaceForm select[name='happy_place']").empty();
        $("#happyPlaceForm select[name='happy_place']").append("<option text='Select HappyPlace' value='default'>"+
                                                           "Select HappyPlace</option>");

        requestId = response['request_id']
        happyPlaces = response['body']

        $.each(JSON.parse(happyPlaces), function(index, happyPlace){
            $("#happyPlaceForm select[name='happy_place']").append(
                $("<option>")
                .val(happyPlace['fields']['google_place_id'])
                .html(happyPlace['fields']['name'])
            );
        });
    });
}

function onSearchButtonClick(){
    name = $("#happyPlaceForm input[name='name']").val()
    neighborhood = $("#happyPlaceForm select[name='neighborhood'] option:selected").text()
    neighborhood_id = $("#happyPlaceForm select[name='neighborhood'] option:selected").val()
    city = $("#happyPlaceForm input[name='city']").val()

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

	queryString = name + ' ' + neighborhood + ' ' + city;

    requestBody = { query_string: queryString
                    , max_results: 5 }

	$.getJSON("/googlePlaces", requestBody, function(response) {
        $("#searchingIcon").hide();

	    var googlePlaces = response['body'];

	    if(googlePlaces.length == 0){
	        alert('Google returned zero results! Try again.')
	        return;
	    }

        $("#crossMessage").show();
        $("#happyPlaceForm input[name='cross']").show();
        $("#happyPlaceForm label[for='id_cross']").text("Cross");

		$.each(googlePlaces, function(index, googlePlace){
		    name = googlePlace["name"]
		    address = googlePlace["address"]
		    placeId = googlePlace["place_id"]

		    cross = $("#happyPlaceForm input[name='cross']").val()

		    saveHappyPlaceRequest = {
		        cross: cross
		        , place_id: placeId
		        , neighborhood_id: neighborhood_id
		    }

            saveHappyPlaceRequest = JSON.stringify(saveHappyPlaceRequest).replace(/"/g,'\\"');

		    $('#searchResults').append(
                '<tr>'+
                '<td>'+ name +'</td>'+
                '<td>'+ address +'</td>'+
                '<td><button '+
                    'onclick=saveHappyPlace("'+ saveHappyPlaceRequest +'") '+
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

function saveHappyPlace(saveHappyPlaceRequest){
    $.post( "/happyPlaces", JSON.parse(saveHappyPlaceRequest))
        .done(function(data, textStatus){
            alert('Saved Happy Place!');
            $("#happyPlaceForm select[name='happy_place']").append("<option text='Select HappyPlace' value='"
                                                           + data["google_place_id"]+"'>"
                                                           + data["name"] + "</option>");
            $("#happyPlaceForm select[name='happy_place']").val(data["google_place_id"]);
        }).fail(function(request, textStatus, thrownError){
            alert('Failed to save Happy Place ' + request.status + ' ' + textStatus + ' ' + thrownError)
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

//function onHappyHourSubmit(){
//	$("input#id_start").attr('disabled', false);
//	$("input#id_end").attr('disabled', false);
//
//	if($("input#fromOpen").prop('checked')){
//		$("input#id_start").val("00:00:01");
//	}
//
//	if($("input#toClose").prop('checked')){
//		$("input#id_end").val("02:01:00");
//	}
//}

function clearForm(formId){
	$(formId).find("input[type=text], textarea").val("");
}