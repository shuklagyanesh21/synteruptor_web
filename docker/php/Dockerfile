FROM php:fpm-alpine

RUN apk upgrade
RUN apk add git

#RUN git clone https://github.com/i2bc/synteruptor_web.git && cd synteruptor_web && git checkout dev
RUN mkdir -p /usr/share/nginx/html/
RUN mv synteruptor_web/* /usr/share/nginx/html/
RUN mkdir /usr/share/nginx/html/db
