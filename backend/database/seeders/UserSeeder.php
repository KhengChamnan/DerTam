<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Isobel Moen',
                'username' => 'isobel_moen',
                'email' => 'isobel_white46@hotmail.com',
                'phone_number' => '+13005418122',
                'role' => 'User',
                'status' => 'Invited',
                'password' => Hash::make('password123'),
                'created_at' => '2024-10-18',
                'last_login_at' => '2025-01-21',
            ],
            [
                'name' => 'Marshall Maggio',
                'username' => 'marshall_maggio',
                'email' => 'marshall_leuschke@yahoo.com',
                'phone_number' => '+14546249056',
                'role' => 'User',
                'status' => 'Suspended',
                'password' => Hash::make('password123'),
                'created_at' => '2024-11-27',
                'last_login_at' => '2025-03-27',
            ],
            [
                'name' => 'Devan Abernathy',
                'username' => 'devan_abernathy',
                'email' => 'devan.ryan@yahoo.com',
                'phone_number' => '+16503921003',
                'role' => 'Admin',
                'status' => 'Inactive',
                'password' => Hash::make('password123'),
                'created_at' => '2025-01-26',
                'last_login_at' => '2025-06-22',
            ],
            [
                'name' => 'Pat Kunde',
                'username' => 'pat_kunde',
                'email' => 'pat.reinger67@gmail.com',
                'phone_number' => '+12357838273',
                'role' => 'Super Admin',
                'status' => 'Active',
                'password' => Hash::make('password123'),
                'created_at' => '2025-08-05',
                'last_login_at' => '2025-08-06',
            ],
            [
                'name' => 'Jerry Simonis',
                'username' => 'jerry_simonis',
                'email' => 'jerry_ratke96@gmail.com',
                'phone_number' => '+16592070854',
                'role' => 'Admin',
                'status' => 'Active',
                'password' => Hash::make('password123'),
                'created_at' => '2025-07-21',
                'last_login_at' => '2025-09-29',
            ],
            [
                'name' => 'Audreanne Veum',
                'username' => 'audreanne_veum',
                'email' => 'audreanne30@hotmail.com',
                'phone_number' => '+18948178402',
                'role' => 'Admin',
                'status' => 'Inactive',
                'password' => Hash::make('password123'),
                'created_at' => '2025-07-09',
                'last_login_at' => '2025-08-11',
            ],
            [
                'name' => 'Finn Reinger',
                'username' => 'finn_reinger',
                'email' => 'finn_cole32@gmail.com',
                'phone_number' => '+19397022463',
                'role' => 'Super Admin',
                'status' => 'Active',
                'password' => Hash::make('password123'),
                'created_at' => '2024-11-24',
                'last_login_at' => '2025-02-22',
            ],
            [
                'name' => 'Kari Frami',
                'username' => 'kari_frami',
                'email' => 'kari39@yahoo.com',
                'phone_number' => '+14862953612',
                'role' => 'User',
                'status' => 'Inactive',
                'password' => Hash::make('password123'),
                'created_at' => '2025-08-14',
                'last_login_at' => '2025-09-30',
            ],
            [
                'name' => 'Casandra Ziemann',
                'username' => 'casandra_ziemann',
                'email' => 'casandra88@gmail.com',
                'phone_number' => '+13107121426',
                'role' => 'Admin',
                'status' => 'Inactive',
                'password' => Hash::make('password123'),
                'created_at' => '2025-01-01',
                'last_login_at' => '2025-08-16',
            ],
            [
                'name' => 'Emelia McDermott',
                'username' => 'emelia_mcdermott',
                'email' => 'emelia.bahringer-dubuque39@hotmail.com',
                'phone_number' => '+16575000415',
                'role' => 'User',
                'status' => 'Active',
                'password' => Hash::make('password123'),
                'created_at' => '2025-08-08',
                'last_login_at' => '2025-09-29',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
