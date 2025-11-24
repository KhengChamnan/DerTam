# Universal Booking & Payment Database Design

This document describes a scalable, flexible booking and payment architecture that supports **Hotel** and **Bus** bookings today, while easily scaling to new services (tours, events, rentals, etc.) in the future.

---

## 🎯 Core Concept

Instead of having separate booking tables for each service, we use a **universal booking model**:

```
bookings (one order)
  ↓
booking_items (items inside the order)
  ↓
optional detail tables (only when needed)
```

This avoids database duplication and makes adding new booking types simple.

---

## 🏛️ Database Tables

### 1) `bookings`
Stores general booking order information.

```sql
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status ENUM('pending','confirmed','cancelled','refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 2) `booking_items`
Stores each booked item — hotel room, bus seat, etc.

```sql
CREATE TABLE booking_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    item_type ENUM('hotel_room','bus_seat','tour','restaurant') NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 3) `booking_hotel_details`
Stores hotel-specific stay duration.

```sql
CREATE TABLE booking_hotel_details (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_item_id BIGINT UNSIGNED NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

*Bus bookings do **not** need their own detail table.*

---

## 💳 Payment System

### 4) `payment_methods`
List of supported gateways (ABA, Stripe, Wing, etc.)

```sql
CREATE TABLE payment_methods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    provider_key VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 5) `payments`
Each payment attempt or transaction.

```sql
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    payment_method_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','processing','success','failed','refunded') DEFAULT 'pending',
    reference_code VARCHAR(100) NOT NULL,
    provider_transaction_id VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 6) `payment_events`
Logs raw callback/responses from payment gateways.

```sql
CREATE TABLE payment_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT UNSIGNED NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧠 Example Booking Flow

### 🏨 Hotel Booking Example
- User selects room + check-in + check-out
- System calculates nights and total

Flow:
```
INSERT INTO bookings ...
INSERT INTO booking_items ...
INSERT INTO booking_hotel_details ...
INSERT INTO payments ...
→ redirect to payment
→ payment callback updates status
```

### 🚌 Bus Booking Example
- User selects schedule + seat

Flow:
```
INSERT INTO bookings ...
INSERT INTO booking_items (item_type='bus_seat') ...
INSERT INTO payments ...
→ redirect to payment
→ payment callback updates status
```

No extra bus detail table is required.

---

## 🚀 Why This Scales

| Feature | Supported |
|--------|:---------:|
| Add new booking types | ✅ Just add new item_type |
| Add new payment gateway | ✅ Just insert into payment_methods |
| One unified "My Bookings" page | ✅ |
| Works for hotel + bus today | ✅ |
| Future-proof for expansion | ✅ |

This is the **same architecture used by Agoda, Airbnb, Shopee, and Uber**.

---

## ✅ Conclusion

You only need:

```
bookings
booking_items
booking_hotel_details (only when needed)
payment_methods
payments
payment_events
```

This design is **clean**, **scalable**, and **ready for real production use**.
