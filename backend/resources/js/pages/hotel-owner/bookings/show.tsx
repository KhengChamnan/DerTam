import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Calendar,
    MapPin,
    User,
    Mail,
    Phone,
    DollarSign,
    Hotel,
    BedDouble,
    ChevronLeft,
    Edit,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface BookingItem {
    id: number;
    booking_id: number;
    booking: {
        id: number;
        user_id: number;
        total_amount: number;
        currency: string;
        status: "pending" | "confirmed" | "cancelled" | "completed";
        created_at: string;
        user?: {
            id: number;
            name: string;
            email: string;
            phone_number?: string;
        };
        payments?: Array<{
            id: number;
            status: "success" | "failed" | "pending" | "processing";
            amount: number;
        }>;
    };
    room_property: {
        room_properties_id: number;
        room_type: string;
        price_per_night: number;
        property: {
            property_id: number;
            place?: {
                placeID: number;
                name: string;
            };
        };
        amenities?: Array<{
            amenity_id: number;
            amenity_name: string;
        }>;
    };
    hotel_details?: {
        id: number;
        check_in: string;
        check_out: string;
        nights: number;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    bookingItem: BookingItem;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/hotel-owner/dashboard",
    },
    {
        title: "Bookings",
        href: "/hotel-owner/bookings",
    },
    {
        title: "Booking Details",
        href: "#",
    },
];

export default function BookingShow({ bookingItem }: Props) {
    const [status, setStatus] = useState(bookingItem.booking.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = () => {
        setIsUpdating(true);
        router.put(
            `/hotel-owner/bookings/${bookingItem.id}`,
            { status },
            {
                onFinish: () => setIsUpdating(false),
            }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <Badge variant="default">Confirmed</Badge>;
            case "completed":
                return <Badge variant="default">Completed</Badge>;
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
            case "processing":
                return <Badge variant="secondary">Processing</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatCurrency = (amount: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Booking #${bookingItem.booking_id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Booking #{bookingItem.booking_id}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            View and manage booking details
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/hotel-owner/bookings">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Bookings
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Guest Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Guest Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Name
                                        </p>
                                        <p className="font-medium">
                                            {bookingItem.booking.user?.name ||
                                                "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Email
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">
                                                {bookingItem.booking.user
                                                    ?.email || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    {bookingItem.booking.user?.phone_number && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Phone
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-medium">
                                                    {
                                                        bookingItem.booking.user
                                                            .phone_number
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Property & Room Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Hotel className="h-5 w-5" />
                                    Property & Room Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Property
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">
                                                {bookingItem.room_property
                                                    .property?.place?.name ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Room Type
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">
                                                {
                                                    bookingItem.room_property
                                                        .room_type
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Check-in
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">
                                                {bookingItem.hotel_details
                                                    ?.check_in
                                                    ? formatDate(
                                                          bookingItem
                                                              .hotel_details
                                                              .check_in
                                                      )
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Check-out
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">
                                                {bookingItem.hotel_details
                                                    ?.check_out
                                                    ? formatDate(
                                                          bookingItem
                                                              .hotel_details
                                                              .check_out
                                                      )
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Number of Nights
                                        </p>
                                        <p className="font-medium">
                                            {bookingItem.hotel_details
                                                ?.nights || 0}{" "}
                                            {(bookingItem.hotel_details
                                                ?.nights || 0) === 1
                                                ? "night"
                                                : "nights"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Number of Rooms
                                        </p>
                                        <p className="font-medium">
                                            {bookingItem.quantity}{" "}
                                            {bookingItem.quantity === 1
                                                ? "room"
                                                : "rooms"}
                                        </p>
                                    </div>
                                </div>

                                {bookingItem.room_property.amenities &&
                                    bookingItem.room_property.amenities.length >
                                        0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Amenities
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {bookingItem.room_property.amenities.map(
                                                    (amenity) => (
                                                        <Badge
                                                            key={
                                                                amenity.amenity_id
                                                            }
                                                            variant="outline"
                                                        >
                                                            {
                                                                amenity.amenity_name
                                                            }
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Payment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Price per night
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                bookingItem.unit_price,
                                                bookingItem.booking.currency
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Number of nights
                                        </span>
                                        <span className="font-medium">
                                            {bookingItem.hotel_details
                                                ?.nights || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Number of rooms
                                        </span>
                                        <span className="font-medium">
                                            {bookingItem.quantity}
                                        </span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between">
                                        <span className="font-semibold">
                                            Total Amount
                                        </span>
                                        <span className="font-bold text-lg">
                                            {formatCurrency(
                                                bookingItem.total_price,
                                                bookingItem.booking.currency
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {bookingItem.booking.payments &&
                                    bookingItem.booking.payments.length > 0 && (
                                        <div className="border-t pt-4">
                                            <p className="text-sm font-medium mb-2">
                                                Payment Status
                                            </p>
                                            {bookingItem.booking.payments.map(
                                                (payment) => (
                                                    <div
                                                        key={payment.id}
                                                        className="flex justify-between items-center"
                                                    >
                                                        <span className="text-sm text-muted-foreground">
                                                            Payment #
                                                            {payment.id}
                                                        </span>
                                                        {getPaymentStatusBadge(
                                                            payment.status
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="space-y-6">
                        {/* Booking Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Current Status:
                                    </span>
                                    {getStatusBadge(bookingItem.booking.status)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Booking ID:
                                    </span>
                                    <span className="font-medium">
                                        #{bookingItem.booking_id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Booked On:
                                    </span>
                                    <span className="font-medium text-sm">
                                        {formatDate(bookingItem.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Last Updated:
                                    </span>
                                    <span className="font-medium text-sm">
                                        {formatDate(bookingItem.updated_at)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
