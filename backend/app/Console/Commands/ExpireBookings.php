<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking\Booking;
use App\Models\Bus\SeatBooking;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpireBookings extends Command
{
    protected $signature = 'booking:expire';
    protected $description = 'Expire pending bookings older than 10 minutes';

    public function handle()
    {
        // Find bookings that are pending and expired
        $expiredBookings = Booking::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->get();

        if ($expiredBookings->isEmpty()) {
            return;
        }

        foreach ($expiredBookings as $booking) {
            DB::beginTransaction();
            try {
                // 1. Delete the seat reservations so others can book them
                SeatBooking::where('booking_id', $booking->id)->delete();
                
                // 2. Update booking status to 'expired' (or delete it based on your preference)
                $booking->update(['status' => 'expired']);
                
                Log::info("Booking {$booking->id} expired and seats released.");
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Failed to expire booking {$booking->id}: " . $e->getMessage());
            }
        }
    }
}