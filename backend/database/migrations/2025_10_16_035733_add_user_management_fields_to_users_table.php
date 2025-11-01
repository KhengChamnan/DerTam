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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->after('name');
            $table->string('phone_number')->nullable()->after('email');
            $table->enum('role', ['Super Admin', 'Admin', 'User'])->default('User')->after('phone_number');
            $table->enum('status', ['Active', 'Inactive', 'Invited', 'Suspended'])->default('Active')->after('role');
            $table->timestamp('last_login_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'phone_number', 'role', 'status', 'last_login_at']);
        });
    }
};
