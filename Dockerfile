FROM python:3-alpine

ARG DJANGO_SETTINGS_MODULE
ARG APPLICATION_PORT

ENV DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
ENV APPLICATION_PORT=$APPLICATION_PORT
ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code
COPY . /code/

EXPOSE $APPLICATION_PORT

RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN python src/manage.py test


CMD ["sh", "-c", "python src/manage.py runserver 0.0.0.0:${APPLICATION_PORT}"]
