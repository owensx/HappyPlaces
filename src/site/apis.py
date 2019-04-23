import json
import logging
from datetime import datetime

from django.core.serializers import serialize
from django.http.response import HttpResponse

from src.site.models import HappyPlace, Neighborhood

import src.site.google_helper as google_helper

logger = logging.getLogger(__name__)


def get_google_places(request):
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
    return HttpResponse(json.dumps(response), content_type="application/javascript")


def get_happy_places_for_neighborhood(request):
    neighborhood_id = int(request.GET["neighborhood_id"])
    happy_places = HappyPlace.objects.filter(neighborhood__id=neighborhood_id)
    happy_places = serialize('json', happy_places)

    response = {
        'request_id': 1
        , 'body': happy_places
    }

    logger.debug('Returning below data:')
    logger.debug(response)
    return HttpResponse(json.dumps(response), content_type="application/javascript")


def save_happy_place(request):
    cross = request.POST["cross"]
    place_id = request.POST["place_id"]
    neighborhood_id = int(request.POST["neighborhood_id"])

    if HappyPlace.objects.filter(google_place_id=place_id).first() is not None:
        return HttpResponse(status=400, reason='Duplicate Happy Place')

    google_place = google_helper.get_google_place_details(place_id=place_id)

    happy_place = HappyPlace(
        neighborhood=Neighborhood.objects.get(id=neighborhood_id)
        , name=google_place["name"]
        , address=google_place["address"]
        , cross=cross
        , site=google_place["site"]
        , phone=google_place["phone"]
        , latitude=google_place["latitude"]
        , longitude=google_place["longitude"]
        , price_level=google_place["price_level"]
        , google_place_id=place_id
        , time_updated=datetime.now()
    )

    logger.debug('Saving below data:')
    logger.debug(happy_place)

    #happy_place.save()
    return HttpResponse()


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