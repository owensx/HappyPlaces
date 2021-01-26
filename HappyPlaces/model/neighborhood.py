from django.db import models
from HappyPlaces.model.city import City


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