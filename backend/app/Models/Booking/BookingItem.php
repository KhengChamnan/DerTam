<?php

namespace App\Models\Booking;

use App\Models\Hotel\Room;
use App\Models\Hotel\RoomProperty;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BookingItem extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'booking_items';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_id',
        'item_type',
        'item_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
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
     * Get the booking that owns the booking item.
     *
     * @return BelongsTo
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id', 'id');
    }

    /**
     * Get the hotel details for the booking item (if item_type is hotel_room).
     *
     * @return HasOne
     */
    public function hotelDetails(): HasOne
    {
        return $this->hasOne(BookingHotelDetail::class, 'booking_item_id', 'id');
    }

    /**
     * Get the room for hotel bookings.
     *
     * @return BelongsTo
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'item_id', 'id');
    }

    /**
     * Get the room property (room type) for hotel bookings.
     *
     * @return BelongsTo
     */
    public function roomProperty(): BelongsTo
    {
        return $this->belongsTo(RoomProperty::class, 'item_id', 'room_properties_id');
    }

    /**
     * Get the seat bookings for bus bookings (if item_type is bus_seat).
     *
     * @return HasMany
     */
    public function seatBookings(): HasMany
    {
        return $this->hasMany(\App\Models\Bus\SeatBooking::class, 'booking_id', 'booking_id')
            ->where('seat_id', $this->item_id);
    }
}
