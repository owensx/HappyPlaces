FROM python:3.7-alpine

ARG DJANGO_SETTINGS_MODULE
ARG APPLICATION_PORT

ENV DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
ENV APPLICATION_PORT=$APPLICATION_PORT
ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code
COPY . /code/

RUN apk add --no-cache --virtual .build-deps gcc \
     && pip install --upgrade pip \
     && pip install -r requirements.txt \
     && apk del .build-deps gcc

EXPOSE $APPLICATION_PORT

RUN python src/manage.py test


CMD ["sh", "-c", "python src/manage.py runserver 0.0.0.0:${APPLICATION_PORT}"]
