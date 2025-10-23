# Hotel Database Design Documentation

## Overview
This document describes the exact database structure for the hotel booking system, including all table names, columns, data types, constraints, and relationships.

---

## Tables

### 1. **properties**

The main table for storing hotel/property information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `property_id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the property |
| `name` | VARCHAR(200) | NOT NULL | Name of the property/hotel |
| `google_map_link` | VARCHAR(255) | NULLABLE | Google Maps link for the property location |
| `latitude` | DECIMAL(10,7) | NULLABLE | Latitude coordinate of the property |
| `longitude` | DECIMAL(10,7) | NULLABLE | Longitude coordinate of the property |
| `owner_user_id` | BIGINT UNSIGNED | FOREIGN KEY, NOT NULL | References `users.id` - Property owner |
| `province_category_id` | BIGINT UNSIGNED | FOREIGN KEY, NULLABLE | References `province_categories.province_categoryID` - Province/location |
| `description` | TEXT | NULLABLE | Detailed description of the property |
| `rating` | DECIMAL(2,1) | NOT NULL, DEFAULT 0.0 | Average rating of the property (0.0 - 9.9) |
| `reviews_count` | INTEGER | NULLABLE, DEFAULT 0 | Total number of reviews |
| `created_at` | TIMESTAMP | NULLABLE | Record creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Record last update timestamp |
| `image_url` | JSON | NULLABLE | Array of image URLs for the room |
| `image_public_id` | JSON | NULLABLE | Array of public IDs for images (e.g., Cloudinary) |

**Foreign Keys:**
- `owner_user_id` → `users.id` ON DELETE CASCADE
- `province_category_id` → `province_categories.province_categoryID` ON DELETE SET NULL

**Relationships:**
- One property belongs to one user (owner)
- One property has many facilities
- One property has many room properties
  
**JSON Fields Format:**
- `images_url`: `["https://example.com/image1.jpg", "https://example.com/image2.jpg"]`
- `image_public_ids`: `["cloudinary_id_1", "cloudinary_id_2"]`

---

### 2. **facilities**

Stores general facilities/amenities available at the property level (e.g., parking, pool, gym).

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `facility_id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the facility |
| `property_id` | BIGINT UNSIGNED | FOREIGN KEY, NOT NULL | References `properties.property_id` |
| `facility_name` | VARCHAR(150) | NOT NULL | Name of the facility |
| `created_at` | TIMESTAMP | NULLABLE | Record creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Record last update timestamp |

**Foreign Keys:**
- `property_id` → `properties.property_id` ON DELETE CASCADE

**Relationships:**
- One facility belongs to one property

---

### 3. **room_properties**

Stores information about different room types available at a property.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `room_properties_id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the room property |
| `property_id` | BIGINT UNSIGNED | FOREIGN KEY, NOT NULL | References `properties.property_id` |
| `room_type` | VARCHAR(100) | NOT NULL | Type of room (e.g., Deluxe, Suite, Standard) |
| `room_description` | VARCHAR(255) | NULLABLE | Description of the room |
| `max_guests` | INTEGER | NOT NULL, DEFAULT 2 | Maximum number of guests allowed |
| `room_size` | VARCHAR(50) | NULLABLE | Size of the room (e.g., "30 sqm") |
| `price_per_night` | INTEGER | NOT NULL, DEFAULT 0 | Price per night in base currency |
| `is_available` | BOOLEAN | NULLABLE, DEFAULT TRUE | Availability status of the room |
| `images_url` | JSON | NULLABLE | Array of image URLs for the room |
| `image_public_ids` | JSON | NULLABLE | Array of public IDs for images (e.g., Cloudinary) |
| `created_at` | TIMESTAMP | NULLABLE | Record creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Record last update timestamp |

**Foreign Keys:**
- `property_id` → `properties.property_id` ON DELETE CASCADE

**Relationships:**
- One room property belongs to one property
- One room property has many amenities

**JSON Fields Format:**
- `images_url`: `["https://example.com/image1.jpg", "https://example.com/image2.jpg"]`
- `image_public_ids`: `["cloudinary_id_1", "cloudinary_id_2"]`

---

### 4. **amenities**

Stores room-specific amenities (e.g., WiFi, TV, minibar, air conditioning).

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `amenity_id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the amenity |
| `room_properties_id` | BIGINT UNSIGNED | FOREIGN KEY, NOT NULL | References `room_properties.room_properties_id` |
| `amenity_name` | VARCHAR(100) | NOT NULL | Name of the amenity |
| `is_available` | BOOLEAN | NULLABLE, DEFAULT TRUE | Availability status of the amenity |
| `created_at` | TIMESTAMP | NULLABLE | Record creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Record last update timestamp |

**Foreign Keys:**
- `room_properties_id` → `room_properties.room_properties_id` ON DELETE CASCADE

**Relationships:**
- One amenity belongs to one room property

**Note:** Originally, amenities were linked to properties, but this was changed to link to room_properties for more granular control (migration: `2025_10_23_075024_change_amenity_foreign_key_to_room_property.php`).

  

## Booking System Tables

### 5. **booking_details**

The main table for storing hotel booking information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `booking_id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the booking |
| `trip_id` | BIGINT UNSIGNED | FOREIGN KEY, NULLABLE | References `trips.trip_id` - Associated trip |
| `full_name` | VARCHAR(100) | NOT NULL | Full name of the guest |
| `age` | INTEGER | NULLABLE | Age of the guest |
| `gender` | ENUM('Male', 'Female', 'Other') | NULLABLE | Gender of the guest |
| `mobile` | VARCHAR(20) | NULLABLE | Mobile phone number |
| `email` | VARCHAR(100) | NULLABLE | Email address |
| `id_number` | VARCHAR(50) | NULLABLE | Identification number (passport/ID card) |
| `id_image` | VARCHAR(255) | NULLABLE | URL/path to ID image |
| `check_in` | DATE | NOT NULL | Check-in date |
| `check_out` | DATE | NOT NULL | Check-out date |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Total booking amount |
| `payment_method` | ENUM('KHQR', 'ABA_QR', 'Cash', 'Acleda_Bank') | NULLABLE | Payment method used |
| `status` | ENUM('pending', 'paid', 'cancelled') | NOT NULL, DEFAULT 'pending' | Booking status |
| `merchant_ref_no` | VARCHAR(100) | UNIQUE, NULLABLE | Merchant reference number for payment |
| `tran_id` | VARCHAR(100) | NULLABLE | Transaction ID from payment gateway |
| `payment_date` | DATETIME | NULLABLE | Date and time of payment |
| `payment_status` | ENUM('success', 'failed', 'pending') | NOT NULL, DEFAULT 'pending' | Payment status |
| `created_at` | TIMESTAMP | NULLABLE | Record creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Record last update timestamp |

**Foreign Keys:**
- `trip_id` → `trips.trip_id` ON DELETE SET NULL (optional relationship)

**Relationships:**
- One booking detail may belong to one trip (optional)
- One booking detail has many booking rooms

---

### 6. **booking_rooms**

Junction table linking bookings to specific rooms.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the booking room entry |
| `booking_id` | INT UNSIGNED | FOREIGN KEY, NOT NULL | References `booking_details.booking_id` |
| `room_id` | BIGINT UNSIGNED | FOREIGN KEY, NOT NULL | References `room_properties.room_properties_id` |

**Foreign Keys:**
- `booking_id` → `booking_details.booking_id` ON DELETE CASCADE
- `room_id` → `room_properties.room_properties_id`

**Relationships:**
- One booking room entry belongs to one booking detail
- One booking room entry belongs to one room property

**Note:** This table has no timestamps as it's a pure junction table.

## Relationships Summary

### Properties
- **Belongs To:** `users` (via `owner_user_id`)
- **Has Many:** `facilities`, `room_properties`

### Facilities
- **Belongs To:** `properties` (via `property_id`)

### Room Properties
- **Belongs To:** `properties` (via `property_id`)
- **Has Many:** `amenities`, `booking_rooms`

### Amenities
- **Belongs To:** `room_properties` (via `room_properties_id`)

### Booking Details
- **Belongs To:** `trips` (via `trip_id`) - Optional relationship
- **Has Many:** `booking_rooms`

### Booking Rooms
- **Belongs To:** `booking_details` (via `booking_id`)
- **Belongs To:** `room_properties` (via `room_id`)

---

