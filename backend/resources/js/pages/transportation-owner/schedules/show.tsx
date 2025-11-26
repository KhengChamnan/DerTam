import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type BreadcrumbItem } from "@/types";
import {
    Bus,
    Users,
    Calendar,
    MapPin,
    Edit,
    ArrowLeft,
    Clock,
    DollarSign,
    Navigation,
    User,
    Mail,
    Phone,
} from "lucide-react";

interface Booking {
    id: number;
    booking_status: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    seats: Array<{
        id: number;
        seat_number: string;
    }>;
}

interface ScheduleData {
    id: number;
    departure_time: string;
    arrival_time: string;
    price: number;
    status: "scheduled" | "departed" | "arrived" | "cancelled";
    created_at: string;
    bus: {
        id: number;
        bus_name: string;
        bus_plate: string;
        description?: string;
        is_available: boolean;
        status: string;
        bus_property?: {
            id: number;
            bus_type: string;
            seat_capacity: number;
            image_url?: string;
            amenities?: string;
            features?: string;
            price_per_seat?: number;
            transportation?: {
                id: number;
                place?: {
                    placeID: number;
                    name: string;
                };
            };
        };
    };
    route: {
        id: number;
        from_location: string;
        to_location: string;
        distance_km?: number;
        duration_hours?: number;
    };
    bookings?: Booking[];
}

interface Props {
    schedule: ScheduleData;
}

export default function TransportationOwnerScheduleShow({ schedule }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/transportation-owner/dashboard" },
        { title: "Schedules", href: "/transportation-owner/schedules" },
        {
            title: `${schedule.route.from_location} → ${schedule.route.to_location}`,
            href: "#",
        },
    ];
    // Helper to parse datetime string as local time
    const parseAsLocalTime = (dateString: string) => {
        // Parse the datetime string as local time, not UTC
        const dateParts = dateString.replace(" ", "T").split(/[-T:]/);
        return new Date(
            parseInt(dateParts[0]), // year
            parseInt(dateParts[1]) - 1, // month (0-indexed)
            parseInt(dateParts[2]), // day
            parseInt(dateParts[3] || "0"), // hours
            parseInt(dateParts[4] || "0"), // minutes
            parseInt(dateParts[5] || "0") // seconds
        );
    };

    const formatDateTime = (dateString: string) => {
        const date = parseAsLocalTime(dateString);
        const month = date.toLocaleString("en-US", { month: "short" });
        const day = date.getDate();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${month} ${day}, ${year} ${displayHours}:${minutes
            .toString()
            .padStart(2, "0")} ${ampm}`;
    };

    const formatTime = (dateString: string) => {
        const date = parseAsLocalTime(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    };

    const formatDate = (dateString: string) => {
        const date = parseAsLocalTime(dateString);
        const month = date.toLocaleString("en-US", { month: "short" });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    const bookedSeats = schedule.bookings?.length || 0;
    const seatCapacity = schedule.bus.bus_property?.seat_capacity || 0;
    const availableSeats = seatCapacity - bookedSeats;

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: any } = {
            scheduled: "default",
            departed: "secondary",
            arrived: "outline",
            cancelled: "destructive",
        };
        const colors: { [key: string]: string } = {
            scheduled: "bg-blue-500 text-white",
            departed: "bg-yellow-500 text-white",
            arrived: "bg-green-500 text-white",
            cancelled: "bg-red-500 text-white",
        };
        return (
            <Badge className={colors[status] || ""}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getBookingStatusBadge = (status: string) => {
        const colors: { [key: string]: string } = {
            confirmed: "bg-green-500 text-white",
            pending: "bg-yellow-500 text-white",
            cancelled: "bg-red-500 text-white",
            completed: "bg-blue-500 text-white",
        };
        return (
            <Badge className={colors[status] || "bg-gray-500 text-white"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const amenities = schedule.bus.bus_property?.amenities
        ? (() => {
              try {
                  return JSON.parse(schedule.bus.bus_property.amenities);
              } catch {
                  return [];
              }
          })()
        : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`Schedule Details - ${schedule.route.from_location} → ${schedule.route.to_location}`}
            />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Schedule Details
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {schedule.route.from_location} →{" "}
                            {schedule.route.to_location}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/transportation-owner/schedules">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Schedules
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Schedule Information */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Schedule Details Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Schedule Information
                                    </CardTitle>
                                    {getStatusBadge(schedule.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Departure
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">
                                                    {formatTime(
                                                        schedule.departure_time
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        schedule.departure_time
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Arrival
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">
                                                    {formatTime(
                                                        schedule.arrival_time
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        schedule.arrival_time
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Price
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-lg font-semibold">
                                                {Number(schedule.price).toFixed(
                                                    2
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {schedule.route.distance_km && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">
                                                Distance
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Navigation className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-medium">
                                                    {schedule.route.distance_km}{" "}
                                                    km
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {schedule.route.duration_hours && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Duration
                                        </p>
                                        <p className="font-medium">
                                            {Math.floor(
                                                schedule.route.duration_hours
                                            )}{" "}
                                            hours{" "}
                                            {Math.round(
                                                (schedule.route.duration_hours %
                                                    1) *
                                                    60
                                            )}{" "}
                                            minutes
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Bus Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bus className="h-5 w-5" />
                                    Bus Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Bus Name
                                        </p>
                                        <p className="font-medium">
                                            {schedule.bus.bus_name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Plate Number
                                        </p>
                                        <p className="font-medium">
                                            {schedule.bus.bus_plate}
                                        </p>
                                    </div>
                                </div>

                                {schedule.bus.bus_property && (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                                    Bus Type
                                                </p>
                                                <p className="font-medium">
                                                    {
                                                        schedule.bus
                                                            .bus_property
                                                            .bus_type
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                                    Seat Capacity
                                                </p>
                                                <p className="font-medium">
                                                    {
                                                        schedule.bus
                                                            .bus_property
                                                            .seat_capacity
                                                    }{" "}
                                                    seats
                                                </p>
                                            </div>
                                        </div>

                                        {amenities.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                                    Amenities
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {amenities.map(
                                                        (
                                                            amenity: string,
                                                            index: number
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                            >
                                                                {amenity}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {schedule.bus.bus_property
                                            .transportation?.place && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                                    Company
                                                </p>
                                                <p className="font-medium">
                                                    {
                                                        schedule.bus
                                                            .bus_property
                                                            .transportation
                                                            .place.name
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {schedule.bus.description && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Description
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {schedule.bus.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Bookings List */}
                        {schedule.bookings && schedule.bookings.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Bookings ({schedule.bookings.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {schedule.bookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    booking.user
                                                                        .name
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {
                                                                        booking
                                                                            .user
                                                                            .email
                                                                    }
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    {
                                                                        booking
                                                                            .user
                                                                            .phone
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {getBookingStatusBadge(
                                                        booking.booking_status
                                                    )}
                                                </div>

                                                {booking.seats &&
                                                    booking.seats.length >
                                                        0 && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                Seats:
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {booking.seats.map(
                                                                    (seat) => (
                                                                        <Badge
                                                                            key={
                                                                                seat.id
                                                                            }
                                                                            variant="outline"
                                                                            className="text-xs"
                                                                        >
                                                                            {
                                                                                seat.seat_number
                                                                            }
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Total Seats
                                    </span>
                                    <span className="font-semibold">
                                        {seatCapacity}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Booked Seats
                                    </span>
                                    <span className="font-semibold">
                                        {bookedSeats}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Available Seats
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        {availableSeats}
                                    </span>
                                </div>
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">
                                            Occupancy
                                        </span>
                                        <span className="font-semibold">
                                            {seatCapacity > 0
                                                ? Math.round(
                                                      (bookedSeats /
                                                          seatCapacity) *
                                                          100
                                                  )
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${
                                                    seatCapacity > 0
                                                        ? (bookedSeats /
                                                              seatCapacity) *
                                                          100
                                                        : 0
                                                }%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Revenue Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Price per Seat
                                    </span>
                                    <span className="font-semibold">
                                        ${Number(schedule.price).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Booked Revenue
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        $
                                        {(
                                            bookedSeats * Number(schedule.price)
                                        ).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Potential Revenue
                                    </span>
                                    <span className="font-semibold">
                                        $
                                        {(
                                            seatCapacity *
                                            Number(schedule.price)
                                        ).toFixed(2)}
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
