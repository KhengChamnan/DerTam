<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasRoles;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'phone_number',
        'status',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user is super admin
     *
     * @return bool
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('superadmin');
    }

    /**
     * Check if user is admin (admin or superadmin)
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->hasAnyRole(['admin', 'superadmin']);
    }

    /**
     * Check if user is regular user
     *
     * @return bool
     */
    public function isUser(): bool
    {
        return $this->hasRole('user');
    }

    /**
     * Check if user can manage places
     *
     * @return bool
     */
    public function canManagePlaces(): bool
    {
        return $this->can('create places') || $this->can('edit places') || $this->isSuperAdmin();
    }

    /**
     * Check if user can delete places
     *
     * @return bool
     */
    public function canDeletePlaces(): bool
    {
        return $this->can('delete places') || $this->isSuperAdmin();
    }

    /**
     * Check if user can manage users
     *
     * @return bool
     */
    public function canManageUsers(): bool
    {
        return $this->can('view users') || $this->can('edit users') || $this->isSuperAdmin();
    }

    /**
     * Get user's role names as array
     *
     * @return array
     */
    public function getRoleNamesAttribute(): array
    {
        return $this->roles->pluck('name')->toArray();
    }

    /**
     * Get user's permission names as array
     *
     * @return array
     */
    public function getPermissionNamesAttribute(): array
    {
        return $this->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Get the trips the user is viewing (shared with them).
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tripViewers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TripViewer::class, 'user_id', 'id');
    }
}
