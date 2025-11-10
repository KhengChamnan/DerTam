<?php

namespace App\Models\Booking;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingHotelDetail extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'booking_hotel_details';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_item_id',
        'check_in',
        'check_out',
        'nights',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'nights' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array<int, string>
     */
    protected $hidden = [];

    /**
     * Get the booking item that owns the hotel details.
     *
     * @return BelongsTo
     */
    public function bookingItem(): BelongsTo
    {
        return $this->belongsTo(BookingItem::class, 'booking_item_id', 'id');
    }

    /**
     * Get the booking through the booking item.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough
     */
    public function booking()
    {
        return $this->hasOneThrough(
            Booking::class,
            BookingItem::class,
            'id', // Foreign key on booking_items table
            'id', // Foreign key on bookings table
            'booking_item_id', // Local key on booking_hotel_details table
            'booking_id' // Local key on booking_items table
        );
    }

   
}
