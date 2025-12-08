import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ViewBookingDialog from "./ViewBookingDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    Eye,
    Phone,
    Settings2,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Bus,
    MapPin,
    Pencil,
    MoreHorizontal,
    Trash,
    RefreshCw,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface SeatBooking {
    id: number;
    passenger_name: string;
    passenger_email?: string;
    passenger_phone?: string;
    price: number;
    booking_status: "pending" | "confirmed" | "cancelled" | "completed";
    payment_status: "pending" | "paid" | "failed";
    created_at: string;
    schedule: {
        id: number;
        departure_time: string;
        arrival_time: string;
        price: number;
        status: string;
        route: {
            id: number;
            origin: string;
            destination: string;
        };
        bus: {
            id: number;
            bus_name: string;
            bus_plate: string;
            transportation: {
                id: number;
                place?: {
                    placeID: number;
                    name: string;
                };
            };
        };
    };
    seat: {
        id: number;
        seat_number: string;
    };
}

interface PaginatedBookings {
    data: SeatBooking[];
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
    seatNumber: boolean;
    bookedOn: boolean;
    paymentStatus: boolean;
}

interface Props {
    bookings?: PaginatedBookings;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/transportation-owner/dashboard",
    },
    {
        title: "Bookings",
        href: "/transportation-owner/bookings",
    },
];

export default function TransportationOwnerBookingsIndex({
    bookings = {
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
    const [selectedBooking, setSelectedBooking] = useState<SeatBooking | null>(
        null
    );
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    // Column visibility state with localStorage persistence
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
        () => {
            const savedPreferences = localStorage.getItem(
                "transportationBookingsTableColumnVisibility"
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
                seatNumber: true,
                bookedOn: true,
                paymentStatus: true,
            };
        }
    );

    // Save column visibility preferences
    useEffect(() => {
        localStorage.setItem(
            "transportationBookingsTableColumnVisibility",
            JSON.stringify(columnVisibility)
        );
    }, [columnVisibility]);

    // Client-side filtering
    const filteredData = bookings.data.filter((booking) => {
        // Search filter - match passenger name with prefix
        const matchesSearch =
            search === "" ||
            booking.passenger_name
                .toLowerCase()
                .startsWith(search.toLowerCase());

        // Status filter
        const matchesStatus =
            statusFilter === "all" || booking.booking_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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
            case "paid":
                return <Badge variant="default">Paid</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transportation Bookings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Transportation Bookings
                        </h1>
                        <p className="text-muted-foreground">
                            Manage and monitor your bus bookings
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bookings..."
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
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Refresh Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.reload({ only: ["bookings"] })}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                isLoading ? "animate-spin" : ""
                            }`}
                        />
                        Refresh
                    </Button>

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
                                checked={columnVisibility.seatNumber}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        seatNumber: !!value,
                                    }))
                                }
                            >
                                Seat Number
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.bookedOn}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        bookedOn: !!value,
                                    }))
                                }
                            >
                                Booked On
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.paymentStatus}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        paymentStatus: !!value,
                                    }))
                                }
                            >
                                Payment Status
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table-like layout */}
                <div className="rounded-md border overflow-x-auto">
                    <div className="min-w-[1800px]">
                        {/* Table Header */}
                        <div className="border-b bg-muted/50 p-4">
                            <div
                                className="grid gap-6 items-center"
                                style={{
                                    gridTemplateColumns: `2fr ${
                                        columnVisibility.bus ? "2fr" : ""
                                    } ${
                                        columnVisibility.route ? "2.5fr" : ""
                                    } ${
                                        columnVisibility.departureTime
                                            ? "1.5fr"
                                            : ""
                                    } ${
                                        columnVisibility.seatNumber ? "1fr" : ""
                                    } 1.5fr ${
                                        columnVisibility.bookedOn ? "1.5fr" : ""
                                    } 1.5fr ${
                                        columnVisibility.paymentStatus
                                            ? "1.2fr"
                                            : ""
                                    } 1.5fr`.trim(),
                                }}
                            >
                                <div className="text-sm font-medium">
                                    Passenger
                                </div>
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
                                {columnVisibility.seatNumber && (
                                    <div className="text-sm font-medium">
                                        Seat
                                    </div>
                                )}
                                <div className="text-sm font-medium">Price</div>
                                {columnVisibility.bookedOn && (
                                    <div className="text-sm font-medium">
                                        Booked On
                                    </div>
                                )}
                                <div className="text-sm font-medium">
                                    Status
                                </div>
                                {columnVisibility.paymentStatus && (
                                    <div className="text-sm font-medium">
                                        Payment
                                    </div>
                                )}
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
                                              className="grid gap-6 items-center"
                                              style={{
                                                  gridTemplateColumns: `2fr ${
                                                      columnVisibility.bus
                                                          ? "2fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.route
                                                          ? "2.5fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.departureTime
                                                          ? "1.5fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.seatNumber
                                                          ? "1fr"
                                                          : ""
                                                  } 1.5fr ${
                                                      columnVisibility.bookedOn
                                                          ? "1.5fr"
                                                          : ""
                                                  } 1.5fr ${
                                                      columnVisibility.paymentStatus
                                                          ? "1.2fr"
                                                          : ""
                                                  } 1.5fr`.trim(),
                                              }}
                                          >
                                              <div className="space-y-2">
                                                  <Skeleton className="h-4 w-32" />
                                                  <Skeleton className="h-3 w-40" />
                                              </div>
                                              {columnVisibility.bus && (
                                                  <div className="space-y-1">
                                                      <Skeleton className="h-4 w-24" />
                                                      <Skeleton className="h-3 w-20" />
                                                  </div>
                                              )}
                                              {columnVisibility.route && (
                                                  <div className="flex items-center gap-2">
                                                      <Skeleton className="h-4 w-24" />
                                                      <Skeleton className="h-4 w-4" />
                                                      <Skeleton className="h-4 w-24" />
                                                  </div>
                                              )}
                                              {columnVisibility.departureTime && (
                                                  <div className="space-y-1">
                                                      <Skeleton className="h-4 w-20" />
                                                      <Skeleton className="h-3 w-16" />
                                                  </div>
                                              )}
                                              {columnVisibility.seatNumber && (
                                                  <Skeleton className="h-5 w-12 rounded-full" />
                                              )}
                                              <Skeleton className="h-5 w-20 rounded-full" />
                                              {columnVisibility.bookedOn && (
                                                  <Skeleton className="h-4 w-20" />
                                              )}
                                              <Skeleton className="h-4 w-16" />
                                              {columnVisibility.paymentStatus && (
                                                  <Skeleton className="h-5 w-16 rounded-full" />
                                              )}
                                              <Skeleton className="h-8 w-8 rounded-md" />
                                          </div>
                                      </div>
                                  ))
                                : filteredData.map((booking) => (
                                      <div
                                          key={booking.id}
                                          className="p-4 hover:bg-muted/50"
                                      >
                                          <div
                                              className="grid gap-6 items-center"
                                              style={{
                                                  gridTemplateColumns: `2fr ${
                                                      columnVisibility.bus
                                                          ? "2fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.route
                                                          ? "2.5fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.departureTime
                                                          ? "1.5fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.seatNumber
                                                          ? "1fr"
                                                          : ""
                                                  } 1.5fr ${
                                                      columnVisibility.bookedOn
                                                          ? "1.5fr"
                                                          : ""
                                                  } 1.5fr ${
                                                      columnVisibility.paymentStatus
                                                          ? "1.2fr"
                                                          : ""
                                                  } 1.5fr`.trim(),
                                              }}
                                          >
                                              <div className="flex flex-col">
                                                  <span className="font-medium">
                                                      {booking.passenger_name ||
                                                          "Unknown Passenger"}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                      {booking.passenger_email ||
                                                          "N/A"}
                                                  </span>
                                              </div>
                                              {columnVisibility.bus && (
                                                  <div className="flex flex-col">
                                                      <span className="text-sm font-medium">
                                                          {booking.schedule.bus
                                                              .bus_name ||
                                                              "N/A"}
                                                      </span>
                                                      <span className="text-xs text-muted-foreground">
                                                          {booking.schedule.bus
                                                              .bus_plate ||
                                                              "N/A"}
                                                      </span>
                                                  </div>
                                              )}
                                              {columnVisibility.route && (
                                                  <div className="flex items-center gap-1 text-sm">
                                                      <MapPin className="h-3 w-3 text-muted-foreground" />
                                                      <span>
                                                          {booking.schedule
                                                              .route.origin ||
                                                              "N/A"}{" "}
                                                          →{" "}
                                                          {booking.schedule
                                                              .route
                                                              .destination ||
                                                              "N/A"}
                                                      </span>
                                                  </div>
                                              )}
                                              {columnVisibility.departureTime && (
                                                  <div className="flex flex-col gap-0.5">
                                                      <div className="flex items-center gap-1 text-sm">
                                                          <Calendar className="h-3 w-3 text-muted-foreground" />
                                                          {new Date(
                                                              booking.schedule.departure_time
                                                          ).toLocaleDateString()}
                                                      </div>
                                                      <span className="text-xs text-muted-foreground pl-4">
                                                          {new Date(
                                                              booking.schedule.departure_time
                                                          ).toLocaleTimeString(
                                                              [],
                                                              {
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              }
                                                          )}
                                                      </span>
                                                  </div>
                                              )}
                                              {columnVisibility.seatNumber && (
                                                  <div className="font-medium text-sm">
                                                      {booking.seat.seat_number}
                                                  </div>
                                              )}
                                              <div className="font-semibold">
                                                  $
                                                  {booking.price.toLocaleString()}
                                              </div>
                                              {columnVisibility.bookedOn && (
                                                  <div className="text-sm">
                                                      {new Date(
                                                          booking.created_at
                                                      ).toLocaleDateString()}
                                                  </div>
                                              )}
                                              <div>
                                                  {getStatusBadge(
                                                      booking.booking_status
                                                  )}
                                              </div>
                                              {columnVisibility.paymentStatus && (
                                                  <div>
                                                      {getPaymentStatusBadge(
                                                          booking.payment_status
                                                      )}
                                                  </div>
                                              )}
                                              <div className="flex gap-2">
                                                  <Link
                                                      href={`/transportation-owner/bookings/${booking.id}/edit`}
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
                                                              onClick={() => {
                                                                  setSelectedBooking(
                                                                      booking
                                                                  );
                                                                  setIsViewDialogOpen(
                                                                      true
                                                                  );
                                                              }}
                                                          >
                                                              <Eye className="mr-2 h-4 w-4" />
                                                              View details
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem
                                                              asChild
                                                          >
                                                              <Link
                                                                  href={`/transportation-owner/bookings/${booking.id}/edit`}
                                                              >
                                                                  <Pencil className="mr-2 h-4 w-4" />
                                                                  Edit booking
                                                              </Link>
                                                          </DropdownMenuItem>
                                                          {booking.passenger_phone && (
                                                              <DropdownMenuItem
                                                                  asChild
                                                              >
                                                                  <a
                                                                      href={`tel:${booking.passenger_phone}`}
                                                                  >
                                                                      <Phone className="mr-2 h-4 w-4" />
                                                                      Call
                                                                      passenger
                                                                  </a>
                                                              </DropdownMenuItem>
                                                          )}
                                                          <DropdownMenuSeparator />
                                                          <AlertDialog>
                                                              <AlertDialogTrigger
                                                                  asChild
                                                              >
                                                                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-red-600">
                                                                      <Trash className="mr-4 h-4 w-4" />
                                                                      Delete
                                                                      booking
                                                                  </div>
                                                              </AlertDialogTrigger>
                                                              <AlertDialogContent>
                                                                  <AlertDialogHeader>
                                                                      <AlertDialogTitle>
                                                                          Are
                                                                          you
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
                                                                          booking
                                                                          for{" "}
                                                                          <strong>
                                                                              {booking.passenger_name ||
                                                                                  "this passenger"}
                                                                          </strong>
                                                                          .
                                                                      </AlertDialogDescription>
                                                                  </AlertDialogHeader>
                                                                  <AlertDialogFooter>
                                                                      <AlertDialogCancel>
                                                                          Cancel
                                                                      </AlertDialogCancel>
                                                                      <AlertDialogAction
                                                                          onClick={() => {
                                                                              router.delete(
                                                                                  `/transportation-owner/bookings/${booking.id}`,
                                                                                  {
                                                                                      preserveScroll:
                                                                                          true,
                                                                                  }
                                                                              );
                                                                          }}
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
                                  ))}
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {!isLoading && filteredData.length === 0 && (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Bus className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No Bookings Found</EmptyTitle>
                            <EmptyDescription>
                                You don't have any bookings for your buses yet.
                                Bookings will appear here once passengers start
                                making reservations.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {filteredData.length > 0 ? (
                            <>
                                Showing {filteredData.length} of{" "}
                                {bookings.total} booking(s)
                                {(search || statusFilter !== "all") &&
                                    " (filtered)"}
                            </>
                        ) : (
                            "No bookings to display"
                        )}
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(bookings.per_page)}
                                onValueChange={(value) => {
                                    router.get(
                                        "/transportation-owner/bookings",
                                        {
                                            per_page: value,
                                            page: 1,
                                        }
                                    );
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={String(bookings.per_page)}
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
                            Page {bookings.current_page} of {bookings.last_page}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get(
                                        "/transportation-owner/bookings",
                                        {
                                            page: 1,
                                        }
                                    )
                                }
                                disabled={bookings.current_page === 1}
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
                                        "/transportation-owner/bookings",
                                        {
                                            page: bookings.current_page - 1,
                                        }
                                    )
                                }
                                disabled={bookings.current_page === 1}
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
                                        "/transportation-owner/bookings",
                                        {
                                            page: bookings.current_page + 1,
                                        }
                                    )
                                }
                                disabled={
                                    bookings.current_page === bookings.last_page
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
                                        "/transportation-owner/bookings",
                                        {
                                            page: bookings.last_page,
                                        }
                                    )
                                }
                                disabled={
                                    bookings.current_page === bookings.last_page
                                }
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Booking Dialog */}
            <ViewBookingDialog
                booking={selectedBooking}
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
            />
        </AppLayout>
    );
}
