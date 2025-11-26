<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $userData = null;

        if ($user) {
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->load('roles')->roles,
                'permissions' => $user->load('permissions', 'roles.permissions')->getAllPermissions()->pluck('name')->toArray(),
            ];

            // Add hotel property name for hotel owners
            if ($user->hasRole('hotel owner')) {
                $property = \App\Models\Hotel\Property::where('owner_user_id', $user->id)
                    ->with('place:placeID,name')
                    ->first();
                $userData['hotel_name'] = $property?->place?->name;
            }

            // Add transportation company name for transportation owners
            if ($user->hasRole('transportation owner')) {
                $company = \App\Models\Transportation::where('owner_user_id', $user->id)
                    ->with('place:placeID,name')
                    ->first();
                $userData['company_name'] = $company?->place?->name;
            }
        }

        return [
            ...parent::share($request),
            'csrf_token' => csrf_token(),
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'auth' => [
                'user' => $userData,
            ],
        ];
    }
}
