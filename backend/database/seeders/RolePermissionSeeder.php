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
            
            // Transportation management permissions
            'view transportations',
            'create transportations',
            'edit transportations',
            'delete transportations',
            'manage transportation buses',
            'view transportation analytics',
            
            // Transportation Owner specific permissions
            'view own transportation dashboard',
            'manage own transportation basic info',
            'manage own transportation buses',
            'manage own transportation routes',
            'manage own transportation schedules',
            'view own transportation bookings',
            'manage own transportation bookings',
            'view own transportation analytics',
            
            // Restaurant management permissions
            'view restaurants',
            'create restaurants',
            'edit restaurants',
            'delete restaurants',
            'manage restaurant menus',
            'view restaurant analytics',
            
            // Restaurant Owner specific permissions
            'view own restaurant dashboard',
            'manage own restaurant basic info',
            'manage own restaurant menus',
            'manage own restaurant categories',
            'manage own restaurant items',
            'view own restaurant bookings',
            'manage own restaurant bookings',
            'view own restaurant analytics',
            
            // User management permissions
            'view users',
            'create users',
            'edit users',
            'delete users',
            'assign roles',
            'assign hotel ownership',
            'assign restaurant ownership',
            
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

        // Transportation Owner role - limited transportation management permissions
        $transportationOwnerRole = Role::firstOrCreate(['name' => 'transportation owner']);
        $transportationOwnerRole->syncPermissions([
            'view own transportation dashboard',
            'manage own transportation basic info',
            'manage own transportation buses',
            'manage own transportation routes',
            'manage own transportation schedules',
            'view own transportation bookings',
            'manage own transportation bookings',
            'view own transportation analytics',
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
            'view transportations',
            'create transportations',
            'edit transportations',
            'manage transportation buses',
            'view transportation analytics',
            'view restaurants',
            'create restaurants',
            'edit restaurants',
            'manage restaurant menus',
            'view restaurant analytics',
            'view users',
            'create users',
            'edit users',
            'assign roles',
            'assign hotel ownership',
            'assign restaurant ownership',
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