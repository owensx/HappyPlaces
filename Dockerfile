FROM python:3-alpine

ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code
COPY . /code/

EXPOSE 8000
RUN pwd
RUN ls -ltr
CMD ["python", "src/manage.py", "runserver", "ec2-18-218-153-198.us-east-2.compute.amazonaws.com"]
