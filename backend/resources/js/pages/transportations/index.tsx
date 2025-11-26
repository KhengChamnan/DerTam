import React, { useState, useEffect, useRef } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    Bus,
    MapPin,
    Users,
    DollarSign,
    Filter,
    Settings2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Calendar,
} from "lucide-react";

interface Transportation {
    id: number;
    placeID: number;
    owner_user_id: number;
    place: {
        placeID: number;
        name: string;
        description: string;
        images_url?: string[];
        category?: {
            placeCategoryName: string;
        };
        provinceCategory?: {
            province_categoryName: string;
        };
    };
    owner: {
        id: number;
        name: string;
        email: string;
    };
    buses_count: number;
    total_capacity: number;
    active_routes_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    transportations: {
        data: Transportation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search: string;
    };
}

interface ColumnVisibility {
    location: boolean;
    owner: boolean;
    buses: boolean;
    routes: boolean;
    capacity: boolean;
}

export default function TransportationIndex({
    transportations,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id: number | null;
        name: string;
    }>({ open: false, id: null, name: "" });

    // Column visibility state with localStorage persistence
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
        () => {
            const savedPreferences = localStorage.getItem(
                "transportationTableColumnVisibility"
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
                location: true,
                owner: true,
                buses: true,
                routes: true,
                capacity: true,
            };
        }
    );

    // Save column visibility preferences to localStorage
    useEffect(() => {
        localStorage.setItem(
            "transportationTableColumnVisibility",
            JSON.stringify(columnVisibility)
        );
    }, [columnVisibility]);

    const isInitialMount = useRef(true);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Set initial mount to false after first render
    useEffect(() => {
        isInitialMount.current = false;
    }, []);

    // Auto-search with debouncing
    useEffect(() => {
        if (isInitialMount.current) {
            return;
        }

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            router.get(
                "/transportations",
                {
                    search: search || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [search]);

    // Update state when filters change from server
    useEffect(() => {
        setSearch(filters.search || "");
    }, [filters.search]);

    const handleDelete = (id: number, name: string) => {
        setDeleteDialog({ open: true, id, name });
    };

    const confirmDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/transportations/${deleteDialog.id}`, {
                onSuccess: () => {
                    setDeleteDialog({ open: false, id: null, name: "" });
                },
            });
        }
    };

    const changePage = (page: number) => {
        router.get(
            "/transportations",
            {
                search: search || undefined,
                page: page,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AppLayout>
            <Head title="Transportation Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Transportation Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage bus operators and their schedules
                        </p>
                    </div>
                    <Link href="/transportations/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Transportation
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by company name, place, or owner..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

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
                                checked={columnVisibility.location}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        location: !!value,
                                    }))
                                }
                            >
                                Location
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.owner}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        owner: !!value,
                                    }))
                                }
                            >
                                Owner
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.buses}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        buses: !!value,
                                    }))
                                }
                            >
                                Buses
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.routes}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        routes: !!value,
                                    }))
                                }
                            >
                                Active Routes
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={columnVisibility.capacity}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        capacity: !!value,
                                    }))
                                }
                            >
                                Total Capacity
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1500px]">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="h-12 px-4 text-left align-middle font-medium">
                                        Company Name
                                    </th>
                                    {columnVisibility.location && (
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Location
                                        </th>
                                    )}
                                    {columnVisibility.owner && (
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Owner
                                        </th>
                                    )}
                                    {columnVisibility.buses && (
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Buses
                                        </th>
                                    )}
                                    {columnVisibility.routes && (
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Active Routes
                                        </th>
                                    )}
                                    {columnVisibility.capacity && (
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Total Capacity
                                        </th>
                                    )}
                                    <th className="h-12 px-4 text-left align-middle font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transportations.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No transportation companies found.
                                        </td>
                                    </tr>
                                ) : (
                                    transportations.data.map((transport) => (
                                        <tr
                                            key={transport.id}
                                            className="border-b transition-colors hover:bg-muted/50"
                                        >
                                            {/* Company Name */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {transport.place
                                                        .images_url &&
                                                    transport.place.images_url
                                                        .length > 0 ? (
                                                        <img
                                                            src={
                                                                transport.place
                                                                    .images_url[0]
                                                            }
                                                            alt={
                                                                transport.place
                                                                    .name
                                                            }
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                            onError={(e) => {
                                                                // Fallback to icon if image fails to load
                                                                e.currentTarget.style.display =
                                                                    "none";
                                                                if (
                                                                    e
                                                                        .currentTarget
                                                                        .nextElementSibling
                                                                ) {
                                                                    (
                                                                        e
                                                                            .currentTarget
                                                                            .nextElementSibling as HTMLElement
                                                                    ).style.display =
                                                                        "flex";
                                                                }
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
                                                        style={{
                                                            display:
                                                                transport.place
                                                                    .images_url &&
                                                                transport.place
                                                                    .images_url
                                                                    .length > 0
                                                                    ? "none"
                                                                    : "flex",
                                                        }}
                                                    >
                                                        <Bus className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                transport.place
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {transport.place
                                                                .description
                                                                ? transport.place.description.substring(
                                                                      0,
                                                                      50
                                                                  ) + "..."
                                                                : "Transportation Company"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Location */}
                                            {columnVisibility.location && (
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {transport.place
                                                                .provinceCategory
                                                                ?.province_categoryName ||
                                                                "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Owner */}
                                            {columnVisibility.owner && (
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {
                                                                transport.owner
                                                                    .name
                                                            }
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {
                                                                transport.owner
                                                                    .email
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Buses */}
                                            {columnVisibility.buses && (
                                                <td className="p-4">
                                                    <span className="font-semibold">
                                                        {transport.buses_count ||
                                                            0}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Active Routes */}
                                            {columnVisibility.routes && (
                                                <td className="p-4">
                                                    <Badge variant="outline">
                                                        {transport.active_routes_count ||
                                                            0}{" "}
                                                        routes
                                                    </Badge>
                                                </td>
                                            )}

                                            {/* Total Capacity */}
                                            {columnVisibility.capacity && (
                                                <td className="p-4">
                                                    <span>
                                                        {transport.total_capacity ||
                                                            0}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Actions */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/transportations/${transport.id}/edit`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Edit className="h-4 w-4" />
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
                                                                    href={`/transportations/${transport.id}`}
                                                                >
                                                                    View Details
                                                                    <Eye className="h-4 w-4 ml-13" />
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/transportations/${transport.id}/edit`}
                                                                >
                                                                    Edit
                                                                    Transportation
                                                                    <Edit className="h-4 w-4 ml-2" />
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        transport.id,
                                                                        transport
                                                                            .place
                                                                            .name
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {transportations.from || 0} to{" "}
                        {transportations.to || 0} of {transportations.total}{" "}
                        row(s).
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(transportations.per_page || 10)}
                                onValueChange={(value) => {
                                    router.get("/transportations", {
                                        search: search || undefined,
                                        per_page: value,
                                        page: 1,
                                    });
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={String(
                                            transportations.per_page || 10
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem
                                            key={pageSize}
                                            value={`${pageSize}`}
                                        >
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {transportations.current_page} of{" "}
                            {transportations.last_page}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => changePage(1)}
                                disabled={transportations.current_page === 1}
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
                                    changePage(transportations.current_page - 1)
                                }
                                disabled={transportations.current_page === 1}
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
                                    changePage(transportations.current_page + 1)
                                }
                                disabled={
                                    transportations.current_page ===
                                    transportations.last_page
                                }
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    changePage(transportations.last_page)
                                }
                                disabled={
                                    transportations.current_page ===
                                    transportations.last_page
                                }
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    !open &&
                    setDeleteDialog({ open: false, id: null, name: "" })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{deleteDialog.name}"
                            and all associated schedules and bookings. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
