<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trip_share_accesses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('trip_share_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('accessed_at')->useCurrent();
            $table->timestamps();

            $table->foreign('trip_share_id')->references('id')->on('trip_shares')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['trip_share_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_share_accesses');
    }
};
