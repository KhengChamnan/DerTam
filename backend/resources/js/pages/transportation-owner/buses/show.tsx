import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bus,
    Users,
    Calendar,
    MapPin,
    Edit,
    ArrowLeft,
    Clock,
    Navigation,
    CheckCircle,
    XCircle,
} from "lucide-react";

interface BusSeat {
    id: number;
    seat_number: string;
    bus_id: number;
    created_at: string;
    updated_at: string;
}

interface BusSchedule {
    id: number;
    departure_time: string;
    arrival_time: string;
    status: string;
    base_price: number;
    route?: {
        id: number;
        from_location: string;
        to_location: string;
        distance_km: number;
        duration_hours: number;
    };
    bookings?: Array<{
        id: number;
        status: string;
    }>;
}

interface BusData {
    id: number;
    bus_name: string;
    bus_plate: string;
    description?: string;
    is_available: boolean;
    status: string;
    created_at: string;
    bus_property?: {
        id: number;
        bus_type: string;
        bus_description?: string;
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
    seats?: BusSeat[];
    schedules?: BusSchedule[];
}

interface Props {
    bus: BusData;
}

export default function TransportationOwnerBusShow({ bus }: Props) {
    const images = bus.bus_property?.image_url
        ? (() => {
              try {
                  return JSON.parse(bus.bus_property.image_url);
              } catch {
                  return [];
              }
          })()
        : [];

    const amenities = bus.bus_property?.amenities
        ? (() => {
              try {
                  return JSON.parse(bus.bus_property.amenities);
              } catch {
                  return [];
              }
          })()
        : [];

    const activeSchedules =
        bus.schedules?.filter((s) => s.status === "scheduled") || [];
    const totalBookings =
        bus.schedules?.reduce(
            (sum, schedule) => sum + (schedule.bookings?.length || 0),
            0
        ) || 0;
    const totalSeats = bus.seats?.length || 0;

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: any } = {
            active: "default",
            maintenance: "secondary",
            retired: "outline",
        };
        const colors: { [key: string]: string } = {
            active: "text-white",
            maintenance: "text-white",
            retired: "text-white",
        };
        return (
            <Badge variant={variants[status] || "default"}>
                <span className={colors[status] || ""}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title={`Bus Details - ${bus.bus_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {bus.bus_name}
                        </h1>
                        <p className="text-muted-foreground">{bus.bus_plate}</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/transportation-owner/buses">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Buses
                        </Link>
                    </Button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Bus Details */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Images */}
                        {images.length > 0 && (
                            <Card>
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-2 gap-2 p-4">
                                        {images
                                            .slice(0, 4)
                                            .map((img: string, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className={`${
                                                        idx === 0
                                                            ? "col-span-2 h-64"
                                                            : "h-32"
                                                    } overflow-hidden rounded-lg bg-muted`}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`${bus.bus_name} ${
                                                            idx + 1
                                                        }`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Bus Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Bus Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Bus Type
                                        </p>
                                        <p className="font-semibold">
                                            {bus.bus_property?.bus_type ||
                                                "N/A"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Status
                                        </p>
                                        {getStatusBadge(bus.status)}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Company
                                        </p>
                                        <p className="font-semibold">
                                            {bus.bus_property?.transportation
                                                ?.place?.name || "Unknown"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Seat Capacity
                                        </p>
                                        <p className="font-semibold">
                                            {bus.bus_property?.seat_capacity ||
                                                0}{" "}
                                            seats
                                        </p>
                                    </div>
                                    {bus.bus_property?.price_per_seat && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">
                                                Price per Seat
                                            </p>
                                            <p className="font-semibold">
                                                $
                                                {
                                                    bus.bus_property
                                                        .price_per_seat
                                                }
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Added On
                                        </p>
                                        <p className="font-semibold">
                                            {new Date(
                                                bus.created_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {bus.description && (
                                    <div className="space-y-1 pt-2">
                                        <p className="text-sm text-muted-foreground">
                                            Description
                                        </p>
                                        <p className="font-semibold">
                                            {bus.description}
                                        </p>
                                    </div>
                                )}

                                {amenities.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <p className="text-sm text-muted-foreground">
                                            Amenities
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {amenities.map(
                                                (
                                                    amenity: string,
                                                    idx: number
                                                ) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                    >
                                                        {amenity}
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Schedules */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Schedules</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bus.schedules && bus.schedules.length > 0 ? (
                                    <div className="space-y-3">
                                        {bus.schedules.map((schedule) => (
                                            <div
                                                key={schedule.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Navigation className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-semibold">
                                                            {schedule.route
                                                                ?.from_location ||
                                                                "N/A"}{" "}
                                                            →{" "}
                                                            {schedule.route
                                                                ?.to_location ||
                                                                "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(
                                                                schedule.departure_time
                                                            ).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(
                                                                schedule.departure_time
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </div>
                                                        <span>
                                                            {schedule.bookings
                                                                ?.length ||
                                                                0}{" "}
                                                            bookings
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        schedule.status ===
                                                        "scheduled"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {schedule.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                                        <p className="text-muted-foreground">
                                            No schedules yet
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Stats & Quick Info */}
                    <div className="space-y-4">
                        {/* Statistics Cards */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            Active Schedules
                                        </span>
                                    </div>
                                    <span className="font-bold">
                                        {activeSchedules.length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            Total Bookings
                                        </span>
                                    </div>
                                    <span className="font-bold">
                                        {totalBookings}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            Total Seats
                                        </span>
                                    </div>
                                    <span className="font-bold">
                                        {totalSeats}
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
