from src.site.models import HappyHour, HappyPlace

from datetime import datetime


def create_happy_hour_from_form_data(form_details):
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

    return happy_hour
