import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Calendar,
    Clock,
    Eye,
    Settings2,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Pencil,
    Trash2,
    Bus,
    MapPin,
    Users,
    MoreHorizontal,
} from "lucide-react";
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

interface BusSchedule {
    id: number;
    departure_time: string;
    arrival_time: string;
    price: number;
    status: "scheduled" | "departed" | "arrived" | "cancelled";
    available_seats: number;
    created_at: string;
    bus: {
        id: number;
        bus_name: string;
        bus_plate: string;
        seat_capacity: number;
        transportation: {
            id: number;
            place?: {
                placeID: number;
                name: string;
            };
        };
    };
    route: {
        id: number;
        origin: string;
        destination: string;
        distance?: number;
        duration?: number;
    };
    bookings?: Array<{
        id: number;
        passenger_name: string;
        booking_status: string;
    }>;
}

interface PaginatedSchedules {
    data: BusSchedule[];
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

interface ColumnVisibility {
    bus: boolean;
    route: boolean;
    departureTime: boolean;
    arrivalTime: boolean;
    price: boolean;
    availability: boolean;
}

interface Props {
    schedules?: PaginatedSchedules;
}

export default function TransportationOwnerSchedulesIndex({
    schedules = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        links: [],
    },
}: Props) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Column visibility state with localStorage persistence
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
        () => {
            const savedPreferences = localStorage.getItem(
                "transportationSchedulesTableColumnVisibility"
            );
            if (savedPreferences) {
                try {
                    return JSON.parse(savedPreferences);
                } catch (e) {
                    console.error(
                        "Failed to parse column visibility preferences:",
                        e
                    );
                }
            }
            return {
                bus: true,
                route: true,
                departureTime: true,
                arrivalTime: true,
                price: true,
                availability: true,
            };
        }
    );

    // Save column visibility preferences
    useEffect(() => {
        localStorage.setItem(
            "transportationSchedulesTableColumnVisibility",
            JSON.stringify(columnVisibility)
        );
    }, [columnVisibility]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "scheduled":
                return <Badge variant="default">Scheduled</Badge>;
            case "departed":
                return <Badge variant="secondary">Departed</Badge>;
            case "arrived":
                return <Badge variant="outline">Arrived</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getAvailabilityBadge = (
        availableSeats: number,
        totalSeats: number
    ) => {
        const percentage = (availableSeats / totalSeats) * 100;
        if (percentage >= 50) {
            return (
                <Badge variant="default">
                    {availableSeats}/{totalSeats} Available
                </Badge>
            );
        } else if (percentage > 0) {
            return (
                <Badge variant="secondary">
                    {availableSeats}/{totalSeats} Available
                </Badge>
            );
        } else {
            return <Badge variant="destructive">Fully Booked</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Bus Schedules" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Bus Schedules
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your bus schedules and routes
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/transportation-owner/schedules/create">
                            <Calendar className="mr-2 h-4 w-4" />
                            Add Schedule
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search schedules..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="departed">Departed</SelectItem>
                            <SelectItem value="arrived">Arrived</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Column Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                            >
                                <Settings2 className="h-4 w-4" />
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.bus}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        bus: !!value,
                                    }))
                                }
                            >
                                Bus
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.route}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        route: !!value,
                                    }))
                                }
                            >
                                Route
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.departureTime}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        departureTime: !!value,
                                    }))
                                }
                            >
                                Departure Time
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.arrivalTime}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        arrivalTime: !!value,
                                    }))
                                }
                            >
                                Arrival Time
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.price}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        price: !!value,
                                    }))
                                }
                            >
                                Price
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.availability}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        availability: !!value,
                                    }))
                                }
                            >
                                Availability
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table-like layout */}
                <div className="rounded-md border overflow-x-auto">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="border-b bg-muted/50 p-4">
                            <div
                                className="grid gap-4 items-center"
                                style={{
                                    gridTemplateColumns: `${
                                        columnVisibility.bus ? "2fr" : ""
                                    } ${columnVisibility.route ? "2fr" : ""} ${
                                        columnVisibility.departureTime
                                            ? "1.5fr"
                                            : ""
                                    } ${
                                        columnVisibility.arrivalTime
                                            ? "1.5fr"
                                            : ""
                                    } ${columnVisibility.price ? "1fr" : ""} ${
                                        columnVisibility.availability
                                            ? "2fr"
                                            : ""
                                    } 1.5fr 1.5fr`.trim(),
                                }}
                            >
                                {columnVisibility.bus && (
                                    <div className="text-sm font-medium">
                                        Bus
                                    </div>
                                )}
                                {columnVisibility.route && (
                                    <div className="text-sm font-medium">
                                        Route
                                    </div>
                                )}
                                {columnVisibility.departureTime && (
                                    <div className="text-sm font-medium">
                                        Departure
                                    </div>
                                )}
                                {columnVisibility.arrivalTime && (
                                    <div className="text-sm font-medium">
                                        Arrival
                                    </div>
                                )}
                                {columnVisibility.price && (
                                    <div className="text-sm font-medium">
                                        Price
                                    </div>
                                )}
                                {columnVisibility.availability && (
                                    <div className="text-sm font-medium">
                                        Availability
                                    </div>
                                )}
                                <div className="text-sm font-medium">
                                    Status
                                </div>
                                <div className="text-sm font-medium">
                                    Actions
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y">
                            {schedules.data.map((schedule) => {
                                const bookedSeats =
                                    schedule.bookings?.length || 0;
                                const availableSeats =
                                    schedule.bus.seat_capacity - bookedSeats;

                                return (
                                    <div
                                        key={schedule.id}
                                        className="p-4 hover:bg-muted/50"
                                    >
                                        <div
                                            className="grid gap-4 items-center"
                                            style={{
                                                gridTemplateColumns: `${
                                                    columnVisibility.bus
                                                        ? "2fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.route
                                                        ? "2fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.departureTime
                                                        ? "1.5fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.arrivalTime
                                                        ? "1.5fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.price
                                                        ? "1fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.availability
                                                        ? "2fr"
                                                        : ""
                                                } 1.5fr 1.5fr`.trim(),
                                            }}
                                        >
                                            {columnVisibility.bus && (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">
                                                        {schedule.bus.bus_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {schedule.bus.bus_plate}
                                                    </span>
                                                </div>
                                            )}
                                            {columnVisibility.route && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                    <span className="truncate">
                                                        {schedule.route.origin}{" "}
                                                        →{" "}
                                                        {
                                                            schedule.route
                                                                .destination
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {columnVisibility.departureTime && (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        {new Date(
                                                            schedule.departure_time
                                                        ).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                                                </div>
                                            )}
                                            {columnVisibility.arrivalTime && (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        {new Date(
                                                            schedule.arrival_time
                                                        ).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(
                                                            schedule.arrival_time
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {columnVisibility.price && (
                                                <div className="font-semibold">
                                                    $
                                                    {schedule.price.toLocaleString()}
                                                </div>
                                            )}
                                            {columnVisibility.availability && (
                                                <div className="flex items-center gap-2">
                                                    {getAvailabilityBadge(
                                                        availableSeats,
                                                        schedule.bus
                                                            .seat_capacity
                                                    )}
                                                </div>
                                            )}
                                            <div>
                                                {getStatusBadge(
                                                    schedule.status
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/transportation-owner/schedules/${schedule.id}/edit`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/transportation-owner/schedules/${schedule.id}`}
                                                            >
                                                                View details
                                                                <Eye className="ml-2 h-4 w-4" />
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/transportation-owner/schedules/${schedule.id}/edit`}
                                                            >
                                                                Edit schedule
                                                                <Pencil className="ml-5 h-4 w-4" />
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <DropdownMenuItem
                                                                    onSelect={(
                                                                        e
                                                                    ) =>
                                                                        e.preventDefault()
                                                                    }
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    Delete
                                                                    schedule
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Are you
                                                                        absolutely
                                                                        sure?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This
                                                                        action
                                                                        cannot
                                                                        be
                                                                        undone.
                                                                        This
                                                                        will
                                                                        permanently
                                                                        delete
                                                                        the
                                                                        schedule
                                                                        and
                                                                        remove
                                                                        all its
                                                                        data
                                                                        from our
                                                                        servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            router.delete(
                                                                                `/transportation-owner/schedules/${schedule.id}`
                                                                            )
                                                                        }
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {schedules.data.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">
                                No Schedules Found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                You don't have any schedules for your buses yet.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Schedules will appear here once they are created
                                for your buses.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing{" "}
                        {(schedules.current_page - 1) * schedules.per_page + 1}{" "}
                        to{" "}
                        {Math.min(
                            schedules.current_page * schedules.per_page,
                            schedules.total
                        )}{" "}
                        of {schedules.total} schedule(s).
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(schedules.per_page)}
                                onValueChange={(value) => {
                                    router.get(
                                        "/transportation-owner/schedules",
                                        {
                                            per_page: value,
                                            page: 1,
                                        }
                                    );
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={String(schedules.per_page)}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
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
                            Page {schedules.current_page} of{" "}
                            {schedules.last_page}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get(
                                        "/transportation-owner/schedules",
                                        {
                                            page: 1,
                                        }
                                    )
                                }
                                disabled={schedules.current_page === 1}
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
                                    router.get(
                                        "/transportation-owner/schedules",
                                        {
                                            page: schedules.current_page - 1,
                                        }
                                    )
                                }
                                disabled={schedules.current_page === 1}
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
                                    router.get(
                                        "/transportation-owner/schedules",
                                        {
                                            page: schedules.current_page + 1,
                                        }
                                    )
                                }
                                disabled={
                                    schedules.current_page ===
                                    schedules.last_page
                                }
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronLeft className="h-4 w-4 rotate-180" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get(
                                        "/transportation-owner/schedules",
                                        {
                                            page: schedules.last_page,
                                        }
                                    )
                                }
                                disabled={
                                    schedules.current_page ===
                                    schedules.last_page
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
