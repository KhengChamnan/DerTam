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
     * Check if seat is booked for a specific schedule.
     */
    public function isBookedForSchedule(int $scheduleId): bool
    {
        return $this->bookings()
            ->where('schedule_id', $scheduleId)
            ->where('status', '!=', 'cancelled')
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
     */
    public static function availableForSchedule(int $busId, int $scheduleId)
    {
        return self::where('bus_id', $busId)
            ->whereDoesntHave('bookings', function ($query) use ($scheduleId) {
                $query->where('schedule_id', $scheduleId)
                    ->where('status', '!=', 'cancelled');
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
