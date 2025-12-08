import React, { useState, useEffect, useMemo } from "react";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Plus,
    Eye,
    Pencil,
    Trash,
    Star,
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
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Hotel,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface Property {
    property_id: number;
    place: {
        placeID: number;
        name: string;
        description: string;
        ratings: number;
        reviews_count: number;
        images_url: string[];
        province: string;
    };
    owner: {
        id: number;
        name: string;
        email: string;
    };
    room_stats: {
        available: number;
        total: number;
        price_range: string;
    };
    facilities_count: number;
    created_at: string;
}

interface Province {
    province_categoryID: number;
    province_categoryName: string;
}

interface Props {
    properties: {
        data: Property[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search: string;
        province: string;
        rating: string;
        availability: string;
    };
    provinces: Province[];
}

interface ColumnVisibility {
    location: boolean;
    owner: boolean;
    rating: boolean;
    rooms: boolean;
    priceRange: boolean;
    facilities: boolean;
    status: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
    },
    {
        title: "Hotels",
        href: "/hotels",
    },
];

export default function HotelIndex({ properties, filters, provinces }: Props) {
    // Client-side filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [provinceFilter, setProvinceFilter] = useState<string>("all");
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

    // Client-side pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Column visibility state with localStorage persistence
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
        () => {
            const savedPreferences = localStorage.getItem(
                "hotelsTableColumnVisibility"
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
                rating: true,
                rooms: true,
                priceRange: true,
                facilities: true,
                status: true,
            };
        }
    );

    // Save column visibility preferences to localStorage
    useEffect(() => {
        localStorage.setItem(
            "hotelsTableColumnVisibility",
            JSON.stringify(columnVisibility)
        );
    }, [columnVisibility]);

    // Client-side filtering - instant results
    const filteredProperties = useMemo(() => {
        return properties.data.filter((property) => {
            // Search filter - only match place name with prefix
            const matchesSearch =
                searchQuery === "" ||
                property.place.name
                    .toLowerCase()
                    .startsWith(searchQuery.toLowerCase());

            // Province filter (simplified - just check if province string matches)
            const matchesProvince =
                provinceFilter === "all" ||
                (typeof property.place.province === "string" &&
                    property.place.province === provinceFilter);

            // Rating filter
            const matchesRating =
                ratingFilter === "all" ||
                (ratingFilter === "4+" && property.place.ratings >= 4) ||
                (ratingFilter === "3+" && property.place.ratings >= 3);

            // Availability filter (simplified)
            const matchesAvailability = availabilityFilter === "all";

            return (
                matchesSearch &&
                matchesProvince &&
                matchesRating &&
                matchesAvailability
            );
        });
    }, [
        properties.data,
        searchQuery,
        provinceFilter,
        ratingFilter,
        availabilityFilter,
    ]);

    // Client-side pagination calculations
    const totalFiltered = filteredProperties.length;
    const lastPage = Math.ceil(totalFiltered / perPage);
    const from = totalFiltered === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalFiltered);

    // Paginated data for current page
    const paginatedProperties = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        return filteredProperties.slice(start, end);
    }, [filteredProperties, currentPage, perPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, provinceFilter, ratingFilter, availabilityFilter]);

    const handleDelete = (id: number, name: string) => {
        if (
            confirm(
                `Are you sure you want to delete "${name}"? This action cannot be undone.`
            )
        ) {
            router.delete(`/hotels/${id}`);
        }
    };

    // Helper function for pagination
    const navigateToPage = (page?: number, perPage?: number) => {
        router.get("/hotels", {
            ...(page && { page: page.toString() }),
            ...(perPage && { per_page: perPage.toString() }),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hotel Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Hotel Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage hotel properties and their rooms
                        </p>
                    </div>
                    <Link href="/hotels/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Hotel
                        </Button>
                    </Link>
                </div>
                {/* Unified Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Single unified search */}
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search hotels..."
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

                    <Select
                        value={provinceFilter}
                        onValueChange={setProvinceFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <MapPin className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Province" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Provinces</SelectItem>
                            {provinces.map((prov) => (
                                <SelectItem
                                    key={prov.province_categoryID}
                                    value={prov.province_categoryID.toString()}
                                >
                                    {prov.province_categoryName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={ratingFilter}
                        onValueChange={setRatingFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <Star className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="4">4+ Stars</SelectItem>
                            <SelectItem value="3">3+ Stars</SelectItem>
                            <SelectItem value="2">2+ Stars</SelectItem>
                            <SelectItem value="1">1+ Stars</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={availabilityFilter}
                        onValueChange={setAvailabilityFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="unavailable">
                                Unavailable
                            </SelectItem>
                        </SelectContent>
                    </Select>

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
                                    className="capitalize"
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
                                    className="capitalize"
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
                                    className="capitalize"
                                    checked={columnVisibility.rating}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility((prev) => ({
                                            ...prev,
                                            rating: !!value,
                                        }))
                                    }
                                >
                                    Rating
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    className="capitalize"
                                    checked={columnVisibility.rooms}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility((prev) => ({
                                            ...prev,
                                            rooms: !!value,
                                        }))
                                    }
                                >
                                    Rooms
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    className="capitalize"
                                    checked={columnVisibility.priceRange}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility((prev) => ({
                                            ...prev,
                                            priceRange: !!value,
                                        }))
                                    }
                                >
                                    Price Range
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    className="capitalize"
                                    checked={columnVisibility.facilities}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility((prev) => ({
                                            ...prev,
                                            facilities: !!value,
                                        }))
                                    }
                                >
                                    Facilities
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    className="capitalize"
                                    checked={columnVisibility.status}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility((prev) => ({
                                            ...prev,
                                            status: !!value,
                                        }))
                                    }
                                >
                                    Status
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>{" "}
                {/* Table-like layout */}
                <div className="rounded-md border overflow-x-auto">
                    <div className="min-w-[1800px]">
                        {/* Table Header */}
                        <div className="border-b bg-muted/50 p-4">
                            <div
                                className="grid gap-4 items-center"
                                style={{
                                    gridTemplateColumns: `2fr ${
                                        columnVisibility.location ? "2fr" : ""
                                    } ${columnVisibility.owner ? "2fr" : ""} ${
                                        columnVisibility.rating ? "1.5fr" : ""
                                    } ${
                                        columnVisibility.rooms ? "1.5fr" : ""
                                    } ${
                                        columnVisibility.priceRange
                                            ? "1.5fr"
                                            : ""
                                    } ${
                                        columnVisibility.facilities ? "1fr" : ""
                                    } ${
                                        columnVisibility.status ? "1fr" : ""
                                    } 2fr`.trim(),
                                }}
                            >
                                <div className="text-sm font-medium">
                                    Hotel Name
                                </div>
                                {columnVisibility.location && (
                                    <div className="text-sm font-medium">
                                        Location
                                    </div>
                                )}
                                {columnVisibility.owner && (
                                    <div className="text-sm font-medium">
                                        Owner
                                    </div>
                                )}
                                {columnVisibility.rating && (
                                    <div className="text-sm font-medium">
                                        Rating
                                    </div>
                                )}
                                {columnVisibility.rooms && (
                                    <div className="text-sm font-medium">
                                        Rooms
                                    </div>
                                )}
                                {columnVisibility.priceRange && (
                                    <div className="text-sm font-medium">
                                        Price Range
                                    </div>
                                )}
                                {columnVisibility.facilities && (
                                    <div className="text-sm font-medium">
                                        Facilities
                                    </div>
                                )}
                                {columnVisibility.status && (
                                    <div className="text-sm font-medium">
                                        Status
                                    </div>
                                )}
                                <div className="text-sm font-medium">
                                    Actions
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y">
                            {paginatedProperties.length === 0 ? (
                                <div className="p-12">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <Hotel className="h-8 w-8" />
                                            </EmptyMedia>
                                            <EmptyTitle className="text-xl">
                                                No hotels found
                                            </EmptyTitle>
                                            <EmptyDescription className="text-base">
                                                {searchQuery ||
                                                provinceFilter !== "all" ||
                                                ratingFilter !== "all" ||
                                                availabilityFilter !== "all"
                                                    ? "No hotels match your current filters. Try adjusting your search criteria."
                                                    : "Get started by adding your first hotel property."}
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        <EmptyContent className="flex gap-2">
                                            {(searchQuery ||
                                                provinceFilter !== "all" ||
                                                ratingFilter !== "all" ||
                                                availabilityFilter !==
                                                    "all") && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        setProvinceFilter(
                                                            "all"
                                                        );
                                                        setRatingFilter("all");
                                                        setAvailabilityFilter(
                                                            "all"
                                                        );
                                                    }}
                                                >
                                                    Clear Filters
                                                </Button>
                                            )}
                                        </EmptyContent>
                                    </Empty>
                                </div>
                            ) : (
                                paginatedProperties.map((property) => (
                                    <div
                                        key={property.property_id}
                                        className="p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div
                                            className="grid gap-4 items-center"
                                            style={{
                                                gridTemplateColumns: `2fr ${
                                                    columnVisibility.location
                                                        ? "2fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.owner
                                                        ? "2fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.rating
                                                        ? "1.5fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.rooms
                                                        ? "1.5fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.priceRange
                                                        ? "1.5fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.facilities
                                                        ? "1fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.status
                                                        ? "1fr"
                                                        : ""
                                                } 2fr`.trim(),
                                            }}
                                        >
                                            {/* Hotel Name */}
                                            <div>
                                                <div className="font-medium">
                                                    {property.place.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground line-clamp-1">
                                                    {property.place.description}
                                                </div>
                                            </div>

                                            {/* Location */}
                                            {columnVisibility.location && (
                                                <div className="flex items-center text-sm">
                                                    <MapPin className="h-3 w-3 mr-1 shrink-0" />
                                                    {property.place.province}
                                                </div>
                                            )}

                                            {/* Owner */}
                                            {columnVisibility.owner && (
                                                <div className="text-sm">
                                                    <div className="font-medium">
                                                        {property.owner.name}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {property.owner.email}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Rating */}
                                            {columnVisibility.rating && (
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-500 mr-1 shrink-0" />
                                                    <span className="text-sm">
                                                        {property.place.ratings}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground ml-1">
                                                        (
                                                        {
                                                            property.place
                                                                .reviews_count
                                                        }
                                                        )
                                                    </span>
                                                </div>
                                            )}

                                            {/* Rooms */}
                                            {columnVisibility.rooms && (
                                                <Badge
                                                    variant={
                                                        property.room_stats
                                                            .available > 0
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {property.room_stats.total}{" "}
                                                </Badge>
                                            )}

                                            {/* Price Range */}
                                            {columnVisibility.priceRange && (
                                                <div className="flex items-center text-sm">
                                                    {
                                                        property.room_stats
                                                            .price_range
                                                    }
                                                </div>
                                            )}

                                            {/* Facilities */}
                                            {columnVisibility.facilities && (
                                                <Badge variant="outline">
                                                    {property.facilities_count}{" "}
                                                    facilities
                                                </Badge>
                                            )}

                                            {/* Status */}
                                            {columnVisibility.status && (
                                                <Badge
                                                    variant={
                                                        property.room_stats
                                                            .available > 0
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {property.room_stats
                                                        .available > 0
                                                        ? "Available"
                                                        : "Full"}
                                                </Badge>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/hotels/${property.property_id}/edit`}
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
                                                                href={`/hotels/${property.property_id}`}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/hotels/${property.property_id}/edit`}
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit hotel
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
                                                                    <Trash className="mr-2 h-4 w-4" />
                                                                    Delete hotel
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
                                                                        hotel "
                                                                        {
                                                                            property
                                                                                .place
                                                                                .name
                                                                        }
                                                                        " and
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
                                                                            handleDelete(
                                                                                property.property_id,
                                                                                property
                                                                                    .place
                                                                                    .name
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
                                ))
                            )}
                        </div>
                    </div>
                </div>
                {/* Footer with Pagination */}
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
        </AppLayout>
    );
}
