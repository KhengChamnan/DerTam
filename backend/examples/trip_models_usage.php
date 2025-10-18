<?php

// Example usage of the Trip models
// This shows how to create and use the models together

use App\Models\Trip;
use App\Models\TripDay;
use App\Models\TripPlace;
use App\Models\Place;
use App\Models\User;

// Example 1: Creating a new trip
$trip = Trip::create([
    'user_id' => 1,
    'trip_name' => 'Siem Reap Adventure',
    'start_date' => '2025-12-01',
    'end_date' => '2025-12-03',
]);

// Example 2: Adding days to the trip
$day1 = TripDay::create([
    'trip_id' => $trip->trip_id,
    'date' => '2025-12-01',
]);

$day2 = TripDay::create([
    'trip_id' => $trip->trip_id,
    'date' => '2025-12-02',
]);

$day3 = TripDay::create([
    'trip_id' => $trip->trip_id,
    'date' => '2025-12-03',
]);

// Example 3: Adding places to specific days
TripPlace::create([
    'trip_day_id' => $day1->trip_day_id,
    'place_id' => 1, // Angkor Wat
    'notes' => 'Visit early morning for sunrise',
]);

TripPlace::create([
    'trip_day_id' => $day1->trip_day_id,
    'place_id' => 2, // Angkor Thom
    'notes' => 'Explore the Bayon temple',
]);

TripPlace::create([
    'trip_day_id' => $day2->trip_day_id,
    'place_id' => 3, // Ta Prohm
    'notes' => 'Famous tree-covered temple',
]);

// Example 4: Querying relationships
// Get all trip days for a trip
$tripDays = $trip->tripDays;

// Get all places for a trip (through trip days)
$allTripPlaces = $trip->tripPlaces;

// Get trip duration
$duration = $trip->duration; // Will return 3 days

// Get day number for a specific day
$dayNumber = $day2->dayNumber; // Will return 2

// Example 5: Using scopes
// Get all trip places for a specific trip
$tripPlaces = TripPlace::forTrip($trip->trip_id)->get();

// Get all trip places for a specific date
$placesForDate = TripPlace::forDate('2025-12-01')->get();

// Example 6: Eager loading relationships
$tripWithRelations = Trip::with(['tripDays.tripPlaces.place', 'user'])
    ->find($trip->trip_id);

// Example 7: Get places with their details for a specific trip day
$day1WithPlaces = TripDay::with('tripPlaces.place')
    ->find($day1->trip_day_id);

foreach ($day1WithPlaces->tripPlaces as $tripPlace) {
    echo "Place: " . $tripPlace->place->name . "\n";
    echo "Notes: " . $tripPlace->notes . "\n";
}