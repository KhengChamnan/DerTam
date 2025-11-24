<?php

namespace App\Models\Payment;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentEvent extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'payment_events';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'payment_id',
        'event_type',
        'payload',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payment_id' => 'integer',
        'payload' => 'array',
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
     * Get the payment that owns the payment event.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Scope a query to only include callback events.
     */
    public function scopeCallback($query)
    {
        return $query->where('event_type', 'callback');
    }

    /**
     * Scope a query to only include webhook events.
     */
    public function scopeWebhook($query)
    {
        return $query->where('event_type', 'webhook');
    }

    /**
     * Scope a query to only include notification events.
     */
    public function scopeNotification($query)
    {
        return $query->where('event_type', 'notification');
    }

    /**
     * Scope a query to only include refund events.
     */
    public function scopeRefund($query)
    {
        return $query->where('event_type', 'refund');
    }

    /**
     * Scope a query to only include error events.
     */
    public function scopeError($query)
    {
        return $query->where('event_type', 'error');
    }

    /**
     * Scope a query to only include timeout events.
     */
    public function scopeTimeout($query)
    {
        return $query->where('event_type', 'timeout');
    }

    /**
     * Check if the event is a callback.
     */
    public function isCallback(): bool
    {
        return $this->event_type === 'callback';
    }

    /**
     * Check if the event is a webhook.
     */
    public function isWebhook(): bool
    {
        return $this->event_type === 'webhook';
    }

    /**
     * Check if the event is a notification.
     */
    public function isNotification(): bool
    {
        return $this->event_type === 'notification';
    }

    /**
     * Check if the event is a refund.
     */
    public function isRefund(): bool
    {
        return $this->event_type === 'refund';
    }

    /**
     * Check if the event is an error.
     */
    public function isError(): bool
    {
        return $this->event_type === 'error';
    }

    /**
     * Check if the event is a timeout.
     */
    public function isTimeout(): bool
    {
        return $this->event_type === 'timeout';
    }
}
