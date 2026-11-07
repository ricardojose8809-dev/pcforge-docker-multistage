# syntax=docker/dockerfile:1.7
# Base compartida: las extensiones PHP se construyen una sola vez.
FROM php:8.4-fpm-alpine AS php-base
WORKDIR /var/www/html
RUN set -eux; \
    apk add --no-cache icu-libs libzip oniguruma libxml2; \
    apk add --no-cache --virtual .php-build-deps $PHPIZE_DEPS icu-dev libzip-dev oniguruma-dev libxml2-dev; \
    docker-php-ext-install -j "$(nproc)" bcmath intl mbstring pdo_mysql xml zip opcache; \
    apk del .php-build-deps; \
    cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"; \
    printf '%s\n' '[www]' 'clear_env = no' > /usr/local/etc/php-fpm.d/zz-pcforge-env.conf

FROM php-base AS composer-build
ENV COMPOSER_ALLOW_SUPERUSER=1
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --no-progress
COPY . .
RUN composer dump-autoload --no-dev --optimize --no-scripts \
    && php artisan package:discover --ansi

FROM php-base AS runtime
COPY . .
COPY --from=composer-build /var/www/html/vendor ./vendor
COPY --from=composer-build /var/www/html/bootstrap/cache ./bootstrap/cache
RUN set -eux; \
    mkdir -p storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache; \
    chown -R www-data:www-data storage bootstrap/cache; \
    chmod -R ug+rwX storage bootstrap/cache
USER www-data
EXPOSE 9000
ENTRYPOINT ["sh", "/var/www/html/docker/entrypoint.sh"]
