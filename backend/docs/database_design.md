# DerTam Database Design Again

## Database Overview
- **Database Name**: **dertam**
- **Database Type**: MYSQL (Default)
- **Framework**: Laravel 11

## Core Tables

### Users Table
Main table for user authentication and profile management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| google_id | VARCHAR(255) | NULLABLE | Google OAuth ID for social login |
| avatar | VARCHAR(255) | NULLABLE | URL to user's profile picture |
| email_verified_at | TIMESTAMP | NULLABLE | Email verification timestamp |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| remember_token | VARCHAR(100) | NULLABLE | Remember me token |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Record last update timestamp |



## Tourism Management Tables

### Place Categories Table
Table for managing place categories (restaurants, attractions, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| placeCategoryID | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique place category identifier |
| category_name | VARCHAR(255) | NULLABLE | Place category name |
| category_description | TEXT | NULLABLE | Place category description |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Record last update timestamp |

### Province Categories Table
Table for managing province/location categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| province_categoryID | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique province category identifier |
| province_categoryName | VARCHAR(255) | NULLABLE | Province category name |
| category_description | TEXT | NULLABLE | Province category description |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Record last update timestamp |

### Places Table
Main table for managing tourist places and locations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| placeID | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique place identifier |
| name | VARCHAR(255) | NULLABLE | Place name |
| description | TEXT | NULLABLE | Place description |
| category_id | BIGINT UNSIGNED | NULLABLE, FOREIGN KEY | Reference to place_categories.placeCategoryID |
| google_maps_link | VARCHAR(500) | NULLABLE | Google Maps link for the place |
| ratings | DECIMAL(3,2) | NULLABLE | Average rating (0.00-5.00) |
| reviews_count | INTEGER | NULLABLE | Number of reviews |
| images_url | JSON | NULLABLE | Array of image URLs |
| image_public_ids | JSON | NULLABLE | Array of Cloudinary public IDs matching images_url |
| entry_free | BOOLEAN | NULLABLE | Whether entry is free |
| operating_hours | JSON | NULLABLE | Operating hours data |
| best_season_to_visit | ENUM('Winter','Spring','Summer','Autumn') | NULLABLE | Best season to visit |
| province_id | BIGINT UNSIGNED | NULLABLE, FOREIGN KEY | Reference to province_categories.province_categoryID |
| latitude | DECIMAL(10,7) | NULLABLE | Latitude coordinate for the place |
| longitude | DECIMAL(10,7) | NULLABLE | Longitude coordinate for the place |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Record last update timestamp |

## Trip Management Tables

### Trips Table
Table for managing user trips and itineraries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| trip_id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique trip identifier |
| user_id | BIGINT UNSIGNED | NOT NULL, FOREIGN KEY | Reference to users.id |
| trip_name | VARCHAR(255) | NOT NULL | Name of the trip |
| start_date | DATE | NULLABLE | Trip start date |
| end_date | DATE | NULLABLE | Trip end date |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Record last update timestamp |

**Foreign Key Constraints:**
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

### Trip Days Table
Table for managing individual days within a trip.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| trip_day_id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique trip day identifier |
| trip_id | BIGINT UNSIGNED | NOT NULL, FOREIGN KEY | Reference to trips.trip_id |
| date | DATE | NOT NULL | Date for this trip day |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Record last update timestamp |

**Foreign Key Constraints:**
- `trip_id` REFERENCES `trips(trip_id)` ON DELETE CASCADE

### Trip Places Table
Table for managing places associated with specific trip days.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| trip_place_id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique trip place identifier |
| trip_day_id | BIGINT UNSIGNED | NOT NULL, FOREIGN KEY | Reference to trip_days.trip_day_id |
| place_id | BIGINT UNSIGNED | NULLABLE, FOREIGN KEY | Reference to places.placeID |
| notes | TEXT | NULLABLE | User notes for this place in the trip |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Record last update timestamp |

**Foreign Key Constraints:**
- `trip_day_id` REFERENCES `trip_days(trip_day_id)` ON DELETE CASCADE
- `place_id` REFERENCES `places(placeID)` ON DELETE SET NULL


