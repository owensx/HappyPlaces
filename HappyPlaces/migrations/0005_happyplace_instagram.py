# Generated by Django 2.1.7 on 2020-04-29 23:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HappyPlaces', '0004_auto_20190501_0506'),
    ]

    operations = [
        migrations.AddField(
            model_name='happyplace',
            name='instagram',
            field=models.CharField(max_length=75, null=True),
        ),
    ]