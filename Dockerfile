FROM python:3-alpine

ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code
COPY . /code/

EXPOSE 8000
RUN pwd
RUN ls -ltr
CMD ["python", "src/manage.py", "runserver", "ec2-3-17-179-42.us-east-2.compute.amazonaws.com:8000"]
