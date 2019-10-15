from src.site.api.base_api import API
from src.site.models import Neighborhood, City

from django.core.serializers import serialize


class NeighborhoodsAPI(API):
    def get_response_body(self, request, params):
        if request.method == 'GET':
            self._logger.debug(request.method + str(request.GET))

            if "neighborhood_id" in params:
                neighborhood_id = params["neighborhood_id"]
                self._logger.debug('Fetching Neighborhood ' + str(neighborhood_id))

                neighborhoods = Neighborhood.objects.filter(id=neighborhood_id)

            else:
                self._logger.debug('Fetching Neighborhoods...')
                neighborhoods = Neighborhood.objects.all()

                if "cityId" in request.GET:
                    city_id = request.GET["cityId"]
                    self._logger.debug('Filtering on City ' + city_id + ' - '
                                       + City.objects.filter(id=city_id).first().__str__())

                    neighborhoods = neighborhoods.filter(city__id=int(city_id))

            return {
                'body': serialize('json', neighborhoods)
            }
