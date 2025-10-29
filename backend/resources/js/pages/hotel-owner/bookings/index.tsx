import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, Eye, Hotel } from "lucide-react";

interface Booking {
    booking_id: number;
    full_name: string;
    email: string;
    mobile: string;
    check_in: string;
    check_out: string;
    total_amount: number;
    status: "pending" | "paid" | "cancelled";
    payment_status: "success" | "failed" | "pending";
    property?: {
        property_id: number;
        place?: {
            name: string;
        };
    };
    rooms?: Array<{
        room_type: string;
        price_per_night: number;
    }>;
    created_at: string;
}

interface PaginatedBookings {
    data: Booking[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    bookings?: PaginatedBookings;
}

export default function HotelOwnerBookingsIndex({
    bookings = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        links: [],
    },
}: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge variant="default">Paid</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case "success":
                return <Badge variant="default">Success</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Hotel Bookings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Hotel Bookings</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor your hotel bookings
                        </p>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {bookings.data.map((booking) => (
                        <Card
                            key={booking.booking_id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">
                                            Booking #{booking.booking_id}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span className="text-sm">
                                                {booking.full_name}
                                            </span>
                                            {booking.email && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-sm">
                                                        {booking.email}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {getStatusBadge(booking.status)}
                                        {getPaymentStatusBadge(
                                            booking.payment_status
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Property Info */}
                                {booking.property && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Hotel className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {booking.property.place?.name ||
                                                "Unknown Property"}
                                        </span>
                                    </div>
                                )}

                                {/* Booking Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            Check-in
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(
                                                booking.check_in
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            Check-out
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(
                                                booking.check_out
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            Total Amount
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-semibold">
                                            <DollarSign className="h-3 w-3" />$
                                            {booking.total_amount.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            Booked On
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(
                                                booking.created_at
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Room Types */}
                                {booking.rooms && booking.rooms.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">
                                            Room Types
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {booking.rooms.map(
                                                (room, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {room.room_type} - $
                                                        {room.price_per_night}
                                                        /night
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button asChild size="sm" variant="outline">
                                        <Link
                                            href={`/hotel-owner/bookings/${booking.booking_id}`}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Link>
                                    </Button>
                                    {booking.mobile && (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                        >
                                            <a href={`tel:${booking.mobile}`}>
                                                Contact Guest
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {bookings.data.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">
                                No Bookings Found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                You don't have any bookings for your properties
                                yet.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Bookings will appear here once guests start
                                making reservations.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {bookings.last_page > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                        {bookings.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                asChild={!!link.url}
                                disabled={!link.url}
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
