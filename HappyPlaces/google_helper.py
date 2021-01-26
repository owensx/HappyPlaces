import googlemaps
from googlemaps import places

import logging

GOOGLE_API_KEY = 'AIzaSyDj5RUzdluGjmLNjSVXASlDyvK_LIZ4Qq8'
google_client = googlemaps.Client(key=GOOGLE_API_KEY)

logger = logging.getLogger('console_logger')


def get_google_place_details(place_id):
    logger.debug('Searching Google for place_id: ' + place_id)
    google_place = places.place(client=google_client, place_id=place_id)['result']

    if google_place is None:
        logger.warning('No Google Place found for place_id ' + place_id)
        return None

    return format_google_details(google_place)


def query_google_places(query):
    logger.debug("Querying Google with: " + query)
    return places.places(client=google_client, query=query)['results']


def format_google_details(google_details):
    place_id = google_details['place_id']
    latitude = float(google_details['geometry']['location']['lat'])
    longitude = float(google_details['geometry']['location']['lng'])
    address = google_details['formatted_address'].split(',')[0]
    name = google_details['name']

    price_level = ''
    site = ''
    phone = ''

    try:
        price_level = google_details['price_level']
    except Exception:
        pass

    try:
        site = google_details['website']
    except Exception:
        pass

    try:
        phone = google_details['formatted_phone_number']
    except Exception:
        pass

    return {'name': name, 'address': address, 'latitude': latitude, 'longitude': longitude
            , 'price_level': price_level, 'site': site, 'phone': phone, 'place_id': place_id}
