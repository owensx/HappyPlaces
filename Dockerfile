FROM python:3-alpine

ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code
COPY . /code/

EXPOSE 8000
RUN pwd
RUN ls -ltr
RUN pip install -r requirements.txt
CMD ["python", "src/manage.py", "runserver", "0.0.0.0:8000"]
