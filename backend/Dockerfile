# Stage 1: Composer dependencies
FROM php:8.2-cli AS vendor

# Install required system packages + PHP extensions for Composer stage
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip

WORKDIR /app
COPY composer.json composer.lock ./

RUN composer install --no-dev --optimize-autoloader --no-interaction


# Stage 2: PHP runtime (FPM)
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# Copy Laravel files
COPY . .

# Copy vendor from Composer stage
COPY --from=vendor /app/vendor ./vendor

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD php artisan config:clear && \
    php artisan optimize && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
