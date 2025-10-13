<?php

namespace Database\Seeders;

use App\Models\ProvinceCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProvinceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $provinces = [
            [
                'province_categoryName' => 'Phnom Penh',
                'category_description' => 'Capital and most populous city of Cambodia, located at the confluence of the Mekong and Tonlé Sap rivers'
            ],
            [
                'province_categoryName' => 'Siem Reap',
                'category_description' => 'Gateway to the ancient temples of Angkor, including the famous Angkor Wat'
            ],
            [
                'province_categoryName' => 'Battambang',
                'category_description' => 'Agricultural hub known for rice production and French colonial architecture'
            ],
            [
                'province_categoryName' => 'Banteay Meanchey',
                'category_description' => 'Northwestern province bordering Thailand, known for ancient temples and border trade'
            ],
            [
                'province_categoryName' => 'Kampong Cham',
                'category_description' => 'Eastern province along the Mekong River, known for rubber plantations and temples'
            ],
            [
                'province_categoryName' => 'Kampong Chhnang',
                'category_description' => 'Central province known for pottery making and floating villages on Tonlé Sap Lake'
            ],
            [
                'province_categoryName' => 'Kampong Speu',
                'category_description' => 'Province southwest of Phnom Penh, known for palm sugar production and Phnom Chisor temple'
            ],
            [
                'province_categoryName' => 'Kampong Thom',
                'category_description' => 'Central province containing ancient temples including Sambor Prei Kuk'
            ],
            [
                'province_categoryName' => 'Kampot',
                'category_description' => 'Southern coastal province famous for pepper production and colonial architecture'
            ],
            [
                'province_categoryName' => 'Kandal',
                'category_description' => 'Province surrounding Phnom Penh, important for agriculture and industry'
            ],
            [
                'province_categoryName' => 'Kep',
                'category_description' => 'Small coastal province known for crab market and French colonial villas'
            ],
            [
                'province_categoryName' => 'Koh Kong',
                'category_description' => 'Southwestern coastal province with pristine beaches and rainforest national parks'
            ],
            [
                'province_categoryName' => 'Kratie',
                'category_description' => 'Eastern province along the Mekong River, known for Irrawaddy dolphins'
            ],
            [
                'province_categoryName' => 'Mondulkiri',
                'category_description' => 'Eastern highland province known for elephant sanctuaries and indigenous Bunong culture'
            ],
            [
                'province_categoryName' => 'Oddar Meanchey',
                'category_description' => 'Northern province known for wildlife sanctuaries and border trade with Thailand'
            ],
            [
                'province_categoryName' => 'Pailin',
                'category_description' => 'Small western province historically known for gem mining, particularly rubies and sapphires'
            ],
            [
                'province_categoryName' => 'Preah Vihear',
                'category_description' => 'Northern province home to the UNESCO World Heritage Preah Vihear Temple'
            ],
            [
                'province_categoryName' => 'Prey Veng',
                'category_description' => 'Eastern province known for agriculture and traditional Khmer culture'
            ],
            [
                'province_categoryName' => 'Pursat',
                'category_description' => 'Western province known for marble carving and the Cardamom Mountains'
            ],
            [
                'province_categoryName' => 'Ratanakiri',
                'category_description' => 'Northeastern province known for volcanic crater lakes and ethnic minority communities'
            ],
            [
                'province_categoryName' => 'Sihanoukville',
                'category_description' => 'Coastal city and province, main seaport of Cambodia with beautiful beaches'
            ],
            [
                'province_categoryName' => 'Stung Treng',
                'category_description' => 'Northern province at the confluence of the Mekong and Sekong rivers'
            ],
            [
                'province_categoryName' => 'Svay Rieng',
                'category_description' => 'Eastern province bordering Vietnam, known for agriculture and border trade'
            ],
            [
                'province_categoryName' => 'Takeo',
                'category_description' => 'Southern province known as the "cradle of Khmer civilization" with ancient temples'
            ],
            [
                'province_categoryName' => 'Tbong Khmum',
                'category_description' => 'Eastern province carved out of Kampong Cham, known for rubber plantations'
            ]
        ];

        foreach ($provinces as $province) {
            ProvinceCategory::create($province);
        }
    }
}
