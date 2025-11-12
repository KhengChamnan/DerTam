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
        $query = User::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by role (using Spatie roles)
        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        $users = $query->with('roles')
                      ->orderBy('created_at', 'desc')
                      ->paginate(10)
                      ->withQueryString();

        // Transform users to include role information
        $users->getCollection()->transform(function ($user) {
            // Map role names to display names
            $roleDisplayNames = [
                'user' => 'User',
                'admin' => 'Admin', 
                'hotel owner' => 'Hotel Owner',
                'transportation owner' => 'Transportation Owner',
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
        return Inertia::render('users/createEdit', [
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'role' => 'required|string|in:Super Admin,Admin,Hotel Owner,Transportation Owner,User',
            'status' => 'nullable|string|in:Active,Inactive,Invited,Suspended',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Map display names to database role names
        $roleMapping = [
            'Super Admin' => 'superadmin',
            'Admin' => 'admin',
            'Hotel Owner' => 'hotel owner',
            'Transportation Owner' => 'transportation owner',
            'User' => 'user'
        ];

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'phone_number' => $request->phone_number,
            'status' => $request->status ?? 'Active',
            'password' => Hash::make($request->password),
        ]);

        // Assign role using Spatie Permission
        $databaseRoleName = $roleMapping[$request->role];
        $user->assignRole($databaseRoleName);

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
        // Map database role names to display names for the form
        $roleDisplayNames = [
            'user' => 'User',
            'admin' => 'Admin', 
            'hotel owner' => 'Hotel Owner',
            'transportation owner' => 'Transportation Owner',
            'superadmin' => 'Super Admin'
        ];

        $userRoles = $user->roles->pluck('name')->toArray();
        $displayRole = !empty($userRoles) ? $roleDisplayNames[$userRoles[0]] ?? 'User' : 'User';

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
        ];

        return Inertia::render('users/createEdit', [
            'user' => $userData,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'username' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'role' => 'required|string|in:Super Admin,Admin,Hotel Owner,Transportation Owner,User',
            'status' => 'nullable|string|in:Active,Inactive,Invited,Suspended',
        ];

        // Only validate password if it's provided
        if ($request->filled('password')) {
            $rules['password'] = ['confirmed', Rules\Password::defaults()];
        }

        $request->validate($rules);

        // Map display names to database role names
        $roleMapping = [
            'Super Admin' => 'superadmin',
            'Admin' => 'admin',
            'Hotel Owner' => 'hotel owner',
            'Transportation Owner' => 'transportation owner',
            'User' => 'user'
        ];

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

        // Update role using Spatie Permission
        $databaseRoleName = $roleMapping[$request->role];
        $user->syncRoles([$databaseRoleName]); // syncRoles removes old roles and assigns new one

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
}