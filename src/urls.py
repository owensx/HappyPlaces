from django.urls import *
from src.site import views
from src.site import apis

urlpatterns = [
   path('admin/submit', views.admin_submit)
   , path('getGooglePlaces', apis.get_google_places)
   , path('getHappyPlacesForNeighborhood', apis.get_happy_places_for_neighborhood)
   , path('saveHappyPlace', apis.save_happy_place)
]#'',
    # Examples:
    # url(r'^$', 'src.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

#    url(r'^admin/', include(admin.site.urls)),
    
    #url(r'^happyPlace/(?P<happyPlaceId>\d+)', 'src.site.views.HappyPlaceView', name='viewHappyPlace'),
  #  url(r'^submit/', 'src.site.views.Submit', name='submit'),
#     url(r'^submitState/', 'src.site.views.SubmitState', name='submitState'),
#     url(r'^submitCityForState/(?P<stateId>[0-9]*)/$', 'src.site.views.SubmitCityForState', name='submitCityForState'),
#     url(r'^submitHappyPlaceForCity/(?P<cityId>[0-9]*)/$', 'src.site.views.SubmitHappyPlaceForCity', name='submitHappyPlaceForCity'),
#     url(r'^submitHappyHourForHappyPlace/(?P<happyPlaceId>[0-9]*)/$', 'src.site.views.SubmitHappyHourForHappyPlace', name='submitHappyHourForHappyPlace'),
 #   url(r'^error/', 'src.site.views.Error', name='error'),
  #  url(r'^getNeighborhoods/(?P<cityToSearch>\w+)', 'src.site.utils.getNeighborhoodsForCity', name='getNeighborhoodsForCity'),
 #   url(r'^getHappyPlaces/(?P<neighborhoodToSearch>\w+)', 'src.site.utils.getHappyPlacesForNeighborhood', name='getHappyPlacesForNeighborhood'),

  #  url(r'^getHappyPlace/(?P<happyPlaceId>\w+)', 'src.site.utils.getHappyPlace', name='getHappyPlace'),

 #   url(r'^getPhotos/(?P<location>.+\/.+)', 'src.site.utils.getPhotos', name = 'getPhotos'),
 #   url(r'^getPlaceId/(?P<queryString>.+)', 'src.site.utils.getPlaceId', name = 'getPlaceId'),
 #   url(r'^', 'src.site.views.Home', name='home'),
        
#] + staticfiles_urlpatterns()

