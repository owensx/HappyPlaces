from django.urls import *
from src.site import views
from src.site.api import neighborhoods, happy_places, happy_places_status, happy_hours, google_places


google_places_api = google_places.GooglePlacesAPI()
neighborhoods_api = neighborhoods.NeighborhoodsAPI()
happy_places_api = happy_places.HappyPlacesAPI()
happy_places_status_api = happy_places_status.HappyPlacesStatusAPI()
happy_hours_api = happy_hours.HappyHoursAPI()


def handle_request(request, **kwargs):
    api = kwargs.pop('api')
    return api.handle_request(request, **kwargs)


urlpatterns = [
    path('', views.home)

    , path('admin/submit', views.admin_submit)

    , path('googlePlaces', handle_request, {'api': google_places_api})

    , path('neighborhoods', handle_request, {'api': neighborhoods_api})
    , path('neighborhoods/', handle_request, {'api': neighborhoods_api})
    , path('neighborhoods/<int:neighborhood_id>',  handle_request, {'api': neighborhoods_api})

    , path('happyPlaces', handle_request, {'api': happy_places_api})
    , path('happyPlaces/', handle_request, {'api': happy_places_api})
    , path('happyPlaces/<int:happy_place_id>', handle_request, {'api': happy_places_api})

    , path('happyPlacesStatus', handle_request, {'api': happy_places_status_api})
    , path('happyPlacesStatus/', handle_request, {'api': happy_places_status_api})

    , path('happyHours', handle_request, {'api': happy_hours_api})
    , path('happyHours/', handle_request, {'api': happy_hours_api})
    , path('happyHours/<int:happy_hour_id>', handle_request, {'api': happy_hours_api})
]