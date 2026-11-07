FROM nginx:stable-alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY backend/public/ /var/www/html/public/
EXPOSE 80
