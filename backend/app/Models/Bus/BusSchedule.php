<?php

namespace App\Models\Bus;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusSchedule extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'bus_id',
        'route_id',
        'departure_time',
        'arrival_time',
        'price',
        'available_seats',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'bus_id' => 'integer',
        'route_id' => 'integer',
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'price' => 'decimal:2',
        'available_seats' => 'integer',
    ];

    /**
     * Get the bus for this schedule.
     */
    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }

    /**
     * Get the route for this schedule.
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    /**
     * Get all bookings for this schedule.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(SeatBooking::class, 'schedule_id');
    }

    /**
     * Get the real-time count of available seats for this schedule.
     * Calculates: Total bus seats - Seats with confirmed bookings.
     * Pending bookings do NOT block seats.
     *
     * @return int Number of available seats
     */
    public function getAvailableSeatsCount(): int
    {
        // Get total seats for this bus
        $totalSeats = BusSeat::where('bus_id', $this->bus_id)->count();
        
        // Get count of booked seats with CONFIRMED bookings only
        $bookedSeats = SeatBooking::where('schedule_id', $this->id)
            ->whereHas('booking', function($query) {
                $query->where('status', 'confirmed');
            })
            ->count();
        
        return max(0, $totalSeats - $bookedSeats);
    }
}
