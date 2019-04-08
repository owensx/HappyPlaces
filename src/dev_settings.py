from src.settings import *

ALLOWED_HOSTS = ['ec2-18-221-164-96.us-east-2.compute.amazonaws.com']

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
