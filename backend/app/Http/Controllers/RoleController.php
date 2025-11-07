<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Permission\Models\Permission as SpatiePermission;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(Request $request): Response
    {
        try {
            $query = SpatieRole::with('permissions')->withCount('permissions');

            // Search by name if provided
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $roles = $query->paginate($request->get('per_page', 15));
            
            // Transform roles data to match frontend expectations
            $roles->getCollection()->transform(function ($role) {
                // Manually count users with this role
                $usersCount = \App\Models\User::role($role->name)->count();
                
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];
                    }),
                    'permissions_count' => $role->permissions_count,
                    'users_count' => $usersCount,
                    'created_at' => $role->created_at,
                    'updated_at' => $role->updated_at,
                ];
            });

            $user = Auth::user();
            
            return Inertia::render('roles/index', [
                'roles' => $roles,
                'filters' => $request->only(['search']),
                'auth' => [
                    'user' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->load('roles')->roles,
                        'permissions' => $user->load('permissions', 'roles.permissions')->getAllPermissions()->pluck('name')->toArray(),
                    ] : null,
                ],
            ]);
        } catch (\Exception $e) {
            return Inertia::render('roles/index', [
                'roles' => ['data' => [], 'total' => 0, 'per_page' => 15, 'current_page' => 1, 'last_page' => 1],
                'filters' => $request->only(['search']),
                'error' => 'Database error: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        $permissions = $this->getGroupedPermissions();

        return Inertia::render('roles/createEdit', [
            'role' => null,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        try {
            $role = SpatieRole::create([
                'name' => $request->name,
                'guard_name' => 'web',
            ]);

            if ($request->filled('permissions')) {
                $permissions = SpatiePermission::whereIn('id', $request->permissions)->get();
                $role->syncPermissions($permissions);
            }

            return redirect()->route('roles.index')->with('success', 'Role created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create role: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified role.
     */
    public function show(string $id): Response
    {
        try {
            $role = SpatieRole::with('permissions', 'users')->findOrFail($id);
            
            // Transform role data to match frontend expectations
            $transformedRole = [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => $role->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                    ];
                }),
                'users' => $role->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                }),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ];

            return Inertia::render('roles/show', [
                'role' => $transformedRole,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('roles/show', [
                'role' => null,
                'error' => 'Role not found',
            ]);
        }
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(string $id): Response|RedirectResponse
    {
        try {
            $role = SpatieRole::with('permissions')->findOrFail($id);
            
            // Transform role data to match frontend expectations
            $transformedRole = [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => $role->permissions->pluck('id')->toArray(),
            ];

            $permissions = $this->getGroupedPermissions();

            return Inertia::render('roles/createEdit', [
                'role' => $transformedRole,
                'permissions' => $permissions,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('roles.index')->withErrors(['error' => 'Role not found']);
        }
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, string $id): RedirectResponse
    {
        try {
            $role = SpatieRole::findOrFail($id);

            $role->update([
                'name' => $request->name,
            ]);

            // Sync permissions
            if ($request->filled('permissions')) {
                $permissions = SpatiePermission::whereIn('id', $request->permissions)->get();
                $role->syncPermissions($permissions);
            } else {
                $role->syncPermissions([]);
            }

            return redirect()->route('roles.index')->with('success', 'Role updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update role: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            $role = SpatieRole::findOrFail($id);
            
            // Prevent deleting superadmin role only
            if ($role->name === 'superadmin') {
                return back()->withErrors(['error' => 'Superadmin role cannot be deleted']);
            }

            // Check if role has users
            if ($role->users()->count() > 0) {
                return back()->withErrors(['error' => 'Cannot delete role that has assigned users']);
            }

            $role->delete();

            return redirect()->route('roles.index')->with('success', 'Role deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete role: ' . $e->getMessage()]);
        }
    }

    /**
     * Group permissions by their categories for better UI display
     */
    private function getGroupedPermissions()
    {
        $permissions = SpatiePermission::all();
        $grouped = [];
        
        foreach ($permissions as $permission) {
            // Extract the action and resource from permission name
            $parts = explode(' ', $permission->name, 2);
            $action = $parts[0]; // view, create, edit, delete, etc.
            $resource = isset($parts[1]) ? $parts[1] : 'general';
            
            if (!isset($grouped[$resource])) {
                $grouped[$resource] = [
                    'resource' => $resource,
                    'permissions' => []
                ];
            }
            
            $grouped[$resource]['permissions'][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'action' => $action,
            ];
        }
        
        // Sort permissions within each group by action priority
        $actionOrder = ['view', 'create', 'edit', 'delete', 'import', 'manage', 'access', 'assign'];
        
        foreach ($grouped as &$group) {
            usort($group['permissions'], function ($a, $b) use ($actionOrder) {
                $aPos = array_search($a['action'], $actionOrder);
                $bPos = array_search($b['action'], $actionOrder);
                $aPos = $aPos === false ? 999 : $aPos;
                $bPos = $bPos === false ? 999 : $bPos;
                return $aPos - $bPos;
            });
        }
        
        return array_values($grouped);
    }
}