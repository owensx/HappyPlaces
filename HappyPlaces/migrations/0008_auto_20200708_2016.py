# Generated by Django 2.1.7 on 2020-07-08 20:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HappyPlaces', '0007_auto_20200707_2217'),
    ]

    operations = [
        migrations.AlterField(
            model_name='happyplace',
            name='site',
            field=models.CharField(max_length=70, null=True),
        ),
    ]
