FROM python:3.9-buster

ARG DJANGO_SETTINGS_MODULE
ARG APPLICATION_PORT

ENV DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
ENV APPLICATION_PORT=$APPLICATION_PORT
ENV PYTHONUNBUFFERED=1
ENV WORKDIR="/code"

EXPOSE $APPLICATION_PORT

RUN mkdir $WORKDIR
COPY . $WORKDIR/
WORKDIR $WORKDIR

#apt dependencies
RUN apt update
RUN apt install -y systemd apache2 apache2-dev default-libmysqlclient-dev

#pip dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
#python3.9 specific dependencies
RUN python3.9 -m pip install mod_wsgi

#enable site in apache
RUN mv $WORKDIR/happyplaces.conf /etc/apache2/sites-available
RUN a2ensite happyplaces
RUN a2dissite *default

#add WORKDIR to apache environment
RUN echo "export WORKDIR=$WORKDIR" >> /etc/apache2/envvars
RUN tail -f /var/log/apache2/error.log &

CMD ["sudo", "apachectl", "-D", "FOREGROUND"]


#RUN python src/manage.py migrate --no-input