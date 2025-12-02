import { useState, useEffect, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
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
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
    },
    {
        title: "Transportations",
        href: "/transportations",
    },
];

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
    // Client-side filter state
    const [searchQuery, setSearchQuery] = useState("");

    // Client-side pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Client-side filtering - instant results
    const filteredTransportations = useMemo(() => {
        return transportations.data.filter((transport) => {
            // Search filter - only match place name with prefix
            const matchesSearch =
                searchQuery === "" ||
                transport.place.name
                    .toLowerCase()
                    .startsWith(searchQuery.toLowerCase());

            return matchesSearch;
        });
    }, [transportations.data, searchQuery]);

    // Client-side pagination calculations
    const totalFiltered = filteredTransportations.length;
    const lastPage = Math.ceil(totalFiltered / perPage);
    const from = totalFiltered === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalFiltered);

    // Paginated data for current page
    const paginatedTransportations = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        return filteredTransportations.slice(start, end);
    }, [filteredTransportations, currentPage, perPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);
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

    const navigateToPage = (page?: number, perPage?: number) => {
        router.get(
            "/transportations",
            {
                page: page || transportations.current_page,
                per_page: perPage || transportations.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["transportations", "filters"],
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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
                {/* Unified Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Single unified search */}
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transportations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-7 w-7 p-0"
                                onClick={() => setSearchQuery("")}
                            >
                                ×
                            </Button>
                        )}
                    </div>

                    {/* Column Toggle */}
                    <div className="ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Settings2 className="h-4 w-4" />
                                    View
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[150px]"
                            >
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
                </div>{" "}
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
                                {paginatedTransportations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="h-48 text-center"
                                        >
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyMedia variant="icon">
                                                        <Bus className="h-8 w-8" />
                                                    </EmptyMedia>
                                                    <EmptyTitle className="text-xl">
                                                        No transportations found
                                                    </EmptyTitle>
                                                    <EmptyDescription className="text-base">
                                                        {searchQuery
                                                            ? "No transportations match your search. Try adjusting your search criteria."
                                                            : "Get started by adding your first transportation company."}
                                                    </EmptyDescription>
                                                </EmptyHeader>
                                                <EmptyContent className="flex gap-2 justify-center">
                                                    {searchQuery && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                setSearchQuery(
                                                                    ""
                                                                )
                                                            }
                                                        >
                                                            Clear Search
                                                        </Button>
                                                    )}
                                                </EmptyContent>
                                            </Empty>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransportations.map(
                                        (transport) => (
                                            <tr
                                                key={transport.id}
                                                className="border-b transition-colors hover:bg-muted/50"
                                            >
                                                {/* Company Name */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {transport.place
                                                            .images_url &&
                                                        transport.place
                                                            .images_url.length >
                                                            0 ? (
                                                            <img
                                                                src={
                                                                    transport
                                                                        .place
                                                                        .images_url[0]
                                                                }
                                                                alt={
                                                                    transport
                                                                        .place
                                                                        .name
                                                                }
                                                                className="h-12 w-12 rounded-lg object-cover"
                                                                onError={(
                                                                    e
                                                                ) => {
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
                                                                    transport
                                                                        .place
                                                                        .images_url &&
                                                                    transport
                                                                        .place
                                                                        .images_url
                                                                        .length >
                                                                        0
                                                                        ? "none"
                                                                        : "flex",
                                                            }}
                                                        >
                                                            <Bus className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    transport
                                                                        .place
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
                                                                    transport
                                                                        .owner
                                                                        .name
                                                                }
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {
                                                                    transport
                                                                        .owner
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
                                                                        View
                                                                        Details
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
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {from} to {to} of {totalFiltered} row(s).
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(perPage)}
                                onValueChange={(value) => {
                                    setPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={String(perPage)}
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
                            Page {currentPage} of {lastPage || 1}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <span className="sr-only">
                                    Go to first page
                                </span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <span className="sr-only">
                                    Go to previous page
                                </span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === lastPage}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => setCurrentPage(lastPage)}
                                disabled={currentPage === lastPage}
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
