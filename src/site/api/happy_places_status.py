import json
from math import sqrt

from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

import src.site.api.happy_hours as happy_hour_api
from src.site.api.base_api import API
import datetime

from src.site.happy_hour_helper import filter_on_days
from src.site.model.happy_hour import HappyHour
from src.site.model.happy_place import HappyPlace


class HappyPlaceStatusSerializer(ModelSerializer):
    happy_hours = happy_hour_api.HappyHourSerializer(many=True)
    status = serializers.SerializerMethodField()

    @staticmethod
    def get_status(obj):
        return obj.status

    class Meta:
        model = HappyPlace
        exclude = ['time_updated']


class HappyPlacesStatusAPI(API):
    def get_response_body(self, request, params):
        if "day" not in request.GET:
            raise ValueError("day is a required parameter")
        if "time" not in request.GET:
            raise ValueError("time is a required parameter")

        day = request.GET["day"]
        if day not in ['M', 'T', 'W', 'R', 'F', 'S', 'Y']:
            raise ValueError(day + " is not valid for day parameter. valid params are [M, T, W, R, F, S, Y]")

        hours = int(request.GET["time"][0:2])
        minutes = int(request.GET["time"][2:4])
        time = datetime.time(hours, minutes, 0)

        self._logger.debug("Filtering for day " + day + " and time " + str(time))
        happy_hours = filter_on_days(HappyHour.objects.all(), [day])

        happy_places = list(map(lambda happy_hour: happy_hour.happy_place, happy_hours))
        happy_places = list(filter(lambda happy_place: happy_place.active, happy_places))

        for happy_place in happy_places:
            happy_place.status = happy_place.get_status(day=day, time=time)

        if "status" in request.GET:
            statuses = request.GET["status"].split(',')
            happy_places = list(filter(lambda happy_place: happy_place.status in statuses, happy_places))

        if "latitude" in request.GET and "longitude" in request.GET:
            latitude = request.GET["latitude"]
            longitude = request.GET["longitude"]
            self._logger.debug('Sorting HappyPlaces by latlng ' + latitude + ', ' + longitude)

            happy_places = sorted(happy_places
                                  , key=lambda happy_place: sqrt(
                    pow(happy_place.latitude - float(latitude), 2) + pow(
                        happy_place.longitude - float(longitude), 2)))

        if "count" in request.GET:
            count = int(request.GET["count"])
            self._logger.debug('Returning top ' + str(count) + ' results')

            happy_places = happy_places[:count]

        return {
            'body': json.dumps(HappyPlaceStatusSerializer(happy_places, many=True).data)
        }
