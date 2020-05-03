from django import forms
from django.db import models
from django.forms import Form

from src.site.happy_hour_helper import filter_on_days
from src.site.models import Neighborhood


class HappyPlace(models.Model):
    # foreign keys
    neighborhood = models.ForeignKey(Neighborhood, related_name='happy_places', on_delete=models.PROTECT)

    # required fields
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=75)

    # optional fields
    cross = models.CharField(max_length=50, null=True)
    site = models.CharField(max_length=75, null=True)
    phone = models.CharField(max_length=50, null=True)
    instagram_url = models.CharField(max_length=75, null=True)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    price_level = models.IntegerField(null=True)
    google_place_id = models.CharField(max_length=50, null=True, unique=True)

    time_updated = models.DateTimeField()
    active = models.BooleanField(default=True)

    def get_status(self, *args, **kwargs):
        happy_hours = list(filter_on_days(self.happy_hours.all(), kwargs['day']))

        upcoming = False

        for happy_hour in happy_hours:# TODO:add cushion
            if happy_hour.end >= kwargs['time'] >= happy_hour.start\
                    or (happy_hour.end < happy_hour.start
                        and (happy_hour.end >= kwargs['time'] or happy_hour.start <= kwargs['time'])):
                return 'ACTIVE'
            if not upcoming and happy_hour.start > kwargs['time']:
                upcoming = True

        return 'UPCOMING' if upcoming else 'NONE'

    def __str__(self):
        return self.name.__str__()

    class Meta:
        ordering = ('name',)
        db_table = "happyplace"


class HappyPlaceSubmitForm(Form):
    def __init__(self, *args, **kwargs):
        city_name = kwargs.pop('city_name')

        super(HappyPlaceSubmitForm, self).__init__(*args, **kwargs)

        self.fields['city'] = forms.CharField(initial=city_name, label='')
        self.fields['city'].widget.attrs['class'] = 'hiddenField'

        self.fields['neighborhood'] = forms.ModelChoiceField(queryset=Neighborhood.objects.filter(city__name=city_name)
                                                             .order_by('name'))
        self.fields['happy_place'] = forms.ModelChoiceField(queryset=HappyPlace.objects.all().order_by('name')
                                                            , to_field_name="id")

        self.fields['name'] = forms.CharField(max_length=200)

        self.fields['cross'] = forms.CharField(max_length=200, label='')
        self.fields['cross'].widget.attrs['class'] = 'hiddenField'

        self.fields['instagram_handle'] = forms.CharField(max_length=200, label='')
        self.fields['instagram_handle'].widget.attrs['class'] = 'hiddenField'

