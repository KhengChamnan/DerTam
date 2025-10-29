import React from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Hotel,
    Users,
    DollarSign,
    Calendar,
    TrendingUp,
    Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Property {
    property_id: number;
    place?: {
        placeID: number;
        name: string;
        ratings: number;
    };
    roomProperties?: Array<{
        room_properties_id: number;
        room_type: string;
        price_per_night: number;
        is_available: boolean;
    }>;
}

interface Stats {
    total_hotels: number;
    total_rooms: number;
    available_rooms: number;
    occupancy_rate: number;
    total_revenue: number;
    recent_revenue: number;
    total_bookings: number;
    avg_daily_rate: number;
}

interface RecentBooking {
    booking_id: number;
    full_name?: string;
    check_in?: string;
    check_out?: string;
    total_amount?: number;
    status?: string;
    bookingRooms?: Array<{
        roomProperty?: {
            property?: {
                place?: {
                    name: string;
                };
            };
        };
    }>;
}

interface Props {
    properties: Property[];
    stats: Stats;
    recent_bookings: RecentBooking[];
}

export default function HotelOwnerDashboard({
    properties = [],
    stats = {
        total_hotels: 0,
        total_rooms: 0,
        available_rooms: 0,
        occupancy_rate: 0,
        total_revenue: 0,
        recent_revenue: 0,
        total_bookings: 0,
        avg_daily_rate: 0,
    },
    recent_bookings = [],
}: Props) {
    return (
        <AppLayout>
            <Head title="Hotel Owner Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Overview of your hotel properties and performance
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Hotels
                            </CardTitle>
                            <Hotel className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_hotels}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Properties you manage
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Rooms
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_rooms}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.available_rooms} available
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Occupancy Rate
                            </CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.occupancy_rate}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Current occupancy
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${stats.total_revenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${stats.recent_revenue} last 7 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Bookings
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_bookings}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg Daily Rate
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${stats.avg_daily_rate}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Average per booking
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Your Properties */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Hotel Properties</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Overview of your managed properties
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {properties.map((property) => {
                                const roomProperties =
                                    property.roomProperties || [];
                                const availableRooms = roomProperties.filter(
                                    (room) => room.is_available
                                );
                                const minPrice =
                                    roomProperties.length > 0
                                        ? Math.min(
                                              ...roomProperties.map(
                                                  (room) => room.price_per_night
                                              )
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={property.property_id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-semibold text-sm">
                                                    {property.place?.name ||
                                                        "Unknown Property"}
                                                </h3>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {property.place?.ratings ||
                                                        0}
                                                    /5
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {roomProperties.length} rooms
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {availableRooms.length}{" "}
                                                available
                                            </p>
                                            {roomProperties.length > 0 && (
                                                <p className="text-xs font-medium">
                                                    From ${minPrice}/night
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {properties.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Hotel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No properties assigned yet.</p>
                                <p className="text-sm">
                                    Contact your administrator to get properties
                                    assigned.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Latest bookings for your properties
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recent_bookings.map((booking) => {
                                const bookingRooms = booking.bookingRooms || [];
                                const propertyName =
                                    bookingRooms[0]?.roomProperty?.property
                                        ?.place?.name || "Unknown Property";

                                return (
                                    <div
                                        key={booking.booking_id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm">
                                                {booking.full_name ||
                                                    "Unknown Guest"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {propertyName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.check_in
                                                    ? new Date(
                                                          booking.check_in
                                                      ).toLocaleDateString()
                                                    : "N/A"}{" "}
                                                -{" "}
                                                {booking.check_out
                                                    ? new Date(
                                                          booking.check_out
                                                      ).toLocaleDateString()
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="font-medium text-sm">
                                                ${booking.total_amount || 0}
                                            </p>
                                            <Badge
                                                variant={
                                                    booking.status ===
                                                    "confirmed"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className="text-xs"
                                            >
                                                {booking.status || "Unknown"}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {recent_bookings.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No recent bookings found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
