# Stage 1: Composer dependencies
FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Stage 2: PHP runtime
FROM php:8.2-fpm

# Install PHP extensions
RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libzip-dev libpng-dev \
    && docker-php-ext-install pdo pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# Copy Laravel project
COPY . .

# Copy vendor from Composer stage
COPY --from=vendor /app/vendor ./vendor

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 8000

# Commands to optimize and run API
CMD php artisan config:clear && \
    php artisan optimize && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
