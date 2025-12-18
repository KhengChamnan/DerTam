import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    booking: {
        user: {
            id: number;
            name: string;
            email: string;
            phone_number: string;
        };
    };
    seat: {
        id: number;
        seat_number: string;
    };
}

type SeatType = "standard" | "driver" | "empty";

interface Seat {
    id: string;
    row: number;
    col: number;
    column_label: string;
    type: SeatType;
    number: number | null;
    level?: "upper" | "lower";
}

interface SeatLayout {
    rows: number;
    columns: string[];
    layout_type: string;
    has_levels: boolean;
    seats: Seat[];
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
            seat_layout?: string;
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

    // Parse seat layout from bus property
    const seatLayout: SeatLayout | null = schedule.bus.bus_property?.seat_layout
        ? (() => {
              try {
                  // Check if it's already an object or a string
                  const layout =
                      typeof schedule.bus.bus_property.seat_layout === "string"
                          ? JSON.parse(schedule.bus.bus_property.seat_layout)
                          : schedule.bus.bus_property.seat_layout;
                  return layout;
              } catch {
                  return null;
              }
          })()
        : null;

    const [selectedLevel, setSelectedLevel] = React.useState<"lower" | "upper">(
        "lower"
    );

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

    const getBookingStatusBadge = (status?: string) => {
        const colors: { [key: string]: string } = {
            confirmed: "bg-green-500 text-white",
            pending: "bg-yellow-500 text-white",
            cancelled: "bg-red-500 text-white",
            completed: "bg-blue-500 text-white",
        };
        const displayStatus = status || "pending";
        return (
            <Badge
                className={colors[displayStatus] || "bg-gray-500 text-white"}
            >
                {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
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
                                            <p className="text-lg font-semibold">
                                                $
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

                        {/* Seat Availability Map */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bus className="h-5 w-5" />
                                    Seat Availability
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {availableSeats} of {seatCapacity} seats
                                    available
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Legend */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-12 rounded-lg border-2 border-blue-300 bg-blue-100 flex items-center justify-center"></div>
                                            <span className="text-muted-foreground">
                                                Available
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-12 rounded-lg border-2 border-gray-400 bg-gray-200 flex items-center justify-center"></div>
                                            <span className="text-muted-foreground">
                                                Booked
                                            </span>
                                        </div>
                                    </div>

                                    {/* Seat Grid with Actual Layout */}
                                    {seatLayout &&
                                    seatLayout.seats &&
                                    seatLayout.seats.length > 0 ? (
                                        <div className="bg-gray-50 p-6 rounded-lg border">
                                            {seatLayout.has_levels ? (
                                                <Tabs
                                                    defaultValue="lower"
                                                    className="w-full"
                                                    onValueChange={(value) =>
                                                        setSelectedLevel(
                                                            value as
                                                                | "lower"
                                                                | "upper"
                                                        )
                                                    }
                                                >
                                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                                        <TabsTrigger value="lower">
                                                            Lower Deck
                                                        </TabsTrigger>
                                                        <TabsTrigger value="upper">
                                                            Upper Deck
                                                        </TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent
                                                        value="lower"
                                                        className="space-y-4"
                                                    >
                                                        <div className="space-y-2 max-w-xl mx-auto">
                                                            {(() => {
                                                                const bookedSeatNumbers =
                                                                    new Set(
                                                                        schedule.bookings?.map(
                                                                            (
                                                                                b
                                                                            ) =>
                                                                                b
                                                                                    .seat
                                                                                    ?.seat_number
                                                                        ) || []
                                                                    );
                                                                const maxRow =
                                                                    Math.max(
                                                                        ...seatLayout.seats.map(
                                                                            (
                                                                                s: Seat
                                                                            ) =>
                                                                                s.row
                                                                        ),
                                                                        0
                                                                    );
                                                                const columns =
                                                                    seatLayout.columns;
                                                                const grid: React.ReactElement[] =
                                                                    [];

                                                                for (
                                                                    let row = 0;
                                                                    row <=
                                                                    maxRow;
                                                                    row++
                                                                ) {
                                                                    const rowSeats: React.ReactElement[] =
                                                                        [];

                                                                    columns.forEach(
                                                                        (
                                                                            columnLabel,
                                                                            colIndex
                                                                        ) => {
                                                                            if (
                                                                                columnLabel ===
                                                                                ""
                                                                            ) {
                                                                                // Aisle space
                                                                                rowSeats.push(
                                                                                    <div
                                                                                        key={`${row}-aisle-${colIndex}`}
                                                                                        className="w-8 h-12"
                                                                                    />
                                                                                );
                                                                            } else {
                                                                                // Find seat by row and col (not column_label)
                                                                                const seat =
                                                                                    seatLayout.seats.find(
                                                                                        (
                                                                                            s: Seat
                                                                                        ) =>
                                                                                            s.row ===
                                                                                                row &&
                                                                                            s.col ===
                                                                                                colIndex &&
                                                                                            s.level ===
                                                                                                "lower"
                                                                                    );

                                                                                if (
                                                                                    seat &&
                                                                                    seat.number !==
                                                                                        null
                                                                                ) {
                                                                                    const seatNumber = `${seat.number
                                                                                        .toString()
                                                                                        .padStart(
                                                                                            2,
                                                                                            "0"
                                                                                        )}`;
                                                                                    const isBooked =
                                                                                        bookedSeatNumbers.has(
                                                                                            seatNumber
                                                                                        );
                                                                                    const booking =
                                                                                        schedule.bookings?.find(
                                                                                            (
                                                                                                b
                                                                                            ) =>
                                                                                                b
                                                                                                    .seat
                                                                                                    ?.seat_number ===
                                                                                                seatNumber
                                                                                        );

                                                                                    const levelBadge =
                                                                                        seat.level ===
                                                                                        "upper"
                                                                                            ? "rounded-t-lg"
                                                                                            : "rounded-lg";

                                                                                    rowSeats.push(
                                                                                        <div
                                                                                            key={
                                                                                                seat.id
                                                                                            }
                                                                                            className={`
                                                                                        relative flex items-center justify-center text-xs font-medium
                                                                                        transition-all border-2 w-12 h-12 cursor-pointer
                                                                                        ${levelBadge}
                                                                                        ${
                                                                                            isBooked
                                                                                                ? "bg-gray-200 border-gray-400 text-gray-700"
                                                                                                : "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200"
                                                                                        }
                                                                                    `}
                                                                                            title={
                                                                                                isBooked
                                                                                                    ? `Seat ${
                                                                                                          seat.number
                                                                                                      } - Booked by ${
                                                                                                          booking
                                                                                                              ?.booking
                                                                                                              ?.user
                                                                                                              ?.name ||
                                                                                                          "Unknown"
                                                                                                      }`
                                                                                                    : `Seat ${seat.number} - Available`
                                                                                            }
                                                                                        >
                                                                                            <span className="font-semibold">
                                                                                                {
                                                                                                    seat.number
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                } else {
                                                                                    // Empty space where no seat exists
                                                                                    rowSeats.push(
                                                                                        <div
                                                                                            key={`${row}-${colIndex}-empty`}
                                                                                            className="w-12 h-12"
                                                                                        />
                                                                                    );
                                                                                }
                                                                            }
                                                                        }
                                                                    );

                                                                    grid.push(
                                                                        <div
                                                                            key={
                                                                                row
                                                                            }
                                                                            className="flex gap-1 justify-center items-center mb-2"
                                                                        >
                                                                            {
                                                                                rowSeats
                                                                            }
                                                                        </div>
                                                                    );
                                                                }

                                                                return grid;
                                                            })()}
                                                        </div>
                                                    </TabsContent>
                                                    <TabsContent
                                                        value="upper"
                                                        className="space-y-4"
                                                    >
                                                        <div className="space-y-2 max-w-xl mx-auto">
                                                            {(() => {
                                                                const bookedSeatNumbers =
                                                                    new Set(
                                                                        schedule.bookings?.map(
                                                                            (
                                                                                b
                                                                            ) =>
                                                                                b
                                                                                    .seat
                                                                                    ?.seat_number
                                                                        ) || []
                                                                    );
                                                                const maxRow =
                                                                    Math.max(
                                                                        ...seatLayout.seats.map(
                                                                            (
                                                                                s: Seat
                                                                            ) =>
                                                                                s.row
                                                                        ),
                                                                        0
                                                                    );
                                                                const columns =
                                                                    seatLayout.columns;
                                                                const grid: React.ReactElement[] =
                                                                    [];

                                                                for (
                                                                    let row = 0;
                                                                    row <=
                                                                    maxRow;
                                                                    row++
                                                                ) {
                                                                    const rowSeats: React.ReactElement[] =
                                                                        [];

                                                                    columns.forEach(
                                                                        (
                                                                            columnLabel,
                                                                            colIndex
                                                                        ) => {
                                                                            if (
                                                                                columnLabel ===
                                                                                ""
                                                                            ) {
                                                                                // Aisle space
                                                                                rowSeats.push(
                                                                                    <div
                                                                                        key={`${row}-aisle-${colIndex}`}
                                                                                        className="w-8 h-12"
                                                                                    />
                                                                                );
                                                                            } else {
                                                                                // Find seat by row and col (not column_label)
                                                                                const seat =
                                                                                    seatLayout.seats.find(
                                                                                        (
                                                                                            s: Seat
                                                                                        ) =>
                                                                                            s.row ===
                                                                                                row &&
                                                                                            s.col ===
                                                                                                colIndex &&
                                                                                            s.level ===
                                                                                                "upper"
                                                                                    );

                                                                                if (
                                                                                    seat &&
                                                                                    seat.number !==
                                                                                        null
                                                                                ) {
                                                                                    const seatNumber = `${seat.number
                                                                                        .toString()
                                                                                        .padStart(
                                                                                            2,
                                                                                            "0"
                                                                                        )}`;
                                                                                    const isBooked =
                                                                                        bookedSeatNumbers.has(
                                                                                            seatNumber
                                                                                        );
                                                                                    const booking =
                                                                                        schedule.bookings?.find(
                                                                                            (
                                                                                                b
                                                                                            ) =>
                                                                                                b
                                                                                                    .seat
                                                                                                    ?.seat_number ===
                                                                                                seatNumber
                                                                                        );

                                                                                    const levelBadge =
                                                                                        seat.level ===
                                                                                        "upper"
                                                                                            ? "rounded-t-lg"
                                                                                            : "rounded-lg";

                                                                                    rowSeats.push(
                                                                                        <div
                                                                                            key={
                                                                                                seat.id
                                                                                            }
                                                                                            className={`
                                                                                        relative flex items-center justify-center text-xs font-medium
                                                                                        transition-all border-2 w-12 h-12 cursor-pointer
                                                                                        ${levelBadge}
                                                                                        ${
                                                                                            isBooked
                                                                                                ? "bg-gray-200 border-gray-400 text-gray-700"
                                                                                                : "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200"
                                                                                        }
                                                                                    `}
                                                                                            title={
                                                                                                isBooked
                                                                                                    ? `Seat ${
                                                                                                          seat.number
                                                                                                      } - Booked by ${
                                                                                                          booking
                                                                                                              ?.booking
                                                                                                              ?.user
                                                                                                              ?.name ||
                                                                                                          "Unknown"
                                                                                                      }`
                                                                                                    : `Seat ${seat.number} - Available`
                                                                                            }
                                                                                        >
                                                                                            <span className="font-semibold">
                                                                                                {
                                                                                                    seat.number
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                } else {
                                                                                    // Empty space where no seat exists
                                                                                    rowSeats.push(
                                                                                        <div
                                                                                            key={`${row}-${colIndex}-empty`}
                                                                                            className="w-12 h-12"
                                                                                        />
                                                                                    );
                                                                                }
                                                                            }
                                                                        }
                                                                    );

                                                                    grid.push(
                                                                        <div
                                                                            key={
                                                                                row
                                                                            }
                                                                            className="flex gap-1 justify-center items-center mb-2"
                                                                        >
                                                                            {
                                                                                rowSeats
                                                                            }
                                                                        </div>
                                                                    );
                                                                }

                                                                return grid;
                                                            })()}
                                                        </div>
                                                    </TabsContent>
                                                </Tabs>
                                            ) : (
                                                <div className="space-y-2 max-w-xl mx-auto">
                                                    {(() => {
                                                        const bookedSeatNumbers =
                                                            new Set(
                                                                schedule.bookings?.map(
                                                                    (b) =>
                                                                        b.seat
                                                                            ?.seat_number
                                                                ) || []
                                                            );
                                                        const maxRow = Math.max(
                                                            ...seatLayout.seats.map(
                                                                (s: Seat) =>
                                                                    s.row
                                                            ),
                                                            0
                                                        );
                                                        const columns =
                                                            seatLayout.columns;
                                                        const grid: React.ReactElement[] =
                                                            [];

                                                        for (
                                                            let row = 0;
                                                            row <= maxRow;
                                                            row++
                                                        ) {
                                                            const rowSeats: React.ReactElement[] =
                                                                [];

                                                            columns.forEach(
                                                                (
                                                                    columnLabel,
                                                                    colIndex
                                                                ) => {
                                                                    if (
                                                                        columnLabel ===
                                                                        ""
                                                                    ) {
                                                                        // Aisle space
                                                                        rowSeats.push(
                                                                            <div
                                                                                key={`${row}-aisle-${colIndex}`}
                                                                                className="w-8 h-12"
                                                                            />
                                                                        );
                                                                    } else {
                                                                        // Find seat by row and col (not column_label)
                                                                        const seat =
                                                                            seatLayout.seats.find(
                                                                                (
                                                                                    s: Seat
                                                                                ) =>
                                                                                    s.row ===
                                                                                        row &&
                                                                                    s.col ===
                                                                                        colIndex &&
                                                                                    (!s.level ||
                                                                                        s.level ===
                                                                                            "lower")
                                                                            );

                                                                        if (
                                                                            seat &&
                                                                            seat.number !==
                                                                                null
                                                                        ) {
                                                                            const seatNumber = `${seat.number
                                                                                .toString()
                                                                                .padStart(
                                                                                    2,
                                                                                    "0"
                                                                                )}`;
                                                                            const isBooked =
                                                                                bookedSeatNumbers.has(
                                                                                    seatNumber
                                                                                );
                                                                            const booking =
                                                                                schedule.bookings?.find(
                                                                                    (
                                                                                        b
                                                                                    ) =>
                                                                                        b
                                                                                            .seat
                                                                                            ?.seat_number ===
                                                                                        seatNumber
                                                                                );

                                                                            rowSeats.push(
                                                                                <div
                                                                                    key={
                                                                                        seat.id
                                                                                    }
                                                                                    className={`
                                                                                    relative flex items-center justify-center text-xs font-medium
                                                                                    transition-all border-2 w-12 h-12 cursor-pointer rounded-lg
                                                                                    ${
                                                                                        isBooked
                                                                                            ? "bg-gray-200 border-gray-400 text-gray-700"
                                                                                            : "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200"
                                                                                    }
                                                                                `}
                                                                                    title={
                                                                                        isBooked
                                                                                            ? `Seat ${
                                                                                                  seat.number
                                                                                              } - Booked by ${
                                                                                                  booking
                                                                                                      ?.booking
                                                                                                      ?.user
                                                                                                      ?.name ||
                                                                                                  "Unknown"
                                                                                              }`
                                                                                            : `Seat ${seat.number} - Available`
                                                                                    }
                                                                                >
                                                                                    <span className="font-semibold">
                                                                                        {
                                                                                            seat.number
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        } else {
                                                                            // Empty space where no seat exists
                                                                            rowSeats.push(
                                                                                <div
                                                                                    key={`${row}-${colIndex}-empty`}
                                                                                    className="w-12 h-12"
                                                                                />
                                                                            );
                                                                        }
                                                                    }
                                                                }
                                                            );

                                                            grid.push(
                                                                <div
                                                                    key={row}
                                                                    className="flex gap-1 justify-center items-center mb-2"
                                                                >
                                                                    {rowSeats}
                                                                </div>
                                                            );
                                                        }

                                                        return grid;
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Fallback to simple grid if no layout
                                        <div className="grid grid-cols-5 gap-2 p-4 bg-muted/30 rounded-lg">
                                            {(() => {
                                                const bookedSeatNumbers =
                                                    new Set(
                                                        schedule.bookings?.map(
                                                            (b) =>
                                                                b.seat
                                                                    ?.seat_number
                                                        ) || []
                                                    );
                                                const seats = [];

                                                for (
                                                    let i = 1;
                                                    i <= seatCapacity;
                                                    i++
                                                ) {
                                                    const seatNumber = i
                                                        .toString()
                                                        .padStart(2, "0");
                                                    const isBooked =
                                                        bookedSeatNumbers.has(
                                                            seatNumber
                                                        );
                                                    const booking =
                                                        schedule.bookings?.find(
                                                            (b) =>
                                                                b.seat
                                                                    ?.seat_number ===
                                                                seatNumber
                                                        );

                                                    seats.push(
                                                        <div
                                                            key={i}
                                                            className={`
                                                                relative flex items-center justify-center text-xs font-semibold
                                                                transition-all cursor-pointer border-2 rounded-lg w-12 h-12
                                                                ${
                                                                    isBooked
                                                                        ? "bg-gray-200 border-gray-400 text-gray-700 cursor-not-allowed"
                                                                        : "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200"
                                                                }
                                                            `}
                                                            title={
                                                                isBooked
                                                                    ? `Seat ${seatNumber} - Booked by ${
                                                                          booking
                                                                              ?.booking
                                                                              ?.user
                                                                              ?.name ||
                                                                          "Unknown"
                                                                      }`
                                                                    : `Seat ${seatNumber} - Available`
                                                            }
                                                        >
                                                            <span>
                                                                {seatNumber}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return seats;
                                            })()}
                                        </div>
                                    )}

                                    {/* Seat Details */}
                                    {schedule.bookings &&
                                        schedule.bookings.length > 0 && (
                                            <div className="border-t pt-4">
                                                <h4 className="text-sm font-semibold mb-2">
                                                    Booked Seats Details:
                                                </h4>
                                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                                    {schedule.bookings
                                                        .filter((b) => b.seat)
                                                        .sort((a, b) =>
                                                            a.seat.seat_number.localeCompare(
                                                                b.seat
                                                                    .seat_number
                                                            )
                                                        )
                                                        .map((booking) => (
                                                            <div
                                                                key={booking.id}
                                                                className="text-xs flex items-center justify-between py-1 px-2 bg-muted/50 rounded"
                                                            >
                                                                <span className="font-medium">
                                                                    {
                                                                        booking
                                                                            .seat
                                                                            .seat_number
                                                                    }
                                                                </span>
                                                                <span className="text-muted-foreground truncate ml-2">
                                                                    {booking
                                                                        .booking
                                                                        ?.user
                                                                        ?.name ||
                                                                        "Unknown"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                </div>
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
                                                                {booking.booking
                                                                    ?.user
                                                                    ?.name ||
                                                                    "Unknown"}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {booking
                                                                        .booking
                                                                        ?.user
                                                                        ?.email ||
                                                                        "N/A"}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    {booking
                                                                        .booking
                                                                        ?.user
                                                                        ?.phone_number ||
                                                                        "N/A"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {getBookingStatusBadge(
                                                        booking.booking_status
                                                    )}
                                                </div>

                                                {booking.seat && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <p className="text-sm text-muted-foreground">
                                                            Seat:
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {
                                                                booking.seat
                                                                    .seat_number
                                                            }
                                                        </Badge>
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
