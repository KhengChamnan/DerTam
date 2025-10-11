<?php

namespace Database\Seeders;

use App\Models\PlaceCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlaceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'category_name' => 'Tourist Attraction',
                'category_description' => 'Historical sites, temples, museums, monuments, and cultural attractions'
            ],
            [
                'category_name' => 'Restaurant',
                'category_description' => 'Dining establishments including local cuisine, international food, and specialty restaurants'
            ],
            [
                'category_name' => 'Hotel',
                'category_description' => 'Accommodations including hotels, resorts, guesthouses, and lodges'
            ],
            [
                'category_name' => 'Shopping',
                'category_description' => 'Markets, malls, boutiques, souvenir shops, and local craft stores'
            ],
            [
                'category_name' => 'Entertainment',
                'category_description' => 'Bars, clubs, theaters, cinemas, and entertainment venues'
            ],
            [
                'category_name' => 'Nature & Parks',
                'category_description' => 'National parks, nature reserves, gardens, and outdoor recreational areas'
            ],
            [
                'category_name' => 'Beach & Water Activities',
                'category_description' => 'Beaches, lakes, water sports, and aquatic recreational facilities'
            ],
            [
                'category_name' => 'Transportation',
                'category_description' => 'Bus stations, airports, train stations, and transportation hubs'
            ],
            [
                'category_name' => 'Healthcare',
                'category_description' => 'Hospitals, clinics, pharmacies, and medical facilities'
            ],
            [
                'category_name' => 'Education',
                'category_description' => 'Schools, universities, libraries, and educational institutions'
            ],
            [
                'category_name' => 'Religious Sites',
                'category_description' => 'Temples, pagodas, churches, mosques, and places of worship'
            ],
            [
                'category_name' => 'Adventure & Sports',
                'category_description' => 'Adventure activities, sports facilities, and recreational centers'
            ]
        ];

        foreach ($categories as $category) {
            PlaceCategory::create($category);
        }
    }
}
