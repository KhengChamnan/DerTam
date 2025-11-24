import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from "@/components/ui/empty";
import { Building2, Bus, Calendar, Star, Users, Edit } from "lucide-react";

interface Company {
    id: number;
    created_at: string;
    place?: {
        placeID: number;
        name: string;
        description?: string;
        ratings?: number;
        reviews_count?: number;
        images_url?: string[];
    };
    bus_properties?: Array<{
        id: number;
        bus_type: string;
        bus_description?: string;
        seat_capacity: number;
        price_per_seat?: number;
        image_url?: string;
        amenities?: string;
        buses?: Array<{
            id: number;
            bus_name: string;
            bus_plate: string;
            is_active: boolean;
            schedules?: Array<{
                id: number;
                departure_time: string;
                status: string;
            }>;
        }>;
    }>;
}

interface Props {
    company?: Company;
}

export default function TransportationOwnerCompaniesIndex({ company }: Props) {
    if (!company) {
        return (
            <AppLayout>
                <Head title="My Company" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Building2 className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No Company Assigned</EmptyTitle>
                            <EmptyDescription>
                                You don't have a transportation company assigned
                                to your account yet. Contact your administrator
                                to get a transportation company assigned to your
                                account.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            </AppLayout>
        );
    }

    const busProperties = company.bus_properties || [];
    const images = company.place?.images_url || [];

    // Flatten buses from all bus properties
    const allBuses = busProperties.flatMap((bp) => bp.buses || []);

    const activeBuses = allBuses.filter((bus) => bus.is_active);
    const totalSeats = busProperties.reduce(
        (sum, bp) => sum + bp.seat_capacity * (bp.buses?.length || 0),
        0
    );
    const totalSchedules = allBuses.reduce(
        (sum, bus) => sum + (bus.schedules?.length || 0),
        0
    );
    const busTypes = busProperties.map((bp) => bp.bus_type);

    return (
        <AppLayout>
            <Head title={`${company.place?.name || "My Company"}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {company.place?.name || "My Transportation Company"}
                        </h1>
                        <p className="text-muted-foreground">
                            Manage and monitor your transportation company
                        </p>
                    </div>
                    <Badge variant="outline" className="h-fit">
                        <Building2 className="h-4 w-4 mr-2" />
                        Transportation
                    </Badge>
                </div>

                {/* Company Info Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Image */}
                            {images.length > 0 && (
                                <div className="relative h-64 rounded-lg overflow-hidden">
                                    <img
                                        src={images[0]}
                                        alt={company.place?.name || "Company"}
                                        className="w-full h-full object-cover"
                                    />
                                    {images.length > 1 && (
                                        <Badge className="absolute bottom-2 right-2">
                                            +{images.length - 1} more photos
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Details */}
                            <div className="space-y-4">
                                {/* Rating */}
                                {company.place?.ratings && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xl font-semibold">
                                                {company.place.ratings}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground">
                                            ({company.place.reviews_count || 0}{" "}
                                            reviews)
                                        </span>
                                    </div>
                                )}

                                {/* Description */}
                                <p className="text-muted-foreground">
                                    {company.place?.description ||
                                        "No description available"}
                                </p>

                                {/* Fleet Composition */}
                                {busTypes.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">
                                            Bus Types Available
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {busTypes.map((type, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                >
                                                    {type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Bus Types
                            </CardTitle>
                            <Bus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {busProperties.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Templates configured
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Buses
                            </CardTitle>
                            <Bus className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {allBuses.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Fleet vehicles
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Capacity
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalSeats}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Passenger seats
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Schedules
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalSchedules}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total routes
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bus Types Section */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Bus Types</h2>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/transportation-owner/bus-properties/create">
                                <Bus className="h-4 w-4 mr-2" />
                                Add Bus Type
                            </Link>
                        </Button>
                    </div>
                </div>

                {busProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {busProperties.map((busProperty) => {
                            const buses = busProperty.buses || [];
                            const activeBusesForType = buses.filter(
                                (b) => b.is_active
                            );

                            return (
                                <Card
                                    key={busProperty.id}
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    {/* Image Display */}
                                    {busProperty.image_url &&
                                        (() => {
                                            try {
                                                const images = JSON.parse(
                                                    busProperty.image_url
                                                );
                                                return images.length > 0 ? (
                                                    <div className="h-48 overflow-hidden bg-muted">
                                                        <img
                                                            src={images[0]}
                                                            alt={
                                                                busProperty.bus_type
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : null;
                                            } catch (e) {
                                                return null;
                                            }
                                        })()}

                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1">
                                                <CardTitle className="text-lg">
                                                    {busProperty.bus_type}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {busProperty.seat_capacity}{" "}
                                                    seats per bus
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                Template
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Total Buses
                                                </p>
                                                <p className="font-semibold">
                                                    {buses.length}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Active
                                                </p>
                                                <p className="font-semibold text-green-600">
                                                    {activeBusesForType.length}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Capacity
                                                </p>
                                                <p className="font-semibold">
                                                    {busProperty.seat_capacity}{" "}
                                                    seats
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Total Seats
                                                </p>
                                                <p className="font-semibold">
                                                    {busProperty.seat_capacity *
                                                        buses.length}
                                                </p>
                                            </div>
                                            {busProperty.price_per_seat && (
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        Price per seat
                                                    </p>
                                                    <p className="font-semibold">
                                                        $
                                                        {
                                                            busProperty.price_per_seat
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {busProperty.amenities && (
                                            <div className="flex flex-wrap gap-1 pt-2">
                                                {JSON.parse(
                                                    busProperty.amenities
                                                ).map(
                                                    (
                                                        amenity: string,
                                                        idx: number
                                                    ) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {amenity}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2 border-t mt-2">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <Link
                                                    href={`/transportation-owner/bus-properties/${busProperty.id}/edit`}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Type
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                size="sm"
                                                className="flex-1"
                                            >
                                                <Link
                                                    href={`/transportation-owner/buses/create?type=${busProperty.id}`}
                                                >
                                                    <Bus className="h-4 w-4 mr-2" />
                                                    Add Bus
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Bus className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No Bus Types Yet</EmptyTitle>
                            <EmptyDescription>
                                Start by adding bus types to your fleet.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button asChild>
                                <Link href="/transportation-owner/bus-properties/create">
                                    <Bus className="h-4 w-4 mr-2" />
                                    Add Your First Bus Type
                                </Link>
                            </Button>
                        </EmptyContent>
                    </Empty>
                )}
            </div>
        </AppLayout>
    );
}
