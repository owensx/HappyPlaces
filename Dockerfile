FROM python:3.9-buster

ARG DJANGO_SETTINGS_MODULE

ENV DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
ENV PYTHONUNBUFFERED=1
ENV WORKDIR="/code"

RUN mkdir $WORKDIR
COPY HappyPlaces $WORKDIR/HappyPlaces
COPY static $WORKDIR/static

WORKDIR $WORKDIR
RUN ls -ltr

#apt dependencies
RUN apt update
RUN apt install -y systemd apache2 apache2-dev default-libmysqlclient-dev

#pip dependencies
RUN pip install --upgrade pip
RUN pip install -r HappyPlaces/requirements.txt
#python3.9 specific dependencies
RUN python3.9 -m pip install mod_wsgi

#enable site in apache
RUN mv HappyPlaces/happyplaces.conf /etc/apache2/sites-available
RUN a2ensite happyplaces
RUN a2dissite *default

#add WORKDIR to apache environment
RUN echo "export WORKDIR=$WORKDIR" >> /etc/apache2/envvars

#pipe logs to stdout
RUN ln -sf /dev/stdout /var/log/apache2/error.log

CMD ["apachectl", "-D", "FOREGROUND"]


#RUN python src/manage.py migrate --no-input