import json
import logging
import traceback
import uuid

from datetime import datetime

from django.core.exceptions import ValidationError
from django.core.serializers import serialize
from django.db import IntegrityError
from django.http.response import HttpResponse

from src.site.models import HappyPlace, Neighborhood, HappyHour

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
                , 'id': happy_place.id
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

    except (IntegrityError, ValidationError) as e:
        logger.error(traceback.format_exc())
        return HttpResponse(status=400, reason=e)
    except:
        logger.error(traceback.format_exc())
        return HttpResponse(status=500, reason='Internal Server Error, Request Id: ' + request_id)
    else:
        return HttpResponse(json.dumps(response), content_type="application/json")


def happy_hours(request, happy_hour_id=None):
    request_id = str(uuid.uuid4())
    logger.debug('Received new request, assigning id ' + request_id)

    try:
        if request.method == 'POST':
            logger.debug(request.method + str(request.POST))
            happy_hour = save_happy_hour(request.POST)

            response = {
                'request_id': request_id
                , 'happy_hour_id': happy_hour.id
            }

        elif request.method == 'GET':
            logger.debug(request.method + str(request.GET))

            if happy_hour_id is None:
                if "happy_place_id" in request.GET:
                    happy_place_id = request.GET["happy_place_id"]
                    logger.debug('Fetching all HappyHours for HappyPlace ' + happy_place_id)

                    happy_hours = HappyHour.objects.filter(happy_place__id=int(happy_place_id))
                else:
                    logger.debug('Fetching all HappyHours')

                    happy_hours = HappyHour.objects.all()
            else:
                logger.debug('Fetching HappyHour ' + str(happy_hour_id))
                #TODO: 404
                happy_hours = HappyHour.objects.filter(id=happy_hour_id)

            response = {
                'request_id': request_id
                , 'body': serialize('json', happy_hours)
            }

            logger.debug('Returning below data:')
            logger.debug(response)

    except (IntegrityError, ValidationError)as e:
        logger.error(traceback.format_exc())
        return HttpResponse(status=400, reason=e)
    except:
        logger.error(traceback.format_exc())
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

    logger.debug('Saving HappyPlace ' + happy_place.__str__())
    happy_place.save()

    return happy_place


def save_happy_hour(form_details):
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

    logger.debug('Saving HappyHour')
    happy_hour.save()

    return happy_hour


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