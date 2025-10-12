# Stage 1: Build frontend assets with Node
FROM node:18 as node_builder

WORKDIR /app
COPY package*.json vite.config.* ./
COPY resources ./resources

RUN npm install
RUN npm run build

# Stage 2: Build PHP app with Composer and PHP-FPM
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl unzip libpq-dev libonig-dev libzip-dev zip \
    && docker-php-ext-install pdo pdo_mysql mbstring zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy Laravel files
COPY . .

# Copy built assets from Node stage
COPY --from=node_builder /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set correct permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Expose port for Render
EXPOSE 8000

# Start Laravel server with migrations
CMD php artisan config:clear && \
    php artisan migrate --force && \
    php artisan optimize && \
    php artisan serve --host=0.0.0.0 --port=$PORT
