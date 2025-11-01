<?php

namespace App\Models\Hotel;

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
        'room_id',
    ];

    protected $casts = [
        'booking_id' => 'integer',
        'room_id' => 'integer',
    ];

    public function bookingDetail(): BelongsTo
    {
        return $this->belongsTo(BookingDetail::class, 'booking_id', 'booking_id');
    }

    public function roomProperty(): BelongsTo
    {
        return $this->belongsTo(RoomProperty::class, 'room_id', 'room_properties_id');
    }
}
