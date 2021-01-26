from django.db import models
from django.forms import ModelForm

from HappyPlaces.model.happy_place import HappyPlace


class HappyHour(models.Model):
    EDITABLE_FIELDS = [
        'start'
        , 'end'
        , 'notes'
        , 'beer'
        , 'wine_glass'
        , 'wine_bottle'
        , 'well'
        , 'shot_beer'
        , 'sunday'
        , 'monday'
        , 'tuesday'
        , 'wednesday'
        , 'thursday'
        , 'friday'
        , 'saturday'
    ]
    # foreign keys
    happy_place = models.ForeignKey(HappyPlace, related_name='happy_hours', on_delete=models.CASCADE)

    # required fields
    start = models.TimeField()
    end = models.TimeField()

    # optional fields
    notes = models.CharField(max_length=200, null=True)
    beer = models.FloatField(null=True)
    wine_glass = models.FloatField(null=True)
    wine_bottle = models.FloatField(null=True)
    well = models.FloatField(null=True)
    shot_beer = models.FloatField(null=True)
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
        exclude = ('happy_place', 'time_updated',)

