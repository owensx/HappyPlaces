FROM python:3-alpine

ARG DJANGO_SETTINGS_MODULE

ENV DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code
COPY . /code/

EXPOSE 8000

RUN pip install -r requirements.txt
RUN python src/manage.py migrate src.site

CMD ["python", "src/manage.py", "runserver", "0.0.0.0:8000"]
