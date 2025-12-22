<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get all users with roles, ordered by name
        // Client-side filtering will handle search, status, and role filters
        $allUsers = User::with('roles')
                      ->orderBy('name', 'asc')
                      ->get();

        // Create a paginated-like structure for frontend compatibility
        $users = new \Illuminate\Pagination\LengthAwarePaginator(
            $allUsers,
            $allUsers->count(),
            $allUsers->count(), // Show all items per page
            1, // Current page
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // Transform users to include role information
        $users->getCollection()->transform(function ($user) {
            // Map role names to display names
            $roleDisplayNames = [
                'user' => 'User',
                'admin' => 'Admin', 
                'hotel owner' => 'Hotel Owner',
                'transportation owner' => 'Transportation Owner',
                'restaurant owner' => 'Restaurant Owner',
                'superadmin' => 'Super Admin'
            ];

            $userRoles = $user->roles->pluck('name')->toArray();
            $displayRoles = array_map(function($role) use ($roleDisplayNames) {
                return $roleDisplayNames[$role] ?? ucfirst($role);
            }, $userRoles);

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'phone_number' => $user->phone_number,
                'status' => ucfirst($user->status ?? 'active'),
                'roles' => $userRoles, // Keep original for filtering
                'role_display' => implode(', ', $displayRoles), // For display
                'role' => !empty($displayRoles) ? $displayRoles[0] : 'User', // Primary role for display
                'created_at' => $user->created_at,
                'last_login_at' => $user->last_login_at,
                'profile_photo_url' => $user->profile_image_url ?? $user->profile_photo_url,
            ];
        });

        $roles = Role::all(['id', 'name']);

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'status', 'role']),
            'auth' => [
                'user' => Auth::user() ? [
                    'id' => Auth::user()->id,
                    'name' => Auth::user()->name,
                    'email' => Auth::user()->email,
                    'roles' => Auth::user()->load('roles')->roles,
                    'permissions' => Auth::user()->load('permissions', 'roles.permissions')->getAllPermissions()->pluck('name')->toArray(),
                ] : null,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::where('guard_name', 'web')->get();
        
        return Inertia::render('users/createEdit', [
            'isEdit' => false,
            'roles' => $roles->map(function($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $this->getDisplayName($role->name)
                ];
            })
        ]);
    }
    
    /**
     * Get display name for a role
     */
    private function getDisplayName($roleName)
    {
        $roleDisplayNames = [
            'user' => 'User',
            'admin' => 'Admin',
            'hotel owner' => 'Hotel Owner',
            'transportation owner' => 'Transportation Owner',
            'restaurant owner' => 'Restaurant Owner',
            'superadmin' => 'Super Admin'
        ];
        
        return $roleDisplayNames[$roleName] ?? ucwords(str_replace('-', ' ', $roleName));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Get all valid role display names
        $validRoles = Role::where('guard_name', 'web')->get()->map(function($role) {
            return $this->getDisplayName($role->name);
        })->toArray();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'role' => ['required', 'string', 'in:' . implode(',', $validRoles)],
            'status' => 'nullable|string|in:Active,Inactive,Invited,Suspended',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'phone_number' => $request->phone_number,
            'status' => $request->status ?? 'Active',
            'password' => Hash::make($request->password),
        ]);

        // Find the role by display name and assign it
        $role = Role::where('guard_name', 'web')->get()->first(function($r) use ($request) {
            return $this->getDisplayName($r->name) === $request->role;
        });
        
        if ($role) {
            $user->assignRole($role->name);
        }

        return redirect()->route('users.index')
                        ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return Inertia::render('users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $userRoles = $user->roles->pluck('name')->toArray();
        $displayRole = !empty($userRoles) ? $this->getDisplayName($userRoles[0]) : 'User';

        // Transform user data for the form
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'phone_number' => $user->phone_number,
            'status' => ucfirst($user->status ?? 'active'),
            'role' => $displayRole, // Use display name for the form
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'profile_photo_url' => $user->profile_image_url ?? $user->profile_photo_url,
        ];
        
        $roles = Role::where('guard_name', 'web')->get();

        return Inertia::render('users/createEdit', [
            'user' => $userData,
            'isEdit' => true,
            'roles' => $roles->map(function($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $this->getDisplayName($role->name)
                ];
            })
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        // Get all valid role display names
        $validRoles = Role::where('guard_name', 'web')->get()->map(function($role) {
            return $this->getDisplayName($role->name);
        })->toArray();
        
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'username' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'role' => ['required', 'string', 'in:' . implode(',', $validRoles)],
            'status' => 'nullable|string|in:Active,Inactive,Invited,Suspended',
        ];

        // Only validate password if it's provided
        if ($request->filled('password')) {
            $rules['password'] = ['confirmed', Rules\Password::defaults()];
        }

        $request->validate($rules);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'phone_number' => $request->phone_number,
            'status' => $request->status ?? 'Active',
        ];

        // Only update password if it's provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        // Find the role by display name and sync it
        $role = Role::where('guard_name', 'web')->get()->first(function($r) use ($request) {
            return $this->getDisplayName($r->name) === $request->role;
        });
        
        if ($role) {
            $user->syncRoles([$role->name]);
        }

        return redirect()->route('users.index')
                        ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
                        ->with('success', 'User deleted successfully.');
    }

    /**
     * Assign hotel ownership to a user.
     */
    public function assignHotelOwnership(Request $request, User $user)
    {
        $request->validate([
            'property_ids' => 'required|array',
            'property_ids.*' => 'exists:properties,property_id'
        ]);
        
        // Assign hotel owner role if not already assigned
        if (!$user->hasRole('hotel owner')) {
            $user->assignRole('hotel owner');
        }
        
        // Update property ownership
        \App\Models\Hotel\Property::whereIn('property_id', $request->property_ids)
            ->update(['owner_user_id' => $user->id]);
        
        return back()->with('success', 'Hotel ownership assigned successfully.');
    }

    /**
     * Assign restaurant ownership to a user.
     */
    public function assignRestaurantOwnership(Request $request, User $user)
    {
        $request->validate([
            'property_ids' => 'required|array',
            'property_ids.*' => 'exists:restaurant_properties,restaurant_property_id',
            'menu_category_ids' => 'sometimes|array',
            'menu_category_ids.*' => 'exists:menu_categories,menu_category_id',
            'menu_item_ids' => 'sometimes|array',
            'menu_item_ids.*' => 'exists:menu_items,menu_item_id'
        ]);
        
        // Assign restaurant owner role if not already assigned
        if (!$user->hasRole('restaurant owner')) {
            $user->assignRole('restaurant owner');
        }
        
        // Update restaurant property ownership
        \App\Models\Restaurant\RestaurantProperty::whereIn('restaurant_property_id', $request->property_ids)
            ->update(['owner_user_id' => $user->id]);
        
        return back()->with('success', 'Restaurant ownership assigned successfully.');
    }
}