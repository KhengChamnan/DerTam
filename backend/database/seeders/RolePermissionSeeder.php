<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeder.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Place permissions
            'view places',
            'create places',
            'edit places',
            'delete places',
            'import places',
            
            // Hotel management permissions
            'view hotels',
            'create hotels',
            'edit hotels',
            'delete hotels',
            'manage hotel rooms',
            'view hotel analytics',
            
            // Hotel Owner specific permissions
            'view own hotel dashboard',
            'manage own hotel basic info',
            'manage own hotel rooms',
            'manage own hotel amenities',
            'manage own hotel facilities',
            'manage own hotel pricing',
            'view own hotel bookings',
            'manage own hotel bookings',
            'view own hotel analytics',
            
            // User management permissions
            'view users',
            'create users',
            'edit users',
            'delete users',
            'assign roles',
            'assign hotel ownership',
            
            // Role management permissions
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            
            // Category and Province permissions
            'manage categories',
            'manage provinces',
            
            // System permissions
            'access admin panel',
            'view reports',
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // User role - basic permissions
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $userRole->syncPermissions([
            'view places',
        ]);

        // Hotel Owner role - limited hotel management permissions
        $hotelOwnerRole = Role::firstOrCreate(['name' => 'hotel owner']);
        $hotelOwnerRole->syncPermissions([
            'view own hotel dashboard',
            'manage own hotel basic info',
            'manage own hotel rooms',
            'manage own hotel amenities',
            'manage own hotel facilities',
            'manage own hotel pricing',
            'view own hotel bookings',
            'manage own hotel bookings',
            'view own hotel analytics',
        ]);

        // Admin role - moderate permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions([
            'view places',
            'create places',
            'edit places',
            'import places',
            'view hotels',
            'create hotels',
            'edit hotels',
            'manage hotel rooms',
            'view hotel analytics',
            'view users',
            'create users',
            'edit users',
            'assign roles',
            'assign hotel ownership',
            'view roles',
            'create roles',
            'edit roles',
            'manage categories',
            'manage provinces',
            'access admin panel',
            'view reports',
        ]);

        // Super Admin role - all permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'superadmin']);
        $superAdminRole->syncPermissions(Permission::all());

        // Create default super admin user if it doesn't exist
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@dertam.com'],
            [
                'name' => 'Super Administrator',
                'username' => 'superadmin',
                'password' => bcrypt('password123'),
                'status' => 'active',
            ]
        );
        $superAdmin->assignRole('superadmin');

        // Create default admin user if it doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@dertam.com'],
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'password' => bcrypt('password123'),
                'status' => 'active',
            ]
        );
        $admin->assignRole('admin');

        // Create default regular user if it doesn't exist
        $user = User::firstOrCreate(
            ['email' => 'user@dertam.com'],
            [
                'name' => 'Regular User',
                'username' => 'user',
                'password' => bcrypt('password123'),
                'status' => 'active',
            ]
        );
        $user->assignRole('user');

        $this->command->info('Roles and permissions seeded successfully!');
        $this->command->info('Default users created:');
        $this->command->info('Super Admin: superadmin@dertam.com / password123');
        $this->command->info('Admin: admin@dertam.com / password123');
        $this->command->info('User: user@dertam.com / password123');
    }
}