from HappyPlaces.settings.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'HappyPlaces',
        'USER': 'happyplacesdev',
        'PASSWORD': 'happyplacesdev',
        'HOST': 'happyplacesdbdev.ca3z3ga9nwuc.us-east-2.rds.amazonaws.com',
        'PORT': 3306,
    }
}
