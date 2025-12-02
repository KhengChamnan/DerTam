<?php

namespace App\Http\Controllers\API\Booking;

use App\Http\Controllers\API\Payment\BasePaymentController;
use App\Models\Booking\Booking;
use App\Models\Booking\BookingItem;
use App\Services\AbaPayWayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Bus\BusSeat;
use App\Models\Bus\SeatBooking;
class BusBookingController extends BasePaymentController
{
    public function __construct(AbaPayWayService $abaService)
    {
        parent::__construct($abaService);
    }

    /**
     * Create a new bus booking with payment
     * POST /api/booking/bus/create
     */
    public function createBusBooking(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required|exists:bus_schedules,id',
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'required|exists:bus_seats,id',
            'firstname' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $schedule = \App\Models\Bus\BusSchedule::with(['bus', 'route'])->findOrFail($request->schedule_id);
            
            // Verify seats belong to the bus in this schedule
            $validSeatIds = BusSeat::where('bus_id', $schedule->bus_id)
                ->whereIn('id', $request->seat_ids)
                ->pluck('id')
                ->toArray();

            if (count($validSeatIds) !== count($request->seat_ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some seats do not belong to this bus',
                ], 400);
            }

            // Check if seats are already booked for this schedule (only confirmed bookings block seats)
            $alreadyBooked = SeatBooking::where('schedule_id', $request->schedule_id)
                ->whereIn('seat_id', $request->seat_ids)
                ->whereHas('booking', function($query) {
                    $query->where('status', 'confirmed');
                })
                ->exists();

            if ($alreadyBooked) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more seats are already booked for this schedule',
                ], 400);
            }

            $currency = 'USD'; // Fixed currency
            $pricePerSeat = (float)$schedule->price;
            $totalAmount = $pricePerSeat * count($request->seat_ids);

            // Create main booking
            $booking = Booking::create([
                'user_id' => auth()->id(),
                'total_amount' => $totalAmount,
                'currency' => $currency,
                'status' => 'pending',
                'expires_at' => now()->addMinutes(10),
            ]);

            // Create booking items for each seat
            $createdItems = [];
            foreach ($request->seat_ids as $seatId) {
                $bookingItem = BookingItem::create([
                    'booking_id' => $booking->id,
                    'item_type' => 'bus_seat',
                    'item_id' => $seatId,
                    'quantity' => 1,
                    'unit_price' => $pricePerSeat,
                    'total_price' => $pricePerSeat,
                ]);

                // Create seat booking record
                SeatBooking::create([
                    'booking_id' => $booking->id,
                    'schedule_id' => $request->schedule_id,
                    'seat_id' => $seatId,
                    'price' => $pricePerSeat,
                ]);

                $seat = BusSeat::find($seatId);
                $createdItems[] = [
                    'booking_item_id' => $bookingItem->id,
                    'seat_id' => $seatId,
                    'seat_number' => $seat->column_label . $seat->row,
                    'price' => $pricePerSeat,
                ];
            }

            // Create payment
            $payment = $this->createPayment($booking->id, $totalAmount, $currency);

            // Prepare ABA items
            $abaItems = [[
                'name' => "Bus Ticket: {$schedule->route->from_location} → {$schedule->route->to_location}",
                'quantity' => count($request->seat_ids),
                'price' => $pricePerSeat
            ]];

            // Process ABA PayWay payment
            $abaResponse = $this->processAbaPayment($request, $payment, $abaItems);

            if (!$abaResponse['success']) {
                DB::rollBack();
                Log::error('ABA PayWay payment failed for bus booking', [
                    'booking_id' => $booking->id,
                    'payment_id' => $payment->id,
                    'aba_response' => $abaResponse,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create payment with ABA PayWay',
                    'error' => $abaResponse['error'] ?? 'Unknown error',
                ], 500);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bus booking created successfully',
                'data' => [
                    'booking' => [
                        'id' => $booking->id,
                        'total_amount' => $booking->total_amount,
                        'currency' => $booking->currency,
                        'status' => $booking->status,
                        'schedule' => [
                            'id' => $schedule->id,
                            'route' => "{$schedule->route->from_location} → {$schedule->route->to_location}",
                            'departure_time' => $schedule->departure_time,
                            'bus_name' => $schedule->bus->bus_name,
                        ],
                        'seats' => $createdItems,
                    ],
                    'aba_response' => $abaResponse['data'],
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bus booking creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating bus booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get list of confirmed bus bookings for authenticated user
     * GET /api/booking/bus/my-bookings
     */
    public function getMyBusBookings(Request $request)
    {
        try {
            $userId = auth()->id();

            // Get all confirmed bookings that have bus seat items
            $bookings = Booking::where('user_id', $userId)
                ->where('status', 'confirmed')
                ->whereHas('bookingItems', function ($query) {
                    $query->where('item_type', 'bus_seat');
                })
                ->with(['bookingItems' => function ($query) {
                    $query->where('item_type', 'bus_seat');
                }])
                ->orderBy('created_at', 'desc')
                ->get();

            $busBookings = [];

            foreach ($bookings as $booking) {
                // Get seat bookings for this booking
                $seatBookings = SeatBooking::where('booking_id', $booking->id)
                    ->with(['schedule.bus.busProperty', 'schedule.route', 'seat'])
                    ->get();

                if ($seatBookings->isEmpty()) {
                    continue;
                }

                // Get schedule info from first seat booking
                $schedule = $seatBookings->first()->schedule;

                $seats = $seatBookings->map(function ($seatBooking) {
                    return [
                        'seat_id' => $seatBooking->seat_id,
                        'seat_number' => $seatBooking->seat->column_label . $seatBooking->seat->row,
                        'seat_type' => $seatBooking->seat->seat_type,
                        'price' => $seatBooking->price,
                    ];
                });

                $busBookings[] = [
                    'booking_id' => $booking->id,
                    'total_amount' => $booking->total_amount,
                    'currency' => $booking->currency,
                    'status' => $booking->status,
                    'booked_at' => $booking->created_at->toIso8601String(),
                    'schedule' => [
                        'id' => $schedule->id,
                        'departure_time' => $schedule->departure_time->toIso8601String(),
                        'arrival_time' => $schedule->arrival_time ? $schedule->arrival_time->toIso8601String() : null,
                        'from_location' => $schedule->route->from_location,
                        'to_location' => $schedule->route->to_location,
                    ],
                    'bus' => [
                        'id' => $schedule->bus->id,
                        'name' => $schedule->bus->bus_name,
                        'plate' => $schedule->bus->bus_plate,
                        'type' => $schedule->bus->busProperty->name ?? null,
                    ],
                    'seats_count' => $seats->count(),
                    'seats' => $seats,
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Bus bookings retrieved successfully',
                'data' => [
                    'bookings' => $busBookings,
                    'total' => count($busBookings),
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve bus bookings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving bus bookings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get details of a specific bus booking
     * GET /api/booking/bus/{id}
     */
    public function getBusBookingDetails($id)
    {
        try {
            $userId = auth()->id();

            // Find the booking
            $booking = Booking::where('id', $id)
                ->where('user_id', $userId)
                ->where('status', 'confirmed')
                ->whereHas('bookingItems', function ($query) {
                    $query->where('item_type', 'bus_seat');
                })
                ->first();

            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bus booking not found or not confirmed',
                ], 404);
            }

            // Get seat bookings with full details
            $seatBookings = SeatBooking::where('booking_id', $booking->id)
                ->with(['schedule.bus.busProperty', 'schedule.route', 'seat'])
                ->get();

            if ($seatBookings->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No seat bookings found for this booking',
                ], 404);
            }

            $schedule = $seatBookings->first()->schedule;

            $seats = $seatBookings->map(function ($seatBooking) {
                return [
                    'seat_id' => $seatBooking->seat_id,
                    'seat_number' => $seatBooking->seat->column_label . $seatBooking->seat->row,
                    'seat_type' => $seatBooking->seat->seat_type,
                    'price' => $seatBooking->price,
                ];
            });

            $bookingDetails = [
                'booking_id' => $booking->id,
                'total_amount' => $booking->total_amount,
                'currency' => $booking->currency,
                'status' => $booking->status,
                'booked_at' => $booking->created_at->toIso8601String(),
                'schedule' => [
                    'id' => $schedule->id,
                    'departure_time' => $schedule->departure_time->toIso8601String(),
                    'arrival_time' => $schedule->arrival_time ? $schedule->arrival_time->toIso8601String() : null,
                    'from_location' => $schedule->route->from_location,
                    'to_location' => $schedule->route->to_location,
                ],
                'bus' => [
                    'id' => $schedule->bus->id,
                    'name' => $schedule->bus->bus_name,
                    'plate' => $schedule->bus->bus_plate,
                    'type' => $schedule->bus->busProperty->name ?? null,
                ],
                'seats_count' => $seats->count(),
                'seats' => $seats,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Bus booking details retrieved successfully',
                'data' => $bookingDetails,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve bus booking details', [
                'booking_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving bus booking details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
