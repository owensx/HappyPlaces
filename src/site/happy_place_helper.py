from src.site import google_helper
from src.site.models import HappyPlace, Neighborhood

from datetime import datetime


def create_happy_place_from_form_data(form_details):
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

    return happy_place
