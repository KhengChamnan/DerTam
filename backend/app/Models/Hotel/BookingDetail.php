<?php

namespace App\Models\Hotel;

use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingDetail extends Model
{
    use HasFactory;

    protected $table = 'booking_details';

    protected $primaryKey = 'booking_id';

    protected $fillable = [
        'user_id',
        'trip_id',
        'full_name',
        'age',
        'gender',
        'mobile',
        'email',
        'id_number',
        'public_image_id',
        'image_url',
        'check_in',
        'check_out',
        'total_amount',
        'payment_method',
        'status',
        'merchant_ref_no',
        'tran_id',
        'payment_date',
        'payment_status',
    ];

    protected $casts = [
        'age' => 'integer',
        'check_in' => 'date',
        'check_out' => 'date',
        'total_amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class, 'trip_id', 'trip_id');
    }

    public function bookingRooms(): HasMany
    {
        return $this->hasMany(BookingRoom::class, 'booking_id', 'booking_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id', 'id');
    }

}
