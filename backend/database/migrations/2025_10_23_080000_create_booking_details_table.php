<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('booking_details', function (Blueprint $table) {
            $table->increments('booking_id');

            $table->string('full_name', 100);
            $table->integer('age')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->string('mobile', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('id_number', 50)->nullable();
            $table->string('id_image', 255)->nullable();

            $table->date('check_in');
            $table->date('check_out');
            $table->decimal('total_amount', 10, 2);
            $table->enum('payment_method', ['KHQR', 'ABA_QR', 'Cash', 'Acleda_Bank'])->nullable();
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');

            $table->string('merchant_ref_no', 100)->unique()->nullable();
            $table->string('tran_id', 100)->nullable();
            $table->dateTime('payment_date')->nullable();
            $table->enum('payment_status', ['success', 'failed', 'pending'])->default('pending');

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('booking_details');
    }
};
