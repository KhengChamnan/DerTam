import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    Edit,
    Bus,
    Users,
    Mail,
    Phone,
    Building2,
    Package,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface Owner {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
}

interface Place {
    placeID: number;
    name: string;
    description?: string;
    images_url?: string[];
    provinceCategory?: {
        province_categoryName: string;
    };
}

interface BusItem {
    id: number;
    bus_name: string;
    bus_plate: string;
    seat_capacity: number;
    created_at: string;
}

interface Transportation {
    id: number;
    placeID: number;
    owner_user_id: number;
    place: Place;
    owner: Owner;
    buses: BusItem[];
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_buses: number;
    active_buses: number;
    total_capacity: number;
    total_schedules: number;
    active_schedules: number;
}

interface Props {
    transportation: Transportation;
    stats: Stats;
}

export default function TransportationShow({ transportation, stats }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Transportations",
            href: "/transportations",
        },
        {
            title: transportation.place.name,
            href: `/transportations/${transportation.id}`,
        },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${transportation.place.name} - Transportation Company`}
            />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {transportation.place.images_url &&
                        transportation.place.images_url.length > 0 ? (
                            <img
                                src={transportation.place.images_url[0]}
                                alt={transportation.place.name}
                                className="h-16 w-16 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                                <Building2 className="h-8 w-8 text-primary" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">
                                {transportation.place.name}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                {transportation.place.provinceCategory && (
                                    <>
                                        <span>
                                            {
                                                transportation.place
                                                    .provinceCategory
                                                    .province_categoryName
                                            }
                                        </span>
                                        <span>•</span>
                                    </>
                                )}
                                <span>
                                    {stats.total_buses}{" "}
                                    {stats.total_buses === 1 ? "bus" : "buses"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/transportations/${transportation.id}/edit`}
                        >
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Company
                            </Button>
                        </Link>
                        <Link href="/transportations">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Company Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {transportation.place.description && (
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Description
                                        </h4>
                                        <p className="text-sm">
                                            {transportation.place.description}
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Company ID
                                        </h4>
                                        <p className="font-medium">
                                            #{transportation.id}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Place ID
                                        </h4>
                                        <p className="font-medium">
                                            #{transportation.placeID}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Total Buses
                                        </h4>
                                        <p className="font-medium flex items-center gap-2">
                                            <Bus className="h-4 w-4" />
                                            {stats.total_buses}{" "}
                                            {stats.total_buses === 1
                                                ? "bus"
                                                : "buses"}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Total Capacity
                                        </h4>
                                        <p className="font-medium flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {stats.total_capacity} seats
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fleet (Buses) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Fleet ({transportation.buses.length}{" "}
                                    {transportation.buses.length === 1
                                        ? "Bus"
                                        : "Buses"}
                                    )
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {transportation.buses.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Bus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No buses available yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {transportation.buses.map((bus) => (
                                            <div
                                                key={bus.id}
                                                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                            <Bus className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">
                                                                {bus.bus_name}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="font-mono text-xs"
                                                                >
                                                                    {
                                                                        bus.bus_plate
                                                                    }
                                                                </Badge>
                                                                <span>•</span>
                                                                <span>
                                                                    {
                                                                        bus.seat_capacity
                                                                    }{" "}
                                                                    seats
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        Added{" "}
                                                        {formatDate(
                                                            bus.created_at
                                                        )}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Owner Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Transportation Owner</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Name
                                    </h4>
                                    <p className="font-medium">
                                        {transportation.owner.name}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Email
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={`mailto:${transportation.owner.email}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {transportation.owner.email}
                                        </a>
                                    </div>
                                </div>
                                {transportation.owner.phone_number && (
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Phone
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`tel:${transportation.owner.phone_number}`}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {
                                                    transportation.owner
                                                        .phone_number
                                                }
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Total Buses
                                    </h4>
                                    <p className="text-2xl font-bold">
                                        {stats.total_buses}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Active Buses
                                        </h4>
                                        <p className="text-xl font-semibold text-green-600">
                                            {stats.active_buses}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Total Capacity
                                        </h4>
                                        <p className="text-xl font-semibold text-blue-600">
                                            {stats.total_capacity}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Total Schedules
                                    </h4>
                                    <p className="text-2xl font-bold">
                                        {stats.total_schedules}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Active Schedules
                                    </h4>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats.active_schedules}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timestamps */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Record Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Created
                                    </h4>
                                    <p>
                                        {formatDate(transportation.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Last Updated
                                    </h4>
                                    <p>
                                        {formatDate(transportation.updated_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
