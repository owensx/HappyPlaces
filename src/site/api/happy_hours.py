import json
from datetime import datetime

from src.site import happy_hour_helper
from src.site.api.base_api import API

from rest_framework.serializers import ModelSerializer

from src.site.model.happy_hour import HappyHour
from src.site.model.happy_place import HappyPlace


class HappyHourSerializer(ModelSerializer):

    class Meta:
        model = HappyHour
        exclude = ['time_updated']


class HappyHoursAPI(API):
    def get_response_body(self, request, params):
        if request.method == 'POST':
            happy_hour = create_happy_hour_from_form_data(request.POST)

            self._logger.debug('Saving HappyHour ' + happy_hour.__str__())
            happy_hour.save()

            return {
                'happy_hour_id': happy_hour.id
            }

        elif request.method == 'GET':
            if "happy_hour_id" in params:
                happy_hour_id = params["happy_hour_id"]
                self._logger.debug('Fetching HappyHour ' + str(happy_hour_id))

                happy_hours = HappyHour.objects.get(id=happy_hour_id)
            else:
                happy_hours = HappyHour.objects.filter(happy_place__active=True)
                if "happyPlaceId" in request.GET:
                    happy_place_id = request.GET["happyPlaceId"]
                    self._logger.debug('Filtering on HappyPlace ' + happy_place_id + ' - '
                                       + HappyPlace.objects.get(id=happy_place_id).__str__())

                    happy_hours = happy_hours.filter(happy_place__id=int(happy_place_id))

                if "days" in request.GET:
                    days = request.GET["days"]

                    self._logger.debug('Filtering on days ' + days)
                    happy_hours = happy_hour_helper.filter_on_days(happy_hours, days)

            return {
                'body': json.dumps(HappyHourSerializer(happy_hours, many=True).data)
            }


def create_happy_hour_from_form_data(form_details):
    happy_hour = HappyHour(
        happy_place=HappyPlace.objects.get(id=form_details["happy_place_id"])
        , notes=form_details["notes"] if form_details["notes"] else None
        , start=form_details["start"]
        , end=form_details["end"]
        , beer=form_details["beer"] if form_details["beer"] else None
        , wine_glass=form_details["wine_glass"] if form_details["wine_glass"] else None
        , wine_bottle=form_details["wine_bottle"] if form_details["wine_bottle"] else None
        , well=form_details["well"] if form_details["well"] else None
        , shot_beer=form_details["shot_beer"] if form_details["shot_beer"] else None
        , sunday=True if form_details["sunday"] == 'true' else False
        , monday=True if form_details["monday"] == 'true' else False
        , tuesday=True if form_details["tuesday"] == 'true' else False
        , wednesday=True if form_details["wednesday"] == 'true' else False
        , thursday=True if form_details["thursday"] == 'true' else False
        , friday=True if form_details["friday"] == 'true' else False
        , saturday=True if form_details["saturday"] == 'true' else False
        , time_updated=datetime.now()
    )

    return happy_hour
