from src.site import happy_hour_helper
from src.site.api.base_api import API
from src.site.models import HappyHour

from django.core.serializers import serialize


class HappyHoursAPI(API):
    def get_response_body(self, request, params):
        if request.method == 'POST':
            self._logger.debug(request.method + str(request.POST))

            happy_hour = happy_hour_helper.create_happy_hour_from_form_data(request.POST)

            self._logger.debug('Saving HappyHour ' + happy_hour.__str__())
            happy_hour.save()

            return {
                'happy_hour_id': happy_hour.id
            }

        elif request.method == 'GET':
            self._logger.debug(request.method + str(request.GET))

            if "happy_hour_id" in params:
                happy_hour_id = params["happy_hour_id"]
                self._logger.debug('Fetching HappyHour ' + str(happy_hour_id))

                happy_hours = HappyHour.objects.get(id=happy_hour_id)
            else:
                self._logger.debug('Fetching HappyHours...')
                happy_hours = HappyHour.objects.all()

                if "happy_place_id" in request.GET:
                    happy_place_id = request.GET["happy_place_id"]
                    self._logger.debug('Fetching all HappyHours for HappyPlace ' + happy_place_id)

                    happy_hours = HappyHour.objects.filter(happy_place__id=int(happy_place_id))

            return {
                'body': serialize('json', happy_hours)
            }
