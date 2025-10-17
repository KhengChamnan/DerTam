<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('events', function (Blueprint $table) {
			$table->bigIncrements('id');
			$table->string('title');
			$table->text('description')->nullable();
			$table->string('image_url', 500)->nullable();
			$table->unsignedBigInteger('place_id')->nullable();
			$table->unsignedBigInteger('province_id')->nullable();
			$table->dateTime('start_at');
			$table->dateTime('end_at')->nullable();
			$table->timestamps();

			$table->foreign('place_id')->references('placeID')->on('places')->nullOnDelete();
			$table->foreign('province_id')->references('province_categoryID')->on('province_categories')->nullOnDelete();
			$table->index('start_at');
			$table->index('province_id');
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('events');
	}
};


