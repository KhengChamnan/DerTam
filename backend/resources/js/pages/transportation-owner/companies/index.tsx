import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    buses?: Array<{
        id: number;
        bus_name: string;
        bus_plate: string;
        seat_capacity: number;
        bus_type: string;
        is_active: boolean;
        schedules?: Array<{
            id: number;
            departure_time: string;
            status: string;
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
                    <Card>
                        <CardContent className="text-center py-12">
                            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">
                                No Company Assigned
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                You don't have a transportation company assigned
                                to your account yet.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Contact your administrator to get a
                                transportation company assigned to your account.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const buses = company.buses || [];
    const images = company.place?.images_url || [];

    const activeBuses = buses.filter((bus) => bus.is_active);
    const totalSeats = buses.reduce(
        (sum, bus) => sum + (bus.seat_capacity || 0),
        0
    );
    const totalSchedules = buses.reduce(
        (sum, bus) => sum + (bus.schedules?.length || 0),
        0
    );
    const busTypes = Array.from(new Set(buses.map((b) => b.bus_type)));

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
                                            Fleet Composition
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {busTypes.map((type) => {
                                                const count = buses.filter(
                                                    (b) => b.bus_type === type
                                                ).length;
                                                return (
                                                    <Badge
                                                        key={type}
                                                        variant="secondary"
                                                    >
                                                        {count}x {type}
                                                    </Badge>
                                                );
                                            })}
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
                                Total Buses
                            </CardTitle>
                            <Bus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {buses.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Fleet vehicles
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Buses
                            </CardTitle>
                            <Bus className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {activeBuses.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently operational
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

                {/* Buses Section */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Fleet Management</h2>
                    <Button asChild>
                        <Link href="/transportation-owner/buses/create">
                            <Bus className="h-4 w-4 mr-2" />
                            Add New Bus
                        </Link>
                    </Button>
                </div>

                {buses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {buses.map((bus) => {
                            const busSchedules = bus.schedules || [];
                            const activeSchedules = busSchedules.filter(
                                (s) => s.status === "scheduled"
                            );

                            return (
                                <Card
                                    key={bus.id}
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1">
                                                <CardTitle className="text-lg">
                                                    {bus.bus_name}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {bus.bus_plate}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    bus.is_active
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {bus.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Type
                                                </p>
                                                <p className="font-semibold capitalize">
                                                    {bus.bus_type}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Capacity
                                                </p>
                                                <p className="font-semibold">
                                                    {bus.seat_capacity} seats
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Schedules
                                                </p>
                                                <p className="font-semibold">
                                                    {busSchedules.length}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Active
                                                </p>
                                                <p className="font-semibold">
                                                    {activeSchedules.length}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2 border-t">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <Link
                                                    href={`/transportation-owner/buses/${bus.id}/edit`}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Bus
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Bus className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">
                                No Buses Yet
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Start by adding buses to your fleet.
                            </p>
                            <Button asChild>
                                <Link href="/transportation-owner/buses/create">
                                    <Bus className="h-4 w-4 mr-2" />
                                    Add Your First Bus
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
