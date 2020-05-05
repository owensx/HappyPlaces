import json
from rest_framework import serializers

from src.site import google_helper

from rest_framework.serializers import ModelSerializer

import src.site.api.happy_hours as happy_hour_api

from src.site.api.base_api import API
from src.site.happy_hour_helper import filter_on_time, filter_on_days
from src.site.model.happy_hour import HappyHour
from src.site.model.happy_place import HappyPlace
from src.site.models import City, Neighborhood
from math import sqrt
import datetime


class HappyPlaceStatusSerializer(ModelSerializer):
    happy_hours = happy_hour_api.HappyHourSerializer(many=True)
    status = serializers.SerializerMethodField()

    @staticmethod
    def get_status(obj):
        return obj.status

    class Meta:
        model = HappyPlace
        exclude = ['time_updated']


class HappyPlacesAPI(API):
    def get_response_body(self, request, params):
        if request.method == 'POST':
            if "happy_place_id" in params:
                happy_place_id = params["happy_place_id"]
                happy_place = HappyPlace.objects.get(id=happy_place_id)

                response_body = {
                    'name': happy_place.name
                }

                for field in request.POST:
                    if field not in HappyPlace.EDITABLE_FIELDS:
                        self._logger.debug(field + ' is not an editable field')
                        break
                    happy_place.__setattr__(field, request.POST[field])

                    response_body[field] = request.POST[field]

                happy_place.time_updated = datetime.datetime.now()
                happy_place.save()

                return response_body

            else:
                happy_place = create_happy_place(request.POST)

                self._logger.debug('Saving HappyPlace ' + happy_place.__str__())
                # validateInput
                happy_place.save()

                return {
                    'name': happy_place.name
                    , 'id': happy_place.id
                    , 'google_place_id': happy_place.google_place_id
                }

        elif request.method == 'GET':
            if ("statusDay" in request.GET) ^ ("statusTime" in request.GET):
                raise ValueError('both statusDay and statusTime must be included or both be excluded')

            if "status" in request.GET and ("statusDay" not in request.GET or "statusTime" not in request.GET):
                raise ValueError('both statusDay and statusTime must be included with status param')

            if "happy_place_id" in params:
                happy_place_id = params["happy_place_id"]
                self._logger.debug('Fetching HappyPlace ' + str(happy_place_id))

                happy_places = [HappyPlace.objects.get(id=happy_place_id)]

            else:
                self._logger.debug('Fetching HappyPlaces...')
                happy_places = HappyPlace.objects.filter(active=True)

                if "cityId" in request.GET:
                    city_id = request.GET["cityId"]
                    self._logger.debug('Filtering on City ' + city_id + ' - '
                                       + City.objects.get(id=city_id).__str__())

                    neighborhood_ids = Neighborhood.objects.filter(city__id=int(city_id))
                    happy_places = happy_places.filter(neighborhood__id__in=neighborhood_ids)

                if "neighborhoodId" in request.GET:
                    neighborhood_id = request.GET["neighborhoodId"]
                    self._logger.debug('Filtering on Neighborhood ' + neighborhood_id + ' - '
                                       + Neighborhood.objects.get(id=neighborhood_id).__str__())

                    happy_places = happy_places.filter(neighborhood__id=int(neighborhood_id))

                if "beer" in request.GET or "wine" in request.GET or "well" in request.GET:
                    happy_places = filter(lambda happy_place:  # TODO:use generator expression?
                                          ("beer" in request.GET and any(happy_hour.beer is not None for happy_hour in
                                                                         happy_place.happy_hours.all()))
                                          or ("wine" in request.GET and any(
                                              happy_hour.wine_bottle is not None or happy_hour.wine_glass is not None
                                              for happy_hour in happy_place.happy_hours.all()))
                                          or ("well" in request.GET and any(
                                              happy_hour.well is not None for happy_hour in
                                              happy_place.happy_hours.all()))
                                          , happy_places)

                if "days" in request.GET:
                    days = list(request.GET["days"])
                    self._logger.debug('Filtering on days ' + days.__str__())

                    happy_hours = HappyHour.objects.filter(happy_place__in=happy_places)
                    happy_hours = filter_on_days(happy_hours, days)
                    happy_places = list(map(lambda happy_hour: happy_hour.happy_place, happy_hours))

                if "time" in request.GET:
                    hours = int(request.GET["time"][0:2])
                    minutes = int(request.GET["time"][2:4])

                    happy_hours = HappyHour.objects.filter(happy_place__in=happy_places)
                    happy_hours = filter_on_time(happy_hours, datetime.time(hours, minutes, 0))
                    happy_places = list(map(lambda happy_hour: happy_hour.happy_place, happy_hours))

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

            if "statusDay" in request.GET and "statusTime" in request.GET:
                day = request.GET["statusDay"]
                if day not in ['M', 'T', 'W', 'R', 'F', 'S', 'Y']:
                    raise ValueError(day + " is not valid for day parameter. valid params are [M, T, W, R, F, S, Y]")

                hours = int(request.GET["statusTime"][0:2])
                minutes = int(request.GET["statusTime"][2:4])

                for happy_place in happy_places:
                    happy_place.status = happy_place.get_status(day=day, time=datetime.time(hours, minutes, 0))
            else:
                self._logger.debug('statusDay and statusTime not provided in request, defaulting status to NONE')
                for happy_place in happy_places:
                    happy_place.status = 'NONE'

            if "status" in request.GET:
                statuses = request.GET["status"].split(',')
                happy_places = list(filter(lambda happy_place: happy_place.status in statuses, happy_places))

            return {
                'body': json.dumps(HappyPlaceStatusSerializer(happy_places, many=True).data)
            }


def create_happy_place(request_data):
    google_place_id = request_data["google_place_id"]

    cross = request_data["cross"]
    instagram_handle = request_data["instagram_handle"]
    neighborhood_id = int(request_data["neighborhood_id"])

    google_place = google_helper.get_google_place_details(place_id=google_place_id)

    happy_place = HappyPlace(
        neighborhood=Neighborhood.objects.get(id=neighborhood_id)
        , name=google_place["name"]
        , address=google_place["address"]
        , cross=cross if cross else None
        , site=google_place["site"] if google_place["site"] else None
        , phone=google_place["phone"] if google_place["phone"] else None
        , instagram_url='https://instagram.com/'+instagram_handle if instagram_handle else None
        , latitude=google_place["latitude"]
        , longitude=google_place["longitude"]
        , price_level=google_place["price_level"] if google_place["price_level"] else None
        , google_place_id=google_place_id
        , time_updated=datetime.now()
    )

    return happy_place
