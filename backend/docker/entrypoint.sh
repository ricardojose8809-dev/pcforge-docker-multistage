#!/bin/sh
set -eu

cd /var/www/html
printf '%s\n' '[PCForge] Aplicando migraciones...'
php artisan migrate --force --no-interaction
printf '%s\n' '[PCForge] Revisando catalogo inicial...'
php docker/seed-if-empty.php
printf '%s\n' '[PCForge] Arrancando PHP-FPM...'
exec php-fpm -F
