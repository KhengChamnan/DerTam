<?php

namespace App\Models\Bus;

use App\Models\Booking\Booking;
use App\Models\Hotel\BookingDetail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeatBooking extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'booking_bus_seats';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_id',
        'schedule_id',
        'seat_id',
        'price',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'booking_id' => 'integer',
        'schedule_id' => 'integer',
        'seat_id' => 'integer',
        'price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the booking for this seat booking.
     * This relationship is crucial for checking booking status (pending, confirmed, cancelled, refunded)
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id', 'id');
    }

    /**
     * Get the schedule for this booking.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(BusSchedule::class, 'schedule_id');
    }

    /**
     * Get the seat for this booking.
     */
    public function seat(): BelongsTo
    {
        return $this->belongsTo(BusSeat::class, 'seat_id');
    }
}
