from django import forms
from django.db import models
from django.core import serializers
from django.forms import ModelForm
from django.http.response import HttpResponse


class City(models.Model):
    # required fields
    name = models.CharField(max_length=50)

    time_updated = models.DateTimeField()

    def __str__(self):
        return self.name.__str__()

    class Meta:
        ordering = ('name',)
        db_table = "city"


class Neighborhood(models.Model):
    # foreign keys
    city = models.ForeignKey(City, related_name='neighborhoods', on_delete=models.PROTECT)

    # required fields
    name = models.CharField(max_length=50)

    time_updated = models.DateTimeField()

    def __str__(self):
        return self.name.__str__()

    class Meta:
        ordering = ('name',)
        db_table = "neighborhood"


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
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    price_level = models.IntegerField(null=True)
    google_place_id = models.CharField(max_length=50, null=True)

    time_updated = models.DateTimeField()
    active = models.BooleanField(default=False)

    @property
    def lat_lng(self):
        return {'lat': self.latitude, 'lng': self.longitude}

    @property
    def marker_info(self):
        return list([
            self.name
            , self.lat_lng
            , self.todaysSpecials
        ])

    def render_to_response(self):
        data = serializers.serialize('json', self.get_queryset())
        return HttpResponse(data, content_type="application/json")

    def __str__(self):
        return self.name.__str__()

    class Meta:
        ordering = ('name',)
        db_table = "happyplace"


class HappyPlaceSubmitForm(ModelForm):
    def __init__(self, *args, **kwargs):
        city_name = kwargs.pop('city_name')

        super(HappyPlaceSubmitForm, self).__init__(*args, **kwargs)
        self.fields['city'] = forms.CharField(initial=city_name, widget=forms.HiddenInput())
        self.fields['neighborhood'] = forms.ModelChoiceField(queryset=Neighborhood.objects.filter(city__name=city_name)
                                                             .order_by('name'), required=True, to_field_name="name")

        self.fields['name'].required = True

    class Meta:
        model = HappyPlace
        exclude = ('time_updated', 'active')

        widgets = {
            'cross': forms.HiddenInput()
            , 'site': forms.HiddenInput()
            , 'phone': forms.HiddenInput()
            , 'latitude': forms.HiddenInput()
            , 'longitude': forms.HiddenInput()
            , 'price_level': forms.HiddenInput()
            , 'google_place_id': forms.HiddenInput()
        }


class HappyHour(models.Model):
    # foreign keys
    happy_place = models.ForeignKey(HappyPlace, related_name='happy_hours', on_delete=models.CASCADE)

    # required fields
    notes = models.CharField(max_length=200)

    # optional fields
    start = models.TimeField()
    end = models.TimeField()
    beer = models.CharField(max_length=200, null=True)
    wine_glass = models.CharField(max_length=200, null=True)
    wine_bottle = models.CharField(max_length=200, null=True)
    well = models.CharField(max_length=200, null=True)
    shot_beer = models.CharField(max_length=200, null=True)
    display_notes = models.CharField(max_length=200, null=True)
    sunday = models.BooleanField(default=False)
    monday = models.BooleanField(default=False)
    tuesday = models.BooleanField(default=False)
    wednesday = models.BooleanField(default=False)
    thursday = models.BooleanField(default=False)
    friday = models.BooleanField(default=False)
    saturday = models.BooleanField(default=False)

    time_updated = models.DateTimeField()

    class Meta:
        db_table = "happyhour"


class HappyHourSubmitForm(ModelForm):
    class Meta:
        model = HappyHour
        exclude = ('time_updated',)
