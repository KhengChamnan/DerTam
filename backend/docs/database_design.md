# DerTam Database Design Again

## Database Overview
- **Database Name**: **dertam**
- **Database Type**: SQLite (Default)
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
| entry_free | BOOLEAN | NULLABLE | Whether entry is free |
| operating_hours | JSON | NULLABLE | Operating hours data |
| best_season_to_visit | ENUM('Winter','Spring','Summer','Autumn') | NULLABLE | Best season to visit |
| province_id | BIGINT UNSIGNED | NULLABLE, FOREIGN KEY | Reference to province_categories.province_categoryID |
| latitude | DECIMAL(10,7) | NULLABLE | Latitude coordinate for the place |
| longitude | DECIMAL(10,7) | NULLABLE | Longitude coordinate for the place |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Record last update timestamp |


