import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { type BreadcrumbItem } from "@/types";
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
import { toast } from "sonner";

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
        from_location: string;
        to_location: string;
        distance_km?: number;
        duration_hours?: number;
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/transportation-owner/dashboard",
    },
    {
        title: "Schedules",
        href: "/transportation-owner/schedules",
    },
];

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
    const [isLoading, setIsLoading] = useState(false);
    const [isAutoUpdating, setIsAutoUpdating] = useState(false);

    // Client-side pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);

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

    // Filter schedules in real-time on the client side
    const filteredSchedules = schedules.data.filter((schedule) => {
        // Status filter
        if (statusFilter !== "all" && schedule.status !== statusFilter) {
            return false;
        }

        // Search filter - only match bus name with prefix
        if (search.trim() !== "") {
            const searchLower = search.toLowerCase();
            const matchesBusName = schedule.bus.bus_name
                .toLowerCase()
                .startsWith(searchLower);

            if (!matchesBusName) {
                return false;
            }
        }

        return true;
    });

    // Client-side pagination calculations
    const totalFiltered = filteredSchedules.length;
    const lastPage = Math.ceil(totalFiltered / perPage);
    const from = totalFiltered === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalFiltered);

    // Paginated data for current page
    const paginatedSchedules = filteredSchedules.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    // Helper function to determine what status a schedule should have based on time
    const getExpectedStatus = (schedule: BusSchedule): string => {
        if (schedule.status === "cancelled") return "cancelled";

        const now = new Date();
        const departureTime = parseAsLocalTime(schedule.departure_time);
        const arrivalTime = parseAsLocalTime(schedule.arrival_time);

        if (now >= arrivalTime) {
            return "arrived";
        } else if (now >= departureTime) {
            return "departed";
        } else {
            return "scheduled";
        }
    };

    const getStatusBadge = (status: string, isOutdated: boolean = false) => {
        switch (status) {
            case "scheduled":
                return (
                    <Badge
                        variant={isOutdated ? "secondary" : "default"}
                        className={
                            isOutdated
                                ? "animate-pulse bg-orange-500 hover:bg-orange-600 text-white border-orange-600"
                                : ""
                        }
                    >
                        Scheduled {isOutdated && "⚠️"}
                    </Badge>
                );
            case "departed":
                return (
                    <Badge
                        variant="secondary"
                        className={
                            isOutdated
                                ? "animate-pulse bg-orange-500 hover:bg-orange-600 text-white border-orange-600"
                                : ""
                        }
                    >
                        Departed {isOutdated && "⚠️"}
                    </Badge>
                );
            case "arrived":
                return <Badge variant="outline">Arrived</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Function to check if status change is allowed based on time
    const canChangeToStatus = (
        schedule: BusSchedule,
        newStatus: string
    ): { allowed: boolean; message?: string } => {
        const now = new Date();
        const departureTime = parseAsLocalTime(schedule.departure_time);
        const arrivalTime = parseAsLocalTime(schedule.arrival_time);

        switch (newStatus) {
            case "departed":
                // Can only depart if current time is close to or past departure time (within 1 hour before)
                const oneHourBeforeDeparture = new Date(
                    departureTime.getTime() - 60 * 60 * 1000
                );
                if (now < oneHourBeforeDeparture) {
                    return {
                        allowed: false,
                        message: `Cannot depart yet. Departure is scheduled for ${departureTime.toLocaleString()}`,
                    };
                }
                if (
                    schedule.status === "arrived" ||
                    schedule.status === "cancelled"
                ) {
                    return {
                        allowed: false,
                        message: `Cannot change status from ${schedule.status} to departed`,
                    };
                }
                return { allowed: true };

            case "arrived":
                // Can only mark as arrived if current time is past arrival time
                // For auto-update, we allow scheduled -> arrived if past arrival time
                if (schedule.status === "cancelled") {
                    return {
                        allowed: false,
                        message: "Cannot mark cancelled schedule as arrived",
                    };
                }
                if (now < arrivalTime) {
                    return {
                        allowed: false,
                        message: "Cannot mark as arrived before arrival time",
                    };
                }
                return { allowed: true };

            case "cancelled":
                // Can cancel if not yet arrived
                if (schedule.status === "arrived") {
                    return {
                        allowed: false,
                        message: "Cannot cancel an already arrived schedule",
                    };
                }
                return { allowed: true };

            case "scheduled":
                // Can reschedule if not yet departed or arrived
                if (
                    schedule.status === "departed" ||
                    schedule.status === "arrived"
                ) {
                    return {
                        allowed: false,
                        message: `Cannot change back to scheduled from ${schedule.status}`,
                    };
                }
                return { allowed: true };

            default:
                return { allowed: false, message: "Invalid status" };
        }
    };

    // Function to handle status change
    const handleStatusChange = (
        scheduleId: number,
        schedule: BusSchedule,
        newStatus: string
    ) => {
        const validation = canChangeToStatus(schedule, newStatus);

        if (!validation.allowed) {
            toast.error(validation.message || "Cannot change status");
            return;
        }

        router.put(
            `/transportation-owner/schedules/${scheduleId}`,
            { status: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                only: ["schedules"],
                onSuccess: () => {
                    toast.success(`Status updated to ${newStatus}`);
                },
                onError: (errors) => {
                    toast.error("Failed to update status");
                },
            }
        );
    };

    // Function to automatically update outdated statuses
    const autoUpdateOutdatedStatuses = () => {
        if (isAutoUpdating) return;

        const outdatedSchedules = schedules.data.filter((schedule) => {
            const expectedStatus = getExpectedStatus(schedule);
            return (
                expectedStatus !== schedule.status &&
                schedule.status !== "cancelled"
            );
        });

        if (outdatedSchedules.length > 0) {
            setIsAutoUpdating(true);

            // Sort schedules to update in logical order: scheduled->departed->arrived
            const sortedSchedules = outdatedSchedules.sort((a, b) => {
                const statusOrder: Record<string, number> = {
                    scheduled: 1,
                    departed: 2,
                    arrived: 3,
                };
                const aExpected = getExpectedStatus(a);
                const bExpected = getExpectedStatus(b);
                return (
                    (statusOrder[aExpected] || 0) -
                    (statusOrder[bExpected] || 0)
                );
            });

            // Update all outdated schedules one at a time to prevent race conditions
            let completed = 0;
            sortedSchedules.forEach((schedule, index) => {
                const expectedStatus = getExpectedStatus(schedule);
                const validation = canChangeToStatus(schedule, expectedStatus);

                if (validation.allowed) {
                    setTimeout(() => {
                        router.put(
                            `/transportation-owner/schedules/${schedule.id}`,
                            { status: expectedStatus },
                            {
                                preserveScroll: true,
                                preserveState: true,
                                only: ["schedules"],
                                onFinish: () => {
                                    completed++;
                                    if (completed === sortedSchedules.length) {
                                        setIsAutoUpdating(false);
                                        if (
                                            index ===
                                            sortedSchedules.length - 1
                                        ) {
                                            toast.success(
                                                `Auto-updated ${sortedSchedules.length} schedule(s)`
                                            );
                                        }
                                    }
                                },
                            }
                        );
                    }, index * 200); // Stagger updates by 200ms to ensure order
                } else {
                    // If validation fails, still count it as completed to avoid hanging
                    completed++;
                    if (completed === sortedSchedules.length) {
                        setIsAutoUpdating(false);
                    }
                }
            });
        }
    };

    // Auto-update on mount
    useEffect(() => {
        if (!isAutoUpdating) {
            const timer = setTimeout(() => {
                autoUpdateOutdatedStatuses();
            }, 2000); // Delay to avoid immediate update on page load

            return () => clearTimeout(timer);
        }
    }, []); // Only run once on mount

    // Periodic check every 30 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isAutoUpdating) {
                autoUpdateOutdatedStatuses();
            }
        }, 1800000); // Check every 30 minutes

        return () => clearInterval(interval);
    }, [isAutoUpdating]); // Remove schedules.data from dependencies

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
        <AppLayout breadcrumbs={breadcrumbs}>
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
                    <div className="min-w-[1600px]">
                        {/* Table Header */}
                        <div className="border-b bg-muted/50 p-4">
                            <div
                                className="grid gap-8 items-center "
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
                            {isLoading
                                ? // Skeleton loading state
                                  Array.from({ length: 5 }).map((_, index) => (
                                      <div key={index} className="p-4">
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
                                                  <div className="space-y-1">
                                                      <Skeleton className="h-4 w-24" />
                                                      <Skeleton className="h-3 w-20" />
                                                  </div>
                                              )}
                                              {columnVisibility.route && (
                                                  <div className="flex items-center gap-2">
                                                      <Skeleton className="h-4 w-20" />
                                                      <Skeleton className="h-4 w-4" />
                                                      <Skeleton className="h-4 w-20" />
                                                  </div>
                                              )}
                                              {columnVisibility.departureTime && (
                                                  <div className="space-y-1">
                                                      <Skeleton className="h-4 w-20" />
                                                      <Skeleton className="h-3 w-16" />
                                                  </div>
                                              )}
                                              {columnVisibility.arrivalTime && (
                                                  <div className="space-y-1">
                                                      <Skeleton className="h-4 w-20" />
                                                      <Skeleton className="h-3 w-16" />
                                                  </div>
                                              )}
                                              {columnVisibility.price && (
                                                  <Skeleton className="h-4 w-16" />
                                              )}
                                              {columnVisibility.availability && (
                                                  <Skeleton className="h-5 w-24 rounded-full" />
                                              )}
                                              <Skeleton className="h-5 w-20 rounded-full" />
                                              <Skeleton className="h-8 w-8 rounded-md" />
                                          </div>
                                      </div>
                                  ))
                                : paginatedSchedules.map((schedule) => {
                                      const bookedSeats =
                                          schedule.bookings?.length || 0;
                                      const availableSeats =
                                          schedule.bus.seat_capacity -
                                          bookedSeats;

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
                                                              {
                                                                  schedule.bus
                                                                      .bus_name
                                                              }
                                                          </span>
                                                          <span className="text-xs text-muted-foreground">
                                                              {
                                                                  schedule.bus
                                                                      .bus_plate
                                                              }
                                                          </span>
                                                      </div>
                                                  )}
                                                  {columnVisibility.route && (
                                                      <div className="flex items-center gap-1 text-sm">
                                                          <span className="truncate">
                                                              {
                                                                  schedule.route
                                                                      .from_location
                                                              }{" "}
                                                              →{" "}
                                                              {
                                                                  schedule.route
                                                                      .to_location
                                                              }
                                                          </span>
                                                      </div>
                                                  )}
                                                  {columnVisibility.departureTime && (
                                                      <div className="flex flex-col">
                                                          <div className="flex items-center gap-1 text-sm">
                                                              <Calendar className="h-3 w-3 text-muted-foreground" />
                                                              {(() => {
                                                                  const date =
                                                                      parseAsLocalTime(
                                                                          schedule.departure_time
                                                                      );
                                                                  return `${
                                                                      date.getMonth() +
                                                                      1
                                                                  }/${date.getDate()}/${date.getFullYear()}`;
                                                              })()}
                                                          </div>
                                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                              <Clock className="h-3 w-3" />
                                                              {(() => {
                                                                  const date =
                                                                      parseAsLocalTime(
                                                                          schedule.departure_time
                                                                      );
                                                                  const hours =
                                                                      date.getHours();
                                                                  const minutes =
                                                                      date.getMinutes();
                                                                  const ampm =
                                                                      hours >=
                                                                      12
                                                                          ? "PM"
                                                                          : "AM";
                                                                  const displayHours =
                                                                      hours %
                                                                          12 ||
                                                                      12;
                                                                  return `${displayHours}:${minutes
                                                                      .toString()
                                                                      .padStart(
                                                                          2,
                                                                          "0"
                                                                      )} ${ampm}`;
                                                              })()}
                                                          </div>
                                                      </div>
                                                  )}
                                                  {columnVisibility.arrivalTime && (
                                                      <div className="flex flex-col">
                                                          <div className="flex items-center gap-1 text-sm">
                                                              <Calendar className="h-3 w-3 text-muted-foreground" />
                                                              {(() => {
                                                                  const date =
                                                                      parseAsLocalTime(
                                                                          schedule.arrival_time
                                                                      );
                                                                  return `${
                                                                      date.getMonth() +
                                                                      1
                                                                  }/${date.getDate()}/${date.getFullYear()}`;
                                                              })()}
                                                          </div>
                                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                              <Clock className="h-3 w-3" />
                                                              {(() => {
                                                                  const date =
                                                                      parseAsLocalTime(
                                                                          schedule.arrival_time
                                                                      );
                                                                  const hours =
                                                                      date.getHours();
                                                                  const minutes =
                                                                      date.getMinutes();
                                                                  const ampm =
                                                                      hours >=
                                                                      12
                                                                          ? "PM"
                                                                          : "AM";
                                                                  const displayHours =
                                                                      hours %
                                                                          12 ||
                                                                      12;
                                                                  return `${displayHours}:${minutes
                                                                      .toString()
                                                                      .padStart(
                                                                          2,
                                                                          "0"
                                                                      )} ${ampm}`;
                                                              })()}
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
                                                      <DropdownMenu>
                                                          <DropdownMenuTrigger
                                                              asChild
                                                          >
                                                              <div className="cursor-pointer">
                                                                  {(() => {
                                                                      const expectedStatus =
                                                                          getExpectedStatus(
                                                                              schedule
                                                                          );
                                                                      const isOutdated =
                                                                          expectedStatus !==
                                                                              schedule.status &&
                                                                          schedule.status !==
                                                                              "cancelled";
                                                                      return getStatusBadge(
                                                                          schedule.status,
                                                                          isOutdated
                                                                      );
                                                                  })()}
                                                              </div>
                                                          </DropdownMenuTrigger>
                                                          <DropdownMenuContent align="center">
                                                              <DropdownMenuItem
                                                                  onClick={() =>
                                                                      handleStatusChange(
                                                                          schedule.id,
                                                                          schedule,
                                                                          "scheduled"
                                                                      )
                                                                  }
                                                                  disabled={
                                                                      schedule.status ===
                                                                      "scheduled"
                                                                  }
                                                              >
                                                                  <Badge
                                                                      variant="default"
                                                                      className="mr-2"
                                                                  >
                                                                      Scheduled
                                                                  </Badge>
                                                              </DropdownMenuItem>
                                                              <DropdownMenuItem
                                                                  onClick={() =>
                                                                      handleStatusChange(
                                                                          schedule.id,
                                                                          schedule,
                                                                          "departed"
                                                                      )
                                                                  }
                                                                  disabled={
                                                                      schedule.status ===
                                                                      "departed"
                                                                  }
                                                              >
                                                                  <Badge
                                                                      variant="secondary"
                                                                      className="mr-2"
                                                                  >
                                                                      Departed
                                                                  </Badge>
                                                              </DropdownMenuItem>
                                                              <DropdownMenuItem
                                                                  onClick={() =>
                                                                      handleStatusChange(
                                                                          schedule.id,
                                                                          schedule,
                                                                          "arrived"
                                                                      )
                                                                  }
                                                                  disabled={
                                                                      schedule.status ===
                                                                      "arrived"
                                                                  }
                                                              >
                                                                  <Badge
                                                                      variant="outline"
                                                                      className="mr-2"
                                                                  >
                                                                      Arrived
                                                                  </Badge>
                                                              </DropdownMenuItem>
                                                              <DropdownMenuSeparator />
                                                              <DropdownMenuItem
                                                                  onClick={() =>
                                                                      handleStatusChange(
                                                                          schedule.id,
                                                                          schedule,
                                                                          "cancelled"
                                                                      )
                                                                  }
                                                                  disabled={
                                                                      schedule.status ===
                                                                      "cancelled"
                                                                  }
                                                                  className="text-red-600 focus:text-red-600"
                                                              >
                                                                  <Badge
                                                                      variant="destructive"
                                                                      className="mr-2"
                                                                  >
                                                                      Cancelled
                                                                  </Badge>
                                                              </DropdownMenuItem>
                                                          </DropdownMenuContent>
                                                      </DropdownMenu>
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
                                                                      View
                                                                      details
                                                                      <Eye className="ml-2 h-4 w-4" />
                                                                  </Link>
                                                              </DropdownMenuItem>
                                                              <DropdownMenuItem
                                                                  asChild
                                                              >
                                                                  <Link
                                                                      href={`/transportation-owner/schedules/${schedule.id}/edit`}
                                                                  >
                                                                      Edit
                                                                      schedule
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
                                                                              Are
                                                                              you
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
                                                                              all
                                                                              its
                                                                              data
                                                                              from
                                                                              our
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
                {!isLoading && paginatedSchedules.length === 0 && (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Calendar className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No Schedules Found</EmptyTitle>
                            <EmptyDescription>
                                {schedules.data.length === 0 ? (
                                    <>
                                        You don't have any schedules for your
                                        buses yet. Schedules will appear here
                                        once they are created for your buses.
                                    </>
                                ) : (
                                    "No schedules match your current filters. Try adjusting your search or status filter."
                                )}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {filteredSchedules.length > 0 ? (
                            <>
                                Showing {filteredSchedules.length} of{" "}
                                {schedules.total} schedule(s)
                                {(search || statusFilter !== "all") &&
                                    " (filtered)"}
                            </>
                        ) : (
                            "No schedules to display"
                        )}
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
