<?php

namespace App\Models\Bus;

use App\Models\Transportation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Support\Facades\Log;

class Bus extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'bus_property_id',
        'bus_name',
        'bus_plate',
        'description',
        'is_available',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'bus_property_id' => 'integer',
        'is_available' => 'boolean',
    ];

    /**
     * Boot method - automatically create seats when bus is created.
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically create seats when a new bus is created
        static::created(function ($bus) {
            $bus->createSeatsFromTemplate();
        });

        // Optional: Delete all seats when bus is deleted
        static::deleting(function ($bus) {
            $bus->seats()->delete();
        });
    }

    /**
     * Get the bus property (type) this bus belongs to.
     */
    public function busProperty(): BelongsTo
    {
        return $this->belongsTo(BusProperty::class, 'bus_property_id');
    }

    /**
     * Get the transportation company through bus property.
     */
    public function transportation(): HasOneThrough
    {
        return $this->hasOneThrough(
            \App\Models\Transportation::class,
            BusProperty::class,
            'id', // Foreign key on bus_properties table
            'id', // Foreign key on transportations table
            'bus_property_id', // Local key on buses table
            'transportation_id' // Local key on bus_properties table
        );
    }

    /**
     * Get all seats for this bus.
     */
    public function seats(): HasMany
    {
        return $this->hasMany(BusSeat::class);
    }

    /**
     * Get all schedules for this bus.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(BusSchedule::class);
    }

    /**
     * Get active schedules (scheduled status only).
     */
    public function activeSchedules(): HasMany
    {
        return $this->hasMany(BusSchedule::class)->where('status', 'scheduled');
    }

    /**
     * CREATE SEATS AUTOMATICALLY from BusProperty template.
     * This is called automatically when a new bus is created.
     */
    public function createSeatsFromTemplate(): void
    {
        $busProperty = $this->busProperty;

        if (!$busProperty || !$busProperty->seat_layout) {
            Log::warning("Cannot create seats: Bus Property or seat_layout is missing for Bus ID {$this->id}");
            return;
        }

        // Parse the seat layout JSON
        $layout = json_decode($busProperty->seat_layout, true);
        $seats = $layout['seats'] ?? [];

        $seatsToCreate = [];
        $createdCount = 0;

        foreach ($seats as $seat) {
            // Only create seats that have a seat number (not driver, door, empty)
            if (isset($seat['number']) && $seat['number'] !== null) {
                $seatsToCreate[] = [
                    'bus_id' => $this->id,
                    'seat_number' => (string) $seat['number'],
                    'seat_type' => $seat['type'] ?? 'standard',
                    'level' => $seat['level'] ?? null,
                    'column_label' => $seat['column_label'] ?? null,
                    'row' => $seat['row'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $createdCount++;
            }
        }

        // Bulk insert for better performance
        if (!empty($seatsToCreate)) {
            BusSeat::insert($seatsToCreate);
            Log::info("Created {$createdCount} seats for Bus ID {$this->id} (Plate: {$this->bus_plate})");
        }
    }

    /**
     * Manually recreate seats (if template changed).
     */
    public function recreateSeats(): void
    {
        // Delete existing seats
        $this->seats()->delete();

        // Create new seats from template
        $this->createSeatsFromTemplate();
    }

    /**
     * Get seat count.
     */
    public function getSeatCountAttribute(): int
    {
        return $this->seats()->count();
    }

    /**
     * Get seat capacity from bus property.
     */
    public function getSeatCapacityAttribute(): int
    {
        return $this->busProperty->seat_capacity ?? 0;
    }

    /**
     * Get base price from bus property.
     */
    public function getBasePriceAttribute(): float
    {
        return $this->busProperty->price_per_seat ?? 0;
    }

    /**
     * Get amenities from bus property.
     */
    public function getAmenitiesAttribute(): array
    {
        return $this->busProperty->amenities ?? [];
    }

    /**
     * Get display name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->bus_name} ({$this->bus_plate})";
    }

    /**
     * Get available seats for a specific schedule.
     */
    public function getAvailableSeats(int $scheduleId)
    {
        return $this->seats()
            ->whereDoesntHave('bookings', function ($query) use ($scheduleId) {
                $query->where('schedule_id', $scheduleId)
                    ->where('status', '!=', 'cancelled');
            })
            ->orderBy('seat_number')
            ->get();
    }

    /**
     * Check if bus has any active bookings.
     */
    public function hasActiveBookings(): bool
    {
        return $this->schedules()
            ->where('status', 'scheduled')
            ->whereHas('bookings', function ($query) {
                $query->where('status', '!=', 'cancelled');
            })
            ->exists();
    }
}
