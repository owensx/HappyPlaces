from src.site import happy_place_helper
from src.site.api.base_api import API
from src.site.models import HappyPlace, City, Neighborhood

from math import sqrt

from django.core.serializers import serialize


class HappyPlacesAPI(API):
    def get_response_body(self, request, params):
        if request.method == 'POST':
            self._logger.debug(request.method + str(request.POST))

            happy_place = happy_place_helper.create_happy_place_from_form_data(request.POST)

            self._logger.debug('Saving HappyPlace ' + happy_place.__str__())
            happy_place.save()

            return {
                'name': happy_place.name
                , 'id': happy_place.id
                , 'google_place_id': happy_place.google_place_id
            }

        elif request.method == 'GET':
            self._logger.debug(request.method + str(request.GET))

            if "happy_place_id" in params:
                happy_place_id = params["happy_place_id"]
                self._logger.debug('Fetching HappyPlace ' + str(happy_place_id))

                happy_places = HappyPlace.objects.get(id=happy_place_id)

            else:
                self._logger.debug('Fetching HappyPlaces...')
                happy_places = HappyPlace.objects.all().filter(active=True)

                if "cityId" in request.GET:
                    city_id = request.GET["cityId"]
                    self._logger.debug('Filtering on City ' + city_id + ' - '
                                       + City.objects.filter(id=city_id).first().__str__())

                    neighborhood_ids = Neighborhood.objects.filter(city__id=int(city_id))
                    happy_places = happy_places.filter(neighborhood__id__in=neighborhood_ids)

                if "neighborhoodId" in request.GET:
                    neighborhood_id = request.GET["neighborhoodId"]
                    self._logger.debug('Filtering on Neighborhood ' + neighborhood_id + ' - '
                                       + Neighborhood.objects.filter(id=neighborhood_id).first().__str__())

                    happy_places = happy_places.filter(neighborhood__id=int(neighborhood_id))

                if "beer" in request.GET or "wine" in request.GET or "well" in request.GET:
                    happy_places = filter(lambda happy_place:
                                          ("beer" in request.GET and any(happy_hour.beer is not None for happy_hour in happy_place.happy_hours.all()))
                                          or ("wine" in request.GET and any(happy_hour.wine_bottle is not None or happy_hour.wine_glass is not None for happy_hour in happy_place.happy_hours.all()))
                                          or ("well" in request.GET and any(happy_hour.well is not None for happy_hour in happy_place.happy_hours.all()))
                                          , happy_places)

                if "latitude" in request.GET and "longitude" in request.GET:
                    latitude = request.GET["latitude"]
                    longitude = request.GET["longitude"]
                    self._logger.debug('Sorting HappyPlaces by latlng ' + latitude + ', ' + longitude)

                    happy_places = sorted(happy_places
                                          , key=lambda happy_place: sqrt(pow(happy_place.latitude - float(latitude), 2) + pow(happy_place.longitude - float(longitude), 2)))

                if "count" in request.GET:
                    count = int(request.GET["count"])
                    self._logger.debug('Returning top ' + str(count) + ' results')

                    happy_places = happy_places[:count]

            return {
                'body': serialize('json', happy_places)
            }
