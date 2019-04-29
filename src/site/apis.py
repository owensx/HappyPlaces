import json
import logging
import sys
import uuid

from datetime import datetime

from django.core.serializers import serialize
from django.db import IntegrityError
from django.http.response import HttpResponse

from src.site.models import HappyPlace, Neighborhood

import src.site.google_helper as google_helper

logger = logging.getLogger(__name__)


def get_google_places(request):
    request_id = str(uuid.uuid4())
    logger.debug('Received new request, assigning id ' + request_id)

    query = request.GET["query_string"]
    max_results = int(request.GET["max_results"])

    places = google_helper.query_google_places(query=query)

    data = []

    for place in places[:max_results]:
        data.append(google_helper.format_google_details(place))

    response = {
        'request_id': 1
        , 'body': data
    }

    logger.debug('Returning below data:')
    logger.debug(response)
    return HttpResponse(json.dumps(response), content_type="application/json")


def happy_places(request, happy_place_id=None):
    request_id = str(uuid.uuid4())
    logger.debug('Received new request, assigning id ' + request_id)

    try:
        if request.method == 'POST':
            logger.debug(request.method + str(request.POST))
            happy_place = save_happy_place(request.POST)

            response = {
                'request_id': request_id
                , 'name': happy_place.name
                , 'happy_place_id': happy_place.id
                , 'google_place_id': happy_place.google_place_id
            }

        elif request.method == 'GET':
            logger.debug(request.method + str(request.GET))

            if happy_place_id is None:
                if "neighborhood_id" in request.GET:
                    neighborhood_id = request.GET["neighborhood_id"]
                    logger.debug('Fetching all HappyPlaces for Neighborhood ' + neighborhood_id)

                    happy_places = HappyPlace.objects.filter(neighborhood__id=int(neighborhood_id))
                else:
                    logger.debug('Fetching all HappyPlaces')

                    happy_places = HappyPlace.objects.all()
            else:
                logger.debug('Fetching HappyPlace ' + str(happy_place_id))

                happy_places = HappyPlace.objects.filter(id=happy_place_id)

            response = {
                'request_id': request_id
                , 'body': serialize('json', happy_places)
            }

            logger.debug('Returning below data:')
            logger.debug(response)

    except IntegrityError:
        return HttpResponse(status=400, reason='Duplicate Happy Place')
    except:
        logger.error(sys.exc_info())
        return HttpResponse(status=500, reason='Internal Server Error, Request Id: ' + request_id)
    else:
        return HttpResponse(json.dumps(response), content_type="application/json")


def save_happy_place(form_details):
    place_id = form_details["place_id"]

    cross = form_details["cross"]
    neighborhood_id = int(form_details["neighborhood_id"])

    google_place = google_helper.get_google_place_details(place_id=place_id)

    happy_place = HappyPlace(
        neighborhood=Neighborhood.objects.get(id=neighborhood_id)
        , name=google_place["name"]
        , address=google_place["address"]
        , cross=cross if cross else None
        , site=google_place["site"] if google_place["site"] else None
        , phone=google_place["phone"] if google_place["phone"] else None
        , latitude=google_place["latitude"]
        , longitude=google_place["longitude"]
        , price_level=google_place["price_level"] if google_place["price_level"] else None
        , google_place_id=place_id
        , time_updated=datetime.now()
    )

    logger.debug('Saving below data:')
    logger.debug(happy_place)

    happy_place.save()

    return happy_place

# def getPhotos(request, location):
#     if location.endswith('all'):
#         location = location[:len(location)-3]
#
#     folderContents=os.listdir(os.path.join(settings.STATIC_ROOT + 'photos',location))
#     photos=list(name for name in folderContents if (os.path.isfile(os.path.join(settings.STATIC_ROOT + 'photos', location + "/" + name))) and name.endswith('jpg'))
#
#     return HttpResponse(json.dumps(len(photos)), content_type="application/javascript")
#
#
# def getAverageLatLng(happyPlaces):
#     sumLat = 0
#     sumLng = 0
#
#     latLngs = [happyPlace.latLng for happyPlace in happyPlaces]
#
#     for latLng in latLngs:
#         sumLat += latLng['lat']
#         sumLng += latLng['lng']
#
#     return list([float(sumLat/len(happyPlaces)), float(sumLng/len(happyPlaces))])
#


#
# def saveNewHappyHour(formData, happyPlace):
#     happyHour = HappyHour(
#                     id=generateId(HappyHour.objects)
#                     ,notes=formData['notes']
#                     ,days=formData['days']
#                     ,start=formData['start']
#                     ,end=formData['end']
#                     ,happyPlace=happyPlace
#
#                     , timeUpdated=datetime.utcnow()
#                     )
#
#     happyHour.save()
#
#     return happyHour
#
# def saveNewFullHappyHour(formData, happyPlace):
#     happyHour = HappyHour(
#                     id=generateId(HappyHour.objects)
#                     ,notes=formData['notes']
#                     ,days=formData['days']
#                     ,start=formData['start']
#                     ,end=formData['end']
#                     ,happyPlace=happyPlace
#                     ,beer=formData['beer']
#                     ,wine_glass=formData['wine_glass']
#                     ,wine_bottle=formData['wine_bottle']
#                     ,shot_beer=formData['shot_beer']
#                     ,well=formData['well']
#                     ,display_notes=formData['display_notes']
#
#                     , timeUpdated=datetime.utcnow()
#                     )
#
#     happyHour.save()
#
#     return happyHour
#
#

# def getTodaysSpecials(self):
#     today = intToDayOfWeek((datetime.utcnow() + timedelta(hours=self.neighborhood.city.state.offset)).weekday())
#     happyHours = filter(lambda happyHour: today in happyHour.days, self.happyHours.all())
#
#     specials = []
#
#     for happyHour in happyHours:
#         displayNotes = '' if happyHour.display_notes == None else happyHour.display_notes
#         specials.append([formatTime(happyHour.start), formatTime(happyHour.end), displayNotes, [
#             ['beer', '' if happyHour.beer == None else happyHour.beer]
#             , ['wine_glass', '' if happyHour.wine_glass == None else happyHour.wine_glass]
#             , ['wine_bottle', '' if happyHour.wine_bottle == None else happyHour.wine_bottle]
#             , ['well', '' if happyHour.well == None else happyHour.well]
#             , ['shot_beer', '' if happyHour.shot_beer == None else happyHour.shot_beer]
#         ]
#                          ])
#
#     return specials