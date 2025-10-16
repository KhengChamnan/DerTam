<!-- 5727aeb3-3cd6-4c4a-b204-6da4fc4e01e9 a2917e42-1676-4644-9692-e96415578f44 -->
# Home Screen API (Flat, Simple JSON)

Reference: Figma home layout [`DER-TAM-CAP-II`](https://www.figma.com/design/9ur2lDU2qbxYEnnM63kplO/DER-TAM-CAP-II?node-id=400-10533&t=CBk3QGWoWUNQm06E-4) and database design in `docs/database_design.md`.

## Goals

- Four simple endpoints: search, category filter, personalized recommend, upcoming events.
- Flat arrays only (no nested objects) and minimal fields.
- Popular/recommend = highest ratings (DESC), tie-break by reviews_count (DESC).
- Events = dedicated `events` table linked to `places`.

## Endpoints (all return 200 with an array)

### 1) GET `/api/places/search`

- Purpose: Global search bar across places.
- Params:
  - `q` (required): search text (name/description)
  - `province_id` (optional): limit to a province
  - `limit` (default 20, max 50)
- Response (flat place array):
```json
[
  {"placeID":1,"name":"Lake Azul","image_url":"..","ratings":4.7,"location":"Battambang","province_id":2}
]
```

- Notes: `LIKE` on name/description; order by `ratings DESC, reviews_count DESC` after text match.

### 2) GET `/api/places/by-category`

- Purpose: Tab/category lists (popular/lake/beach/mountain).
- Params:
  - `category` (required): `popular|lake|beach|mountain`
  - `province_id` (optional)
  - `page` (default 1), `per_page` (default 10, max 20)
- Sorting:
  - `popular`: `ratings DESC, reviews_count DESC`
  - other categories: filter by category name, sort `ratings DESC`
- Response (flat place array, paged):
```json
[
  {"placeID":3,"name":"Sunset Beach","image_url":"..","ratings":4.6,"location":"Preah Sihanouk","province_id":5}
]
```


### 3) GET `/api/places/recommended`

- Purpose: Personalized recommendations v1 (top rated; later can personalize per-user).
- Params: `province_id` (optional), `limit` (default 10, max 20)
- Sorting: `ratings DESC, reviews_count DESC`
- Response (flat place array): same shape as above.

### 4) GET `/api/events/upcoming`

- Purpose: Upcoming events list.
- Params: `province_id` (optional), `limit` (default 10, max 20)
- Filter: `start_at >= now()` OR `end_at >= now()`; Order by `start_at ASC`
- Response (flat event array, no nested place):
```json
[
  {"id":10,"title":"Festival","image_url":"..","start_at":"2025-12-10T10:00:00Z","end_at":"2025-12-12T16:00:00Z","place_id":3,"place_name":"Sunset Beach","province_id":5}
]
```


## Minimal Response Fields

- Place: `placeID`, `name`, `image_url` (first image only), `ratings`, `location` (province_name), `province_id`
- Event: `id`, `title`, `image_url`, `start_at`, `end_at`, `place_id`, `place_name`, `province_id`

## Controller and Routing (Laravel 11)

- Controllers:
  - `PlaceBrowseController@search`
  - `PlaceBrowseController@byCategory`
  - `RecommendationController@index`
  - `EventController@upcoming`
- Routes: add to `routes/api.php`

## Query Logic (DB Query Builder)

- Tables: `places`, `place_categories`, `province_categories`, `events`
- Common select (minimal fields only):
  - `placeID as placeID`, `name`, `ratings`, `province_id`, `location` via join on `province_categories.province_categoryName`, and computed `image_url` from `images_url` JSON first element
- Popular (and Recommended):
  - `DB::table('places')`
    - optional `where('province_id', $provinceId)`
    - orderBy `ratings DESC, reviews_count DESC`
    - limit N
- By-category:
  - join `place_categories` on `places.category_id = place_categories.placeCategoryID`
  - `where('place_categories.category_name', ucfirst($category))`
  - optional `where('province_id', $provinceId)`
  - orderBy `ratings DESC`
  - paginate (page, per_page)
- Search:
  - optional `where('province_id', $provinceId)`
  - `where(function($q){ $q->where('name','like',"%$q%")->orWhere('description','like',"%$q%"); })`
  - orderBy `ratings DESC, reviews_count DESC`
  - limit N
- Events:
  - `DB::table('events')`
    - optional `where('province_id', $provinceId)`
    - `where(function($q){ $q->where('start_at','>=',now())->orWhere('end_at','>=',now()); })`
    - orderBy `start_at ASC`
    - limit N
- Image URL extraction:
  - Use `JSON_EXTRACT(images_url, '$[0]') as image_url` (MySQL) and coalesce to null if no image.

## Serialization

- Use `->select([...])` and `->map()` to flatten `image_url` from `images_url` JSON.
- Return plain arrays; avoid nested resources.

## Data Model Additions

- New `events` table:
  - `id` BIGINT PK, `title` VARCHAR(255) NOT NULL
  - `description` TEXT NULL, `image_url` VARCHAR(500) NULL
  - `place_id` BIGINT NULL FK -> `places.placeID`
  - `province_id` BIGINT NULL FK -> `province_categories.province_categoryID`
  - `start_at` DATETIME NOT NULL, `end_at` DATETIME NULL
  - Timestamps
- Indexes: `places(ratings,reviews_count)`, `places(category_id)`, `places(province_id)`, `events(start_at)`, `events(province_id)`

## Mobile Guidelines

- Call endpoints independently as rows load.
- Use `limit=6..10` for snappy UI; cache results for ~60s client-side.

## Error and Limits

- Validate params; cap limits at 20.
- Always return arrays; empty when no data.
- JSON only; no auth required for browse.

### To-dos

- [ ] Create events table, model, and relations to places/provinces
- [ ] Implement GET /api/places/search (DB query builder, flat fields)
- [ ] Implement GET /api/places/by-category (DB query builder, pagination)
- [ ] Implement GET /api/places/recommended (DB query builder)
- [ ] Implement GET /api/events/upcoming (DB query builder)
- [ ] Wire routes in routes/api.php and add validation
- [ ] Add simple caching (60s) for lists
- [ ] Create Postman collection JSON to test all endpoints

### To-dos

- [ ] Create events table, model, and relations to places/provinces
- [ ] Add Eloquent scopes: popular, inProvince, inCategoryName on Place
- [ ] Implement GET /api/home returning tabs, recommended, events
- [ ] Implement GET /api/places, /api/places/recommended, /api/events/upcoming
- [ ] Create PlaceResource and EventResource with minimal fields
- [ ] Wire routes in routes/api.php and add validation
- [ ] Add simple caching (60s) for home and lists