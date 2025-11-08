<?php

namespace App\Models\Hotel;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingRoom extends Model
{
    use HasFactory;

    protected $table = 'booking_rooms';

    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'booking_id',
        'room_type_id',
        'check_in',
        'check_out',
        'price_per_night',
        'quantity',
    ];

    protected $casts = [
        'booking_id' => 'integer',
        'room_type_id' => 'integer',
        'check_in' => 'date',
        'check_out' => 'date',
        'price_per_night' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id', 'booking_id');
    }

    public function roomProperty(): BelongsTo
    {
        return $this->belongsTo(RoomProperty::class, 'room_type_id', 'room_properties_id');
    }
}
