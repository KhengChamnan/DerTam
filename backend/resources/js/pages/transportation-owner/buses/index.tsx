import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@/components/ui/empty";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bus,
    Users,
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MapPin,
} from "lucide-react";

interface BusSchedule {
    id: number;
    departure_time: string;
    arrival_time: string;
    status: string;
}

interface BusData {
    id: number;
    bus_name: string;
    bus_plate: string;
    is_available: boolean;
    status: string;
    created_at: string;
    bus_property?: {
        id: number;
        bus_type: string;
        seat_capacity: number;
        image_url?: string;
        transportation?: {
            id: number;
            place?: {
                placeID: number;
                name: string;
            };
        };
    };
    schedules?: BusSchedule[];
}

interface PaginatedBuses {
    data: BusData[];
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
    buses?: PaginatedBuses;
}

export default function TransportationOwnerBusesIndex({
    buses = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
        links: [],
    },
}: Props) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Client-side filtering for instant results
    const filteredBuses = buses.data.filter((bus) => {
        // Search filter
        const searchLower = search.toLowerCase();
        const matchesSearch =
            search === "" ||
            bus.bus_name.toLowerCase().includes(searchLower) ||
            bus.bus_plate.toLowerCase().includes(searchLower) ||
            bus.bus_property?.bus_type.toLowerCase().includes(searchLower) ||
            bus.bus_property?.transportation?.place?.name
                ?.toLowerCase()
                .includes(searchLower);

        // Type filter
        const matchesType =
            typeFilter === "all" ||
            bus.bus_property?.bus_type.toLowerCase() ===
                typeFilter.toLowerCase();

        // Status filter
        const matchesStatus =
            statusFilter === "all" || bus.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    const getBusTypeBadge = (type: string) => {
        const badgeColors: { [key: string]: string } = {
            standard: "default",
            luxury: "secondary",
            sleeper: "outline",
            vip: "destructive",
        };
        return (
            <Badge variant={badgeColors[type.toLowerCase()] as any}>
                {type}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: any } = {
            active: "default",
            maintenance: "secondary",
            retired: "outline",
        };
        return (
            <Badge variant={variants[status] || "default"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Buses" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Buses
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your bus fleet
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/transportation-owner/buses/create">
                            <Bus className="mr-2 h-4 w-4" />
                            Add Bus
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search buses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Bus Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="luxury">Luxury</SelectItem>
                            <SelectItem value="sleeper">Sleeper</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Bus Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBuses.map((bus) => (
                        <Card
                            key={bus.id}
                            className="hover:shadow-lg transition-shadow overflow-hidden"
                        >
                            {/* Image Display */}
                            {bus.bus_property?.image_url &&
                                (() => {
                                    try {
                                        const images = JSON.parse(
                                            bus.bus_property.image_url
                                        );
                                        return images.length > 0 ? (
                                            <div className="h-48 overflow-hidden bg-muted">
                                                <img
                                                    src={images[0]}
                                                    alt={bus.bus_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : null;
                                    } catch (e) {
                                        return null;
                                    }
                                })()}

                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        {bus.bus_name}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {bus.bus_plate}
                                    </p>
                                </div>
                                <Bus className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    {bus.bus_property &&
                                        getBusTypeBadge(
                                            bus.bus_property.bus_type
                                        )}
                                    {getStatusBadge(bus.status)}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {bus.bus_property?.transportation
                                                ?.place?.name ||
                                                "Unknown Company"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {bus.bus_property?.seat_capacity ||
                                                0}{" "}
                                            seats
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {bus.schedules?.length || 0} active
                                            schedules
                                        </span>
                                    </div>
                                </div>

                                {/* Recent Schedules Preview */}
                                {bus.schedules && bus.schedules.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-xs font-medium mb-2">
                                            Recent Schedules:
                                        </p>
                                        <div className="space-y-1">
                                            {bus.schedules
                                                .slice(0, 2)
                                                .map((schedule) => (
                                                    <div
                                                        key={schedule.id}
                                                        className="text-xs text-muted-foreground flex items-center gap-1"
                                                    >
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            schedule.departure_time
                                                        ).toLocaleDateString()}
                                                        {" - "}
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
                                                ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Link
                                            href={`/transportation-owner/buses/${bus.id}/edit`}
                                        >
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="default"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Link
                                            href={`/transportation-owner/buses/${bus.id}`}
                                        >
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredBuses.length === 0 && (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Bus className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>
                                {buses.data.length === 0
                                    ? "No Buses Found"
                                    : "No Matching Buses"}
                            </EmptyTitle>
                            <EmptyDescription>
                                {buses.data.length === 0 ? (
                                    <>
                                        You don't have any buses in your fleet
                                        yet. Contact your administrator to add
                                        buses to your company.
                                    </>
                                ) : (
                                    "No buses match your current filters. Try adjusting your search or filters."
                                )}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {filteredBuses.length > 0 ? (
                            <>
                                Showing {filteredBuses.length} of {buses.total}{" "}
                                bus(es)
                                {(search ||
                                    typeFilter !== "all" ||
                                    statusFilter !== "all") &&
                                    " (filtered)"}
                            </>
                        ) : (
                            "No buses to display"
                        )}
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">
                                Buses per page
                            </p>
                            <Select
                                value={String(buses.per_page)}
                                onValueChange={(value) => {
                                    router.get("/transportation-owner/buses", {
                                        per_page: value,
                                        page: 1,
                                    });
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={String(buses.per_page)}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[12, 24, 36, 48].map((pageSize) => (
                                        <SelectItem
                                            key={pageSize}
                                            value={String(pageSize)}
                                        >
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {buses.current_page} of {buses.last_page}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get("/transportation-owner/buses", {
                                        page: 1,
                                    })
                                }
                                disabled={buses.current_page === 1}
                            >
                                <span className="sr-only">
                                    Go to first page
                                </span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    router.get("/transportation-owner/buses", {
                                        page: buses.current_page - 1,
                                    })
                                }
                                disabled={buses.current_page === 1}
                            >
                                <span className="sr-only">
                                    Go to previous page
                                </span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    router.get("/transportation-owner/buses", {
                                        page: buses.current_page + 1,
                                    })
                                }
                                disabled={
                                    buses.current_page === buses.last_page
                                }
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronLeft className="h-4 w-4 rotate-180" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get("/transportation-owner/buses", {
                                        page: buses.last_page,
                                    })
                                }
                                disabled={
                                    buses.current_page === buses.last_page
                                }
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
