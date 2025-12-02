# Stage 1: Build Laravel Vite Assets
FROM node:20 AS node_builder

WORKDIR /app

# Copy ONLY necessary files from Laravel root
COPY package*.json vite.config.* ./
COPY resources ./resources

RUN npm install
RUN npm run build


# Stage 2: Build Laravel (PHP app)
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git curl unzip libonig-dev libzip-dev zip libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql mbstring zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# IMPORTANT: copy whole Laravel app
COPY ../ .

# Copy built frontend to Laravel public
COPY --from=node_builder /app/public/build ./public/build

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=$PORT
