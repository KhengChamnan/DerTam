<?php

namespace App\Models\Bus;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusSeat extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'bus_id',
        'seat_number',
        'seat_type',
        'level',
        'column_label',
        'row',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'bus_id' => 'integer',
    ];

    /**
     * Get the bus that owns this seat.
     */
    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }

    /**
     * Get all bookings for this seat.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(SeatBooking::class, 'seat_id');
    }

    /**
     * Get seat availability status for a schedule.
     * Returns an array mapping seat IDs to their availability (true = available, false = booked).
     * Only considers bookings with status 'pending' or 'confirmed' as blocking.
     *
     * @param int $scheduleId The schedule ID to check
     * @param array|null $seatIds Optional array of specific seat IDs to check. If null, checks all seats for the schedule's bus.
     * @return array Array mapping seat_id => bool (true = available, false = booked)
     */
    public static function getSeatAvailability(int $scheduleId, ?array $seatIds = null): array
    {
        $schedule = BusSchedule::findOrFail($scheduleId);
        
        // Get all seats for the bus or specific seats
        $seatsQuery = self::where('bus_id', $schedule->bus_id);
        
        if ($seatIds !== null) {
            $seatsQuery->whereIn('id', $seatIds);
        }
        
        $seats = $seatsQuery->pluck('id')->toArray();
        
        // Get booked seat IDs for this schedule with active bookings
        $bookedSeatIds = SeatBooking::where('schedule_id', $scheduleId)
            ->whereIn('seat_id', $seats)
            ->whereHas('booking', function($query) {
                $query->whereIn('status', ['pending', 'confirmed']);
            })
            ->pluck('seat_id')
            ->toArray();
        
        // Map all seats to availability status
        $availability = [];
        foreach ($seats as $seatId) {
            $availability[$seatId] = !in_array($seatId, $bookedSeatIds);
        }
        
        return $availability;
    }

    /**
     * Check if seat is booked for a specific schedule.
     * @deprecated Use getSeatAvailability() instead for proper booking status checking
     */
    public function isBookedForSchedule(int $scheduleId): bool
    {
        return $this->bookings()
            ->where('schedule_id', $scheduleId)
            ->whereHas('booking', function($query) {
                $query->whereIn('status', ['pending', 'confirmed']);
            })
            ->exists();
    }

    /**
     * Get booking for a specific schedule.
     */
    public function getBookingForSchedule(int $scheduleId)
    {
        return $this->bookings()
            ->where('schedule_id', $scheduleId)
            ->where('status', '!=', 'cancelled')
            ->first();
    }

    /**
     * Get available seats for a schedule.
     * Only excludes seats with active bookings (pending or confirmed status).
     */
    public static function availableForSchedule(int $busId, int $scheduleId)
    {
        return self::where('bus_id', $busId)
            ->whereDoesntHave('bookings', function ($query) use ($scheduleId) {
                $query->where('schedule_id', $scheduleId)
                    ->whereHas('booking', function($q) {
                        $q->whereIn('status', ['pending', 'confirmed']);
                    });
            })
            ->orderBy('seat_number')
            ->get();
    }

    /**
     * Get seat display name (includes level for sleeper buses).
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->level) {
            return "Seat {$this->seat_number} ({$this->level})";
        }
        return "Seat {$this->seat_number}";
    }
}