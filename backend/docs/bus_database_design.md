
# 🚌 Bus Booking System Database Design

This document describes the database schema for the **Bus Module** that integrates with the Travel App.  
The system allows users to:
- View bus routes and schedules
- See available seats for a specific schedule
- Book seats securely without double-booking

---

## 1. Entity Relationship Diagram (Conceptual)

**Bus** → has many → **Seats**  
**Route** → reused for many → **Schedules**  
**Schedule** → combines → Bus + Route + Date/Time  
**Booking Detail** → universal booking table (shared with hotels)  
**Booking Bus Seats** → links → Booking Detail + Schedule + Seat

```
booking_details ───< booking_bus_seats >─── bus_seats
     (universal)              │                  │
                              ▼                  ▼
                       bus_schedules ───< buses
                              │
                              ▼
                           routes
```

---

## 2. Database Tables

### 2.1 `buses`
Stores each bus information.

| Column        | Type        | Nullable | Description |
|---------------|------------|----------|-------------|
| id            | PK         | NO       | Unique bus ID |
| bus_name      | VARCHAR    | YES      | Bus label/name (ex: Giant Ibis 01) - Optional, can be auto-generated |
| bus_plate     | VARCHAR    | YES      | License plate number - Optional field |
| seat_capacity | INT        | NO       | Total number of seats on the bus |
| created_at    | TIMESTAMP  | NO       | Timestamp |
| updated_at    | TIMESTAMP  | NO       | Timestamp |

---

### 2.2 `bus_seats`
Represents every seat inside a bus.

| Column      | Type      | Nullable | Description |
|-------------|----------|----------|-------------|
| id          | PK       | NO       | Seat ID |
| bus_id      | FK → buses.id | NO | Which bus this seat belongs to |
| seat_number | VARCHAR(10) | NO   | Seat code (A1, A2, B3...) |
| created_at  | TIMESTAMP | NO     | Timestamp |
| updated_at  | TIMESTAMP | NO     | Timestamp |

> Different buses can have different seat layouts.

---

### 2.3 `routes`
Defines start and destination of a travel route.

| Column        | Type      | Nullable | Description |
|---------------|----------|----------|-------------|
| id            | PK       | NO       | Route ID |
| from_location | VARCHAR  | NO       | Starting point |
| to_location   | VARCHAR  | NO       | Destination location |
| distance_km   | DECIMAL(8,2) | YES  | Distance in kilometers - Optional |
| duration_hours | DECIMAL(4,2) | YES | Estimated duration - Optional |
| created_at    | TIMESTAMP | NO     | Timestamp |
| updated_at    | TIMESTAMP | NO     | Timestamp |

---

### 2.4 `bus_schedules`
Represents a **specific trip instance** (Bus + Route + Date).

| Column         | Type      | Nullable | Description |
|----------------|----------|----------|-------------|
| id             | PK       | NO       | Schedule ID |
| bus_id         | FK → buses.id | NO | Which bus is used |
| route_id       | FK → routes.id | NO | Route being used |
| departure_time | DATETIME  | NO      | When the bus leaves |
| arrival_time   | DATETIME  | YES     | Estimated arrival time - Optional |
| price          | DECIMAL   | NO      | Ticket price |
| available_seats | INT      | YES     | Cached count for performance - Optional |
| status         | ENUM('scheduled','departed','cancelled','completed') | NO | Schedule status (default: 'scheduled') |
| created_at     | TIMESTAMP | NO      | Timestamp |
| updated_at     | TIMESTAMP | NO      | Timestamp |

---

### 2.5 `booking_bus_seats`
Stores bus seat booking details (linked to universal booking system).

| Column       | Type        | Nullable | Description |
|--------------|------------|----------|-------------|
| id           | PK         | NO       | Detail record |
| schedule_id  | FK → bus_schedules.id | NO | Which bus trip |
| seat_id      | FK → bus_seats.id | NO | Which seat |
| price        | DECIMAL(10,2) | NO    | Price at time of booking |
| created_at   | TIMESTAMP  | NO      | Timestamp |
| updated_at   | TIMESTAMP  | NO      | Timestamp |

**Notes:**
- Currently operates independently without universal booking system integration
- **Future implementation**: Will add `booking_id` FK to link with `booking_details` table (universal booking system)
- Once integrated, will follow the same pattern as hotel bookings (`booking_details` + `booking_rooms`)
- Unique constraint on `(schedule_id, seat_id)` prevents double-booking

---


