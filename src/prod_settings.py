from src.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'HappyPlaces',
        'USER': 'happyplacesprod',
        'PASSWORD': 'happyplacesprod',
        'HOST': 'happyplacesprod.ca3z3ga9nwuc.us-east-2.rds.amazonaws.com',
        'PORT': 3306,
    }
}
