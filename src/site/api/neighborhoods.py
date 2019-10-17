from src.site.api.base_api import API
from src.site.models import Neighborhood, City

from django.core.serializers import serialize


class NeighborhoodsAPI(API):
    def get_response_body(self, request, params):
        if request.method == 'GET':
            neighborhoods = None

            if "neighborhood_id" in params:
                neighborhood_id = params["neighborhood_id"]
                self._logger.debug('Fetching Neighborhood ' + str(neighborhood_id))

                neighborhoods = Neighborhood.objects.filter(id=neighborhood_id)

            else:
                if "cityId" in request.GET:
                    city_id = request.GET["cityId"]
                    self._logger.debug('Filtering on City ' + city_id + ' - '
                                       + City.objects.filter(id=city_id).first().__str__())

                    if neighborhoods is None:
                        neighborhoods = Neighborhood.objects.filter(city__id=int(city_id))
                    else:
                        neighborhoods = neighborhoods.filter(city__id=int(city_id))

            return {
                'body': "" if neighborhoods is None else serialize('json', neighborhoods)
            }