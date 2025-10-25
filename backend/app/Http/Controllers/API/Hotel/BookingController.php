<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Hotel\BookingDetail;
use App\Models\Hotel\BookingRoom;
use App\Models\Hotel\RoomProperty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /**
     * Create a new hotel booking.
     * 
     * Request body:
     * {
     *   "trip_id": 1, // optional
     *   "full_name": "John Doe",
     *   "age": 30,
     *   "gender": "Male",
     *   "mobile": "+1234567890",
     *   "email": "john@example.com",
     *   "id_number": "ABC123456",
     *   "check_in": "2025-11-01",
     *   "check_out": "2025-11-05",
     *   "room_ids": [1, 2], // Array of room_properties_id (duplicates allowed, e.g., [1, 1] for 2 rooms of same type)
     *   "payment_method": "KHQR"
     * }
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'trip_id' => 'nullable|exists:trips,trip_id',
                'full_name' => 'required|string|max:100',
                'age' => 'nullable|integer|min:1|max:150',
                'gender' => 'nullable|in:Male,Female,Other',
                'mobile' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:100',
                'id_number' => 'nullable|string|max:50',
                'id_image' => 'nullable|string|max:255',
                'check_in' => 'required|date|after_or_equal:today',
                'check_out' => 'required|date|after:check_in',
                'room_ids' => 'required|array|min:1',
                'room_ids.*' => 'required|exists:room_properties,room_properties_id',
                'payment_method' => 'nullable|in:KHQR,ABA_QR,Cash,Acleda_Bank',
            ]);

            // Calculate total amount based on rooms and dates
            $checkIn = new \DateTime($validated['check_in']);
            $checkOut = new \DateTime($validated['check_out']);
            $nights = $checkIn->diff($checkOut)->days;

            if ($nights < 1) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['check_out' => ['Check-out must be at least 1 day after check-in']],
                ], 422);
            }

            // Get unique room IDs to fetch room details
            // Note: Users can book the same room multiple times (e.g., [1, 1] for 2 rooms of type 1)
            $uniqueRoomIds = array_unique($validated['room_ids']);
            $rooms = RoomProperty::whereIn('room_properties_id', $uniqueRoomIds)->get();

            // Validate that all unique rooms exist
            if ($rooms->count() !== count($uniqueRoomIds)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['room_ids' => ['One or more rooms not found']],
                ], 422);
            }

            // Check if all rooms are available
            $unavailableRooms = $rooms->where('is_available', false);
            if ($unavailableRooms->count() > 0) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['room_ids' => ['One or more rooms are not available']],
                ], 422);
            }

            // Calculate total amount (considering duplicate room IDs)
            $totalAmount = 0;
            $roomPriceMap = $rooms->pluck('price_per_night', 'room_properties_id')->toArray();
            
            foreach ($validated['room_ids'] as $roomId) {
                $totalAmount += $roomPriceMap[$roomId];
            }
            
            $totalAmount *= $nights;

            // Start database transaction
            DB::beginTransaction();

            try {
                // Generate unique merchant reference number
                $merchantRefNo = 'BK' . date('YmdHis') . rand(1000, 9999);

                // Create booking detail
                $bookingDetail = BookingDetail::create([
                    'user_id' => Auth::id(), // Automatically set the authenticated user
                    'trip_id' => $validated['trip_id'] ?? null,
                    'full_name' => $validated['full_name'],
                    'age' => $validated['age'] ?? null,
                    'gender' => $validated['gender'] ?? null,
                    'mobile' => $validated['mobile'] ?? null,
                    'email' => $validated['email'] ?? null,
                    'id_number' => $validated['id_number'] ?? null,
                    'id_image' => $validated['id_image'] ?? null,
                    'check_in' => $validated['check_in'],
                    'check_out' => $validated['check_out'],
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'] ?? null,
                    'status' => 'pending',
                    'merchant_ref_no' => $merchantRefNo,
                    'payment_status' => 'pending',
                ]);

                // Create booking rooms
                foreach ($validated['room_ids'] as $roomId) {
                    BookingRoom::create([
                        'booking_id' => $bookingDetail->booking_id,
                        'room_id' => $roomId,
                    ]);
                }

                DB::commit();

                // Load relationships for response
                $bookingDetail->load([
                    'bookingRooms.roomProperty:room_properties_id,property_id,room_type,price_per_night,max_guests',
                    'trip:trip_id,title'
                ]);

                return response()->json([
                    'message' => 'Booking created successfully',
                    'data' => [
                        'booking_id' => $bookingDetail->booking_id,
                        'merchant_ref_no' => $bookingDetail->merchant_ref_no,
                        'full_name' => $bookingDetail->full_name,
                        'check_in' => $bookingDetail->check_in->format('Y-m-d'),
                        'check_out' => $bookingDetail->check_out->format('Y-m-d'),
                        'nights' => $nights,
                        'total_amount' => $bookingDetail->total_amount,
                        'status' => $bookingDetail->status,
                        'payment_status' => $bookingDetail->payment_status,
                        'rooms' => $bookingDetail->bookingRooms,
                        'trip' => $bookingDetail->trip,
                    ],
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Booking creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to create booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all bookings with optional filters.
     * 
     * Query Parameters:
     * - status: Filter by booking status (pending, paid, cancelled)
     * - payment_status: Filter by payment status (success, failed, pending)
     * - trip_id: Filter by trip ID
     * - email: Filter by guest email
     * - merchant_ref_no: Filter by merchant reference number
     */
    public function index(Request $request)
    {
        try {
            $query = BookingDetail::with([
                'bookingRooms.roomProperty:room_properties_id,property_id,room_type,price_per_night',
                'bookingRooms.roomProperty.property:property_id,place_id',
                'bookingRooms.roomProperty.property.place:placeID,name,google_maps_link,latitude,longitude,images_url',
                'trip:trip_id,title'
            ])->where('user_id', Auth::id()); // Only show bookings for the authenticated user

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by payment status
            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            // Filter by trip ID
            if ($request->has('trip_id')) {
                $query->where('trip_id', $request->trip_id);
            }

            // Filter by email
            if ($request->has('email')) {
                $query->where('email', 'like', '%' . $request->email . '%');
            }

            // Filter by merchant reference number
            if ($request->has('merchant_ref_no')) {
                $query->where('merchant_ref_no', $request->merchant_ref_no);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $bookings = $query->orderBy('created_at', 'desc')
                              ->paginate($perPage);

            return response()->json([
                'message' => 'Bookings retrieved successfully',
                'data' => $bookings->items(),
                'pagination' => [
                    'current_page' => $bookings->currentPage(),
                    'last_page' => $bookings->lastPage(),
                    'per_page' => $bookings->perPage(),
                    'total' => $bookings->total(),
                    'from' => $bookings->firstItem(),
                    'to' => $bookings->lastItem(),
                ],
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to retrieve bookings', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve bookings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single booking by ID.
     * For authenticated users: only shows their own bookings
     * For public access: allows viewing by merchant_ref_no (for payment verification)
     */
    public function show($booking_id)
    {
        try {
            $query = BookingDetail::with([
                'bookingRooms.roomProperty:room_properties_id,property_id,room_type,room_description,price_per_night,max_guests,images_url',
                'bookingRooms.roomProperty.amenities:amenity_id,amenity_name',
                'trip:trip_id,title,start_date,end_date'
            ]);

            // If user is authenticated, only show their own bookings
            if (Auth::check()) {
                $query->where('user_id', Auth::id());
                $booking = $query->find($booking_id);
            } else {
                // For public access, allow viewing by merchant_ref_no only
                $booking = $query->where('merchant_ref_no', $booking_id)->first();
            }

            if (!$booking) {
                return response()->json([
                    'message' => 'Booking not found',
                ], 404);
            }

            // Calculate nights
            $checkIn = new \DateTime($booking->check_in);
            $checkOut = new \DateTime($booking->check_out);
            $nights = $checkIn->diff($checkOut)->days;

            // Transform booking rooms to match the expected format
            $bookingRooms = $booking->bookingRooms->map(function ($bookingRoom) {
                return [
                    'id' => $bookingRoom->id,
                    'booking_id' => $bookingRoom->booking_id,
                    'room_id' => $bookingRoom->room_id,
                    'room_property' => $bookingRoom->roomProperty ? [
                        'room_properties_id' => $bookingRoom->roomProperty->room_properties_id,
                        'property_id' => $bookingRoom->roomProperty->property_id,
                        'room_type' => $bookingRoom->roomProperty->room_type,
                        'room_description' => $bookingRoom->roomProperty->room_description,
                        'price_per_night' => $bookingRoom->roomProperty->price_per_night,
                        'max_guests' => $bookingRoom->roomProperty->max_guests,
                        'images_url' => $bookingRoom->roomProperty->images_url,
                        'amenities' => $bookingRoom->roomProperty->amenities
                    ] : null
                ];
            });

            return response()->json([
                'message' => 'Booking retrieved successfully',
                'data' => [
                    'booking_id' => $booking->booking_id,
                    'trip_id' => $booking->trip_id,
                    'full_name' => $booking->full_name,
                    'age' => $booking->age,
                    'gender' => $booking->gender,
                    'mobile' => $booking->mobile,
                    'email' => $booking->email,
                    'id_number' => $booking->id_number,
                    'id_image' => $booking->id_image,
                    'check_in' => $booking->check_in,
                    'check_out' => $booking->check_out,
                    'total_amount' => $booking->total_amount,
                    'payment_method' => $booking->payment_method,
                    'status' => $booking->status,
                    'merchant_ref_no' => $booking->merchant_ref_no,
                    'tran_id' => $booking->tran_id,
                    'payment_date' => $booking->payment_date,
                    'payment_status' => $booking->payment_status,
                    'created_at' => $booking->created_at,
                    'updated_at' => $booking->updated_at,
                    'user_id' => $booking->user_id,
                    'booking_rooms' => $bookingRooms,
                    'trip' => $booking->trip,
                    'nights' => $nights
                ],
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to retrieve booking', [
                'booking_id' => $booking_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update booking status.
     * 
     * Request body:
     * {
     *   "status": "paid" // or "cancelled"
     * }
     */
    public function updateStatus(Request $request, $booking_id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,paid,cancelled',
            ]);

            $booking = BookingDetail::where('user_id', Auth::id())->find($booking_id);

            if (!$booking) {
                return response()->json([
                    'message' => 'Booking not found',
                ], 404);
            }

            $booking->update([
                'status' => $validated['status'],
            ]);

            return response()->json([
                'message' => 'Booking status updated successfully',
                'data' => [
                    'booking_id' => $booking->booking_id,
                    'status' => $booking->status,
                ],
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Failed to update booking status', [
                'booking_id' => $booking_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to update booking status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update payment status.
     * 
     * Request body:
     * {
     *   "payment_status": "success",
     *   "tran_id": "TXN123456",
     *   "payment_date": "2025-10-23 14:30:00"
     * }
     */
    public function updatePaymentStatus(Request $request, $booking_id)
    {
        try {
            $validated = $request->validate([
                'payment_status' => 'required|in:success,failed,pending',
                'tran_id' => 'nullable|string|max:100',
                'payment_date' => 'nullable|date',
            ]);

            $booking = BookingDetail::where('user_id', Auth::id())->find($booking_id);  

            if (!$booking) {
                return response()->json([
                    'message' => 'Booking not found',
                ], 404);
            }

            $updateData = [
                'payment_status' => $validated['payment_status'],
            ];

            if (isset($validated['tran_id'])) {
                $updateData['tran_id'] = $validated['tran_id'];
            }

            if (isset($validated['payment_date'])) {
                $updateData['payment_date'] = $validated['payment_date'];
            }

            // If payment is successful, update booking status to paid
            if ($validated['payment_status'] === 'success') {
                $updateData['status'] = 'paid';
            }

            $booking->update($updateData);

            return response()->json([
                'message' => 'Payment status updated successfully',
                'data' => [
                    'booking_id' => $booking->booking_id,
                    'payment_status' => $booking->payment_status,
                    'status' => $booking->status,
                ],
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Failed to update payment status', [
                'booking_id' => $booking_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel a booking.
     */
    public function cancel($booking_id)
    {
        try {
            $booking = BookingDetail::where('user_id', Auth::id())->find($booking_id);

            if (!$booking) {
                return response()->json([
                    'message' => 'Booking not found',
                ], 404);
            }

            // Check if booking can be cancelled
            if ($booking->status === 'cancelled') {
                return response()->json([
                    'message' => 'Booking is already cancelled',
                ], 400);
            }

            $booking->update([
                'status' => 'cancelled',
            ]);

            return response()->json([
                'message' => 'Booking cancelled successfully',
                'data' => [
                    'booking_id' => $booking->booking_id,
                    'status' => $booking->status,
                ],
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to cancel booking', [
                'booking_id' => $booking_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to cancel booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a booking (admin only - should be protected).
     */
    public function destroy($booking_id)
    {
        try {
            $booking = BookingDetail::where('user_id', Auth::id())->find($booking_id);

            if (!$booking) {
                return response()->json([
                    'message' => 'Booking not found',
                ], 404);
            }

            // Delete booking (cascade will handle booking_rooms)
            $booking->delete();

            return response()->json([
                'message' => 'Booking deleted successfully',
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to delete booking', [
                'booking_id' => $booking_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to delete booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
