# API Data Models Reference

This document describes the database models and data fields used in each API endpoint's JSON response.

---****

## Table of **Contents**

1. [Database Models Overview](#database-models-overview)
2. [API Endpoints & Response Data](#api-endpoints--response-data)
3. [Field Definitions](#field-definitions)
4. [Data Relationships](#data-relationships)

---

## Database Models Overview

### 1. Place Model
**Table:** `places`  
**Primary Key:** `placeID` (BIGINT)

**Fields:**
- `placeID` - Unique identifier
- `name` - Place name (VARCHAR 255)
- `description` - Place description (TEXT)
- `category_id` - Foreign key to `place_categories`
- `google_maps_link` - Google Maps URL (VARCHAR 500)
- `ratings` - Average rating (DECIMAL 3,2)
- `reviews_count` - Total number of reviews (INTEGER)
- `images_url` - JSON array of image URLs
- `image_public_ids` - JSON array of Cloudinary public IDs
- `entry_free` - Whether entry is free (BOOLEAN)
- `operating_hours` - JSON object of hours
- `best_season_to_visit` - VARCHAR 100
- `province_id` - Foreign key to `province_categories`
- `latitude` - Latitude coordinate (DECIMAL)
- `longitude` - Longitude coordinate (DECIMAL)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `belongsTo` PlaceCategory (via `category_id`)
- `belongsTo` ProvinceCategory (via `province_id`)
- `hasMany` Events (via `place_id`)

---

### 2. Event Model
**Table:** `events`  
**Primary Key:** `id` (BIGINT)

**Fields:**
- `id` - Unique identifier
- `title` - Event title (VARCHAR 255)
- `description` - Event description (TEXT)
- `image_url` - Event image URL (VARCHAR 500)
- `place_id` - Foreign key to `places.placeID` (nullable)
- `province_id` - Foreign key to `province_categories` (nullable)
- `start_at` - Event start date/time (DATETIME)
- `end_at` - Event end date/time (DATETIME, nullable)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `belongsTo` Place (via `place_id`)
- `belongsTo` ProvinceCategory (via `province_id`)

---

### 3. PlaceCategory Model
**Table:** `place_categories`  
**Primary Key:** `placeCategoryID` (BIGINT)

**Fields:**
- `placeCategoryID` - Unique identifier
- `category_name` - Category name (VARCHAR 100)
- `category_description` - Category description (TEXT)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `hasMany` Places (via `category_id`)

---

### 4. ProvinceCategory Model
**Table:** `province_categories`  
**Primary Key:** `province_categoryID` (BIGINT)

**Fields:**
- `province_categoryID` - Unique identifier
- `province_categoryName` - Province name (VARCHAR 100)
- `category_description` - Province description (TEXT)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `hasMany` Places (via `province_id`)
- `hasMany` Events (via `province_id`)

---

## API Endpoints & Response Data

### 1. GET `/api/place-categories`
**Purpose:** List all available place categories  
**Controller:** `PlaceCategoryController@index`  
**Cache:** 600 seconds (10 minutes)

**Data Sources:**
- **Primary Table:** `place_categories`

**Response Structure:**
```json
[
  {
    "id": 1,
    "name": "Lake"
  },
  {
    "id": 2,
    "name": "Beach"
  }
]
```

**Fields Returned:**
| Field | Source Model | Source Field | Type | Description |
|-------|--------------|--------------|------|-------------|
| `id` | PlaceCategory | `placeCategoryID` | integer | Category unique identifier |
| `name` | PlaceCategory | `category_name` | string | Category display name |

---

### 2. GET `/api/places/search`
**Purpose:** Global search across places by name/description  
**Controller:** `PlaceBrowseController@search`  
**Cache:** 60 seconds

**Query Parameters:**
- `q` (required) - Search text
- `province_id` (optional) - Filter by province
- `limit` (optional) - Max results (default: 20, max: 50)

**Data Sources:**
- **Primary Table:** `places`
- **Joined Tables:** `province_categories` (LEFT JOIN)

**Response Structure:**
```json
[
  {
    "placeID": 1,
    "name": "Lake Azul",
    "image_url": "https://example.com/image1.jpg",
    "ratings": 4.7,
    "location": "Battambang",
    "province_id": 2
  }
]
```

**Fields Returned:**
| Field | Source Model | Source Field | Type | Description |
|-------|--------------|--------------|------|-------------|
| `placeID` | Place | `placeID` | integer | Place unique identifier |
| `name` | Place | `name` | string | Place name |
| `image_url` | Place | `images_url[0]` | string\|null | First image from JSON array (extracted via JSON_EXTRACT) |
| `ratings` | Place | `ratings` | float | Average rating score |
| `location` | ProvinceCategory | `province_categoryName` | string | Province name |
| `province_id` | Place | `province_id` | integer | Province foreign key |

**Sorting Logic:**
1. `ratings` DESC
2. `reviews_count` DESC

**Search Logic:**
- Searches in `places.name` and `places.description` using LIKE `%query%`

---

### 3. GET `/api/places/by-category`
**Purpose:** Browse places by category or get popular places  
**Controller:** `PlaceBrowseController@byCategory`  
**Cache:** 60 seconds

**Query Parameters:**
- `category` (optional) - Special value: `popular`
- `category_id` (optional) - Place category ID (required unless category=popular)
- `province_id` (optional) - Filter by province
- `page` (optional) - Page number (default: 1)
- `per_page` (optional) - Results per page (default: 10, max: 20)

**Data Sources:**
- **Primary Table:** `places`
- **Joined Tables:** 
  - `province_categories` (LEFT JOIN)
  - `place_categories` (LEFT JOIN)

**Response Structure:**
```json
[
  {
    "placeID": 3,
    "name": "Sunset Beach",
    "image_url": "https://example.com/beach.jpg",
    "ratings": 4.6,
    "location": "Preah Sihanouk",
    "province_id": 5
  }
]
```

**Fields Returned:**
| Field | Source Model | Source Field | Type | Description |
|-------|--------------|--------------|------|-------------|
| `placeID` | Place | `placeID` | integer | Place unique identifier |
| `name` | Place | `name` | string | Place name |
| `image_url` | Place | `images_url[0]` | string\|null | First image from JSON array |
| `ratings` | Place | `ratings` | float | Average rating score |
| `location` | ProvinceCategory | `province_categoryName` | string | Province name |
| `province_id` | Place | `province_id` | integer | Province foreign key |

**Sorting Logic:**
- **Popular:** `ratings` DESC, `reviews_count` DESC
- **By Category:** Filter by `category_id`, then `ratings` DESC

---

### 4. GET `/api/places/recommended`
**Purpose:** Get personalized recommendations (currently top-rated places)  
**Controller:** `RecommendationController@index`  
**Cache:** 60 seconds

**Query Parameters:**
- `province_id` (optional) - Filter by province
- `limit` (optional) - Max results (default: 10, max: 20)

**Data Sources:**
- **Primary Table:** `places`
- **Joined Tables:** `province_categories` (LEFT JOIN)

**Response Structure:**
```json
[
  {
    "placeID": 7,
    "name": "Mountain Peak",
    "image_url": "https://example.com/mountain.jpg",
    "ratings": 4.9,
    "location": "Mondulkiri",
    "province_id": 8
  }
]
```

**Fields Returned:**
| Field | Source Model | Source Field | Type | Description |
|-------|--------------|--------------|------|-------------|
| `placeID` | Place | `placeID` | integer | Place unique identifier |
| `name` | Place | `name` | string | Place name |
| `image_url` | Place | `images_url[0]` | string\|null | First image from JSON array |
| `ratings` | Place | `ratings` | float | Average rating score |
| `location` | ProvinceCategory | `province_categoryName` | string | Province name |
| `province_id` | Place | `province_id` | integer | Province foreign key |

**Sorting Logic:**
1. `ratings` DESC
2. `reviews_count` DESC

---

### 5. GET `/api/events/upcoming`
**Purpose:** Get list of upcoming events  
**Controller:** `EventController@upcoming`  
**Cache:** 60 seconds

**Query Parameters:**
- `province_id` (optional) - Filter by province
- `limit` (optional) - Max results (default: 10, max: 20)

**Data Sources:**
- **Primary Table:** `events`
- **Joined Tables:** `places` (LEFT JOIN)

**Response Structure:**
```json
[
  {
    "id": 10,
    "title": "Festival",
    "image_url": "https://example.com/festival.jpg",
    "start_at": "2025-12-10T10:00:00.000000Z",
    "end_at": "2025-12-12T16:00:00.000000Z",
    "place_id": 3,
    "place_name": "Sunset Beach",
    "province_id": 5
  }
]
```

**Fields Returned:**
| Field | Source Model | Source Field | Type | Description |
|-------|--------------|--------------|------|-------------|
| `id` | Event | `id` | integer | Event unique identifier |
| `title` | Event | `title` | string | Event name/title |
| `image_url` | Event | `image_url` | string\|null | Event image URL |
| `start_at` | Event | `start_at` | datetime | Event start date/time (ISO 8601) |
| `end_at` | Event | `end_at` | datetime\|null | Event end date/time (ISO 8601) |
| `place_id` | Event | `place_id` | integer\|null | Associated place ID |
| `place_name` | Place | `name` | string\|null | Associated place name (via JOIN) |
| `province_id` | Event | `province_id` | integer\|null | Province foreign key |

**Filtering Logic:**
- Returns events where `start_at >= NOW()` OR `end_at >= NOW()`

**Sorting Logic:**
- `start_at` ASC (earliest events first)

---

## Field Definitions

### Common Field Types

#### Image URL Extraction
**Field:** `image_url`  
**Source:** `places.images_url` (JSON array)  
**Extraction:** `JSON_UNQUOTE(JSON_EXTRACT(places.images_url, '$[0]'))`  
**Type:** string | null  
**Description:** Extracts the first image URL from the JSON array. Returns null if array is empty or null.

#### Ratings
**Field:** `ratings`  
**Type:** float (decimal 3,2)  
**Range:** 0.00 - 5.00  
**Description:** Average rating calculated from user reviews

#### Reviews Count
**Field:** `reviews_count`  
**Type:** integer  
**Description:** Total number of reviews submitted by users. Used as a tie-breaker when ratings are equal.

#### Location
**Field:** `location`  
**Source:** `province_categories.province_categoryName`  
**Type:** string  
**Description:** Display name of the province where the place is located

#### Timestamps
**Format:** ISO 8601 with timezone (e.g., "2025-12-10T10:00:00.000000Z")  
**Fields:** `start_at`, `end_at`, `created_at`, `updated_at`

---

## Data Relationships

### Place → Category
- **Type:** Many-to-One
- **Foreign Key:** `places.category_id` → `place_categories.placeCategoryID`
- **Used In:** By-Category endpoint to filter places

### Place → Province
- **Type:** Many-to-One
- **Foreign Key:** `places.province_id` → `province_categories.province_categoryID`
- **Used In:** All place endpoints for location display

### Event → Place
- **Type:** Many-to-One
- **Foreign Key:** `events.place_id` → `places.placeID`
- **Used In:** Upcoming events endpoint to display place name
- **Note:** Nullable (events can exist without a place)

### Event → Province
- **Type:** Many-to-One
- **Foreign Key:** `events.province_id` → `province_categories.province_categoryID`
- **Used In:** Upcoming events endpoint for filtering
- **Note:** Nullable

---

## Response Characteristics

### Flat JSON Structure
All endpoints return **flat JSON arrays** with no nested objects. This design:
- Simplifies mobile app parsing
- Reduces response size
- Improves caching efficiency

### Minimal Fields
Responses include **only essential display fields**:
- Unique identifiers (for navigation)
- Display text (names, titles)
- Visual assets (image URLs)
- Metrics (ratings)
- Location context (province)

### Pagination
**Endpoints with pagination:**
- `/api/places/by-category` (page-based)

**Endpoints with limits:**
- `/api/places/search` (limit only)
- `/api/places/recommended` (limit only)
- `/api/events/upcoming` (limit only)

### Caching Strategy
- **Place Categories:** 600 seconds (10 minutes) - rarely changes
- **Browse/Search/Recommended/Events:** 60 seconds - balances freshness and performance

---

## Query Optimization Notes

### Indexes Used
- `places(ratings, reviews_count)` - For sorting popular/recommended
- `places(category_id)` - For category filtering
- `places(province_id)` - For province filtering
- `events(start_at)` - For upcoming events sorting
- `events(province_id)` - For event province filtering

### Join Strategy
- **LEFT JOIN** used for all relationships to ensure places/events without categories or provinces still appear
- Minimal columns selected to reduce memory usage

### JSON Field Extraction
- `images_url` stored as JSON array in database
- First image extracted at query time using MySQL's `JSON_EXTRACT` function
- Performance impact minimal due to indexing on primary query columns

---

## Future Enhancements

### Potential Additional Fields
Based on the `Place` model, these fields could be added to responses in future versions:
- `description` - Full place description
- `google_maps_link` - Direct link to Google Maps
- `entry_free` - Boolean for free entry
- `operating_hours` - JSON object with hours
- `best_season_to_visit` - Recommended season
- `latitude` / `longitude` - GPS coordinates
- `all_images` - Complete images_url array

### Personalization
The `/api/places/recommended` endpoint is designed for future personalization:
- User preferences
- Browse history
- Saved places
- Collaborative filtering

---

## Testing

All endpoints can be tested using the Postman collection:
- **File:** `docs/home_postman_collection.json`
- **Base URL Variable:** `{{base_url}}`

---

**Last Updated:** October 17, 2025  
**API Version:** 1.0  
**Framework:** Laravel 11
