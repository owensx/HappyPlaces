from django.db.models import Q

from src.site import happy_hour_helper
from src.site.api.base_api import API
from src.site.models import HappyHour, HappyPlace

from django.core.serializers import serialize


class HappyHoursAPI(API):
    def get_response_body(self, request, params):
        if request.method == 'POST':
            happy_hour = happy_hour_helper.create_happy_hour_from_form_data(request.POST)

            self._logger.debug('Saving HappyHour ' + happy_hour.__str__())
            happy_hour.save()

            return {
                'happy_hour_id': happy_hour.id
            }

        elif request.method == 'GET':
            happy_hours = None

            if "happy_hour_id" in params:
                happy_hour_id = params["happy_hour_id"]
                self._logger.debug('Fetching HappyHour ' + str(happy_hour_id))

                happy_hours = HappyHour.objects.get(id=happy_hour_id)
            else:
                if "happyPlaceId" in request.GET:
                    happy_place_id = request.GET["happyPlaceId"]
                    self._logger.debug('Filtering on HappyPlace ' + happy_place_id + ' - '
                                       + HappyPlace.objects.get(id=happy_place_id).__str__())

                    if happy_hours is None:
                        happy_hours = HappyHour.objects.filter(happy_place__id=int(happy_place_id))
                    else:
                        happy_hours = happy_hours.filter(happy_place__id=int(happy_place_id))

                if "days" in request.GET:
                    days = request.GET["days"]
                    self._logger.debug('Filtering on days ' + days)

                    if happy_hours is None:
                        happy_hours = HappyHour.objects.filter(get_days_criteria(days))
                    else:
                        happy_hours = happy_hours.filter(get_days_criteria(days))

            if happy_hours is not None:
                happy_hours = happy_hours.filter(happy_place__active=True)

            return {
                'body': "" if happy_hours is None else serialize('json', happy_hours)
            }


def get_days_criteria(days):
    criteria = Q()

    if 'M' in days:
        criteria = criteria | Q(monday=True)
    if 'T' in days:
        criteria = criteria | Q(tuesday=True)
    if 'W' in days:
        criteria = criteria | Q(wednesday=True)
    if 'R' in days:
        criteria = criteria | Q(thursday=True)
    if 'F' in days:
        criteria = criteria | Q(friday=True)
    if 'S' in days:
        criteria = criteria | Q(saturday=True)
    if 'Y' in days:
        criteria = criteria | Q(sunday=True)

    return criteria
