import React, { useState, useMemo } from "react";
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
    Users,
    DollarSign,
    Eye,
    Pencil,
    Hotel,
    Phone,
    Settings2,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    RefreshCw,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface Booking {
    id: number;
    booking_id: number;
    booking: {
        id: number;
        user_id: number;
        total_amount: number;
        currency: string;
        status: "pending" | "confirmed" | "cancelled" | "completed";
        created_at: string;
        user?: {
            id: number;
            name: string;
            email: string;
            phone_number?: string;
        };
        payments?: Array<{
            id: number;
            status: "success" | "failed" | "pending" | "processing";
            amount: number;
        }>;
    };
    room_property: {
        room_properties_id: number;
        room_type: string;
        price_per_night: number;
        property: {
            property_id: number;
            place?: {
                placeID: number;
                name: string;
            };
        };
    };
    hotel_details?: {
        id: number;
        check_in: string;
        check_out: string;
        nights: number;
    };
    assigned_room?: {
        room_id: number;
        room_number: string;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}

interface PaginatedBookings {
    data: Booking[];
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
    property: boolean;
    assignedRoom: boolean;
    checkIn: boolean;
    checkOut: boolean;
    bookedOn: boolean;
    paymentStatus: boolean;
}

interface Props {
    bookings?: PaginatedBookings;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/hotel-owner/dashboard",
    },
    {
        title: "Bookings",
        href: "/hotel-owner/bookings",
    },
];

export default function HotelOwnerBookingsIndex({
    bookings = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        links: [],
    },
}: Props) {
    const data = bookings.data || [];

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(false);

    // Client-side pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);

    // Client-side filtering using useMemo (like in all rooms)
    const filteredData = useMemo(() => {
        return data.filter((booking) => {
            // Search filter - only match guest name with prefix
            const matchesSearch =
                search === "" ||
                booking.booking?.user?.name
                    ?.toLowerCase()
                    .startsWith(search.toLowerCase());

            // Status filter
            const matchesStatus =
                statusFilter === "all" ||
                booking.booking?.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [data, search, statusFilter]);

    // Client-side pagination calculations
    const totalFiltered = filteredData.length;
    const lastPage = Math.ceil(totalFiltered / perPage);
    const from = totalFiltered === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalFiltered);

    // Paginated data for current page
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        return filteredData.slice(start, end);
    }, [filteredData, currentPage, perPage]);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    // Column visibility state with localStorage persistence
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
        () => {
            const savedPreferences = localStorage.getItem(
                "bookingsTableColumnVisibility"
            );
            if (savedPreferences) {
                try {
                    const parsed = JSON.parse(savedPreferences);
                    // Save back to localStorage on any change
                    return parsed;
                } catch (e) {
                    console.error(
                        "Failed to parse column visibility preferences:",
                        e
                    );
                }
            }
            return {
                property: true,
                assignedRoom: true,
                checkIn: true,
                checkOut: true,
                bookedOn: true,
                paymentStatus: true,
            };
        }
    );

    // Save column visibility preferences on change
    const updateColumnVisibility = (updates: Partial<ColumnVisibility>) => {
        const newVisibility = { ...columnVisibility, ...updates };
        setColumnVisibility(newVisibility);
        localStorage.setItem(
            "bookingsTableColumnVisibility",
            JSON.stringify(newVisibility)
        );
    };
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
            case "success":
                return <Badge variant="default">Success</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "processing":
                return <Badge variant="secondary">Processing</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hotel Bookings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Hotel Bookings
                        </h1>
                        <p className="text-muted-foreground">
                            Manage and monitor your hotel bookings
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by guest, property, or room type..."
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
                        <DropdownMenuContent align="end" className="w-[150px]">
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.property}
                                onCheckedChange={(value) =>
                                    updateColumnVisibility({
                                        property: !!value,
                                    })
                                }
                            >
                                Property
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.assignedRoom}
                                onCheckedChange={(value) =>
                                    updateColumnVisibility({
                                        assignedRoom: !!value,
                                    })
                                }
                            >
                                Assigned Room
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.checkIn}
                                onCheckedChange={(value) =>
                                    updateColumnVisibility({ checkIn: !!value })
                                }
                            >
                                Check-in
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.checkOut}
                                onCheckedChange={(value) =>
                                    updateColumnVisibility({
                                        checkOut: !!value,
                                    })
                                }
                            >
                                Check-out
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.bookedOn}
                                onCheckedChange={(value) =>
                                    updateColumnVisibility({
                                        bookedOn: !!value,
                                    })
                                }
                            >
                                Booked On
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.paymentStatus}
                                onCheckedChange={(value) =>
                                    updateColumnVisibility({
                                        paymentStatus: !!value,
                                    })
                                }
                            >
                                Payment Status
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
                                    gridTemplateColumns: `2fr ${
                                        columnVisibility.property ? "2fr" : ""
                                    } ${
                                        columnVisibility.assignedRoom
                                            ? "1.2fr"
                                            : ""
                                    } ${
                                        columnVisibility.checkIn ? "1.5fr" : ""
                                    } ${
                                        columnVisibility.checkOut ? "1.5fr" : ""
                                    } 1.5fr ${
                                        columnVisibility.bookedOn ? "1.5fr" : ""
                                    } 1.5fr ${
                                        columnVisibility.paymentStatus
                                            ? "1fr"
                                            : ""
                                    } 1.5fr`.trim(),
                                }}
                            >
                                <div className="text-sm font-medium">Guest</div>
                                {columnVisibility.property && (
                                    <div className="text-sm font-medium">
                                        Property
                                    </div>
                                )}
                                {columnVisibility.assignedRoom && (
                                    <div className="text-sm font-medium">
                                        Assigned Room
                                    </div>
                                )}
                                {columnVisibility.checkIn && (
                                    <div className="text-sm font-medium">
                                        Check-in
                                    </div>
                                )}
                                {columnVisibility.checkOut && (
                                    <div className="text-sm font-medium">
                                        Check-out
                                    </div>
                                )}
                                <div className="text-sm font-medium">
                                    Total Amount
                                </div>
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
                                              className="grid gap-4 items-center"
                                              style={{
                                                  gridTemplateColumns: `2fr ${
                                                      columnVisibility.property
                                                          ? "2fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.assignedRoom
                                                          ? "1.2fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.checkIn
                                                          ? "1.5fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.checkOut
                                                          ? "1.5fr"
                                                          : ""
                                                  } 1.5fr ${
                                                      columnVisibility.bookedOn
                                                          ? "1.5fr"
                                                          : ""
                                                  } 1.5fr ${
                                                      columnVisibility.paymentStatus
                                                          ? "1fr"
                                                          : ""
                                                  } 1.5fr`.trim(),
                                              }}
                                          >
                                              <div className="space-y-2">
                                                  <Skeleton className="h-4 w-32" />
                                                  <Skeleton className="h-3 w-40" />
                                              </div>
                                              {columnVisibility.property && (
                                                  <Skeleton className="h-4 w-24" />
                                              )}
                                              {columnVisibility.assignedRoom && (
                                                  <Skeleton className="h-4 w-16" />
                                              )}
                                              {columnVisibility.checkIn && (
                                                  <Skeleton className="h-4 w-20" />
                                              )}
                                              {columnVisibility.checkOut && (
                                                  <Skeleton className="h-4 w-20" />
                                              )}
                                              <Skeleton className="h-4 w-16" />
                                              {columnVisibility.bookedOn && (
                                                  <Skeleton className="h-4 w-20" />
                                              )}
                                              <Skeleton className="h-5 w-20 rounded-full" />
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
                                              className="grid gap-4 items-center"
                                              style={{
                                                  gridTemplateColumns: `2fr ${
                                                      columnVisibility.property
                                                          ? "2fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.checkIn
                                                          ? "1.5fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.checkOut
                                                          ? "1.5fr"
                                                          : ""
                                                  } 1.5fr ${
                                                      columnVisibility.bookedOn
                                                          ? "1.5fr"
                                                          : ""
                                                  } 1.5fr ${
                                                      columnVisibility.paymentStatus
                                                          ? "1fr"
                                                          : ""
                                                  } 1.5fr`.trim(),
                                              }}
                                          >
                                              <div className="flex flex-col">
                                                  <span className="font-medium">
                                                      {booking.booking.user
                                                          ?.name ||
                                                          "Unknown Guest"}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                      {booking.booking.user
                                                          ?.email || "N/A"}
                                                  </span>
                                              </div>
                                              {columnVisibility.property && (
                                                  <div className="text-sm">
                                                      {booking.room_property
                                                          ?.property?.place
                                                          ?.name || "Unknown"}
                                                  </div>
                                              )}
                                              {columnVisibility.assignedRoom && (
                                                  <div className="text-sm">
                                                      {booking.assigned_room ? (
                                                          <Badge variant="secondary">
                                                              Room{" "}
                                                              {
                                                                  booking
                                                                      .assigned_room
                                                                      .room_number
                                                              }
                                                          </Badge>
                                                      ) : (
                                                          <span className="text-muted-foreground text-xs">
                                                              Not assigned
                                                          </span>
                                                      )}
                                                  </div>
                                              )}
                                              {columnVisibility.checkIn && (
                                                  <div className="flex items-center gap-1 text-sm">
                                                      <Calendar className="h-3 w-3 text-muted-foreground" />
                                                      {booking.hotel_details
                                                          ?.check_in
                                                          ? new Date(
                                                                booking.hotel_details.check_in
                                                            ).toLocaleDateString()
                                                          : "N/A"}
                                                  </div>
                                              )}
                                              {columnVisibility.checkOut && (
                                                  <div className="flex items-center gap-1 text-sm">
                                                      <Calendar className="h-3 w-3 text-muted-foreground" />
                                                      {booking.hotel_details
                                                          ?.check_out
                                                          ? new Date(
                                                                booking.hotel_details.check_out
                                                            ).toLocaleDateString()
                                                          : "N/A"}
                                                  </div>
                                              )}
                                              <div className="font-semibold">
                                                  $
                                                  {(
                                                      booking.total_price || 0
                                                  ).toLocaleString()}
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
                                                      booking.booking.status
                                                  )}
                                              </div>
                                              {columnVisibility.paymentStatus && (
                                                  <div>
                                                      {getPaymentStatusBadge(
                                                          booking.booking
                                                              .payments?.[0]
                                                              ?.status ||
                                                              "pending"
                                                      )}
                                                  </div>
                                              )}
                                              <div className="flex items-center gap-2">
                                                  <Link
                                                      href={`/hotel-owner/bookings/${booking.id}/edit`}
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
                                                                  href={`/hotel-owner/bookings/${booking.id}`}
                                                              >
                                                                  <Eye className="mr-2 h-4 w-4" />
                                                                  View details
                                                              </Link>
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem
                                                              asChild
                                                          >
                                                              <Link
                                                                  href={`/hotel-owner/bookings/${booking.id}/edit`}
                                                              >
                                                                  <Pencil className="mr-2 h-4 w-4" />
                                                                  Edit booking
                                                              </Link>
                                                          </DropdownMenuItem>
                                                          {booking.booking.user
                                                              ?.phone_number && (
                                                              <>
                                                                  <DropdownMenuSeparator />
                                                                  <DropdownMenuItem
                                                                      asChild
                                                                  >
                                                                      <a
                                                                          href={`tel:${booking.booking.user.phone_number}`}
                                                                      >
                                                                          Call
                                                                          guest
                                                                          <Phone className="ml-2 h-4 w-4" />
                                                                      </a>
                                                                  </DropdownMenuItem>
                                                              </>
                                                          )}
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
                                <Calendar className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No Bookings Found</EmptyTitle>
                            <EmptyDescription>
                                You don't have any bookings for your properties
                                yet. Bookings will appear here once guests start
                                making reservations.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing{" "}
                        {(bookings.current_page - 1) * bookings.per_page + 1} to{" "}
                        {Math.min(
                            bookings.current_page * bookings.per_page,
                            bookings.total
                        )}{" "}
                        of {bookings.total} row(s).
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(bookings.per_page)}
                                onValueChange={(value) => {
                                    router.get("/hotel-owner/bookings", {
                                        per_page: value,
                                        page: 1,
                                    });
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
                                    router.get("/hotel-owner/bookings", {
                                        page: 1,
                                    })
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
                                    router.get("/hotel-owner/bookings", {
                                        page: bookings.current_page - 1,
                                    })
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
                                    router.get("/hotel-owner/bookings", {
                                        page: bookings.current_page + 1,
                                    })
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
                                    router.get("/hotel-owner/bookings", {
                                        page: bookings.last_page,
                                    })
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
        </AppLayout>
    );
}
