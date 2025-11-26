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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
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
} from "lucide-react";

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

export default function HotelIndex({ properties, filters, provinces }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [province, setProvince] = useState(filters.province || "all");
    const [rating, setRating] = useState(filters.rating || "all");
    const [availability, setAvailability] = useState(
        filters.availability || "all"
    );

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

    const isInitialMount = useRef(true);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
                "/hotels",
                {
                    search: search || undefined,
                    province: province !== "all" ? province : undefined,
                    rating: rating !== "all" ? rating : undefined,
                    availability:
                        availability !== "all" ? availability : undefined,
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

    // Filter changes (immediate)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            "/hotels",
            {
                search: search || undefined,
                province: province !== "all" ? province : undefined,
                rating: rating !== "all" ? rating : undefined,
                availability: availability !== "all" ? availability : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [province, rating, availability]);

    // Update state when filters change from server
    useEffect(() => {
        setSearch(filters.search || "");
        setProvince(filters.province || "all");
        setRating(filters.rating || "all");
        setAvailability(filters.availability || "all");
    }, [
        filters.search,
        filters.province,
        filters.rating,
        filters.availability,
    ]);

    const handleDelete = (id: number, name: string) => {
        if (
            confirm(
                `Are you sure you want to delete "${name}"? This action cannot be undone.`
            )
        ) {
            router.delete(`/hotels/${id}`);
        }
    };

    return (
        <AppLayout>
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

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter hotels..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <Select value={province} onValueChange={setProvince}>
                        <SelectTrigger className="w-[150px]">
                            <MapPin className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Province" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Provinces</SelectItem>
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

                    <Select value={rating} onValueChange={setRating}>
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
                        value={availability}
                        onValueChange={setAvailability}
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
                            {properties.data.map((property) => (
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
                                                {property.room_stats.available >
                                                0
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
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/hotels/${property.property_id}`}
                                                        >
                                                            View details
                                                            <Eye className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/hotels/${property.property_id}/edit`}
                                                        >
                                                            Edit hotel
                                                            <Edit className="ml-5 h-4 w-4" />
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            asChild
                                                        >
                                                            <DropdownMenuItem
                                                                onSelect={(e) =>
                                                                    e.preventDefault()
                                                                }
                                                                className="text-red-600 focus:text-red-600"
                                                            >
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
                                                                    This action
                                                                    cannot be
                                                                    undone. This
                                                                    will
                                                                    permanently
                                                                    delete the
                                                                    hotel "
                                                                    {
                                                                        property
                                                                            .place
                                                                            .name
                                                                    }
                                                                    " and remove
                                                                    all its data
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
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer with Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {properties.from || 0} to {properties.to || 0}{" "}
                        of {properties.total} row(s).
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(properties.per_page || 10)}
                                onValueChange={(value) => {
                                    router.get("/hotels", {
                                        search: search || undefined,
                                        province:
                                            province !== "all"
                                                ? province
                                                : undefined,
                                        rating:
                                            rating !== "all"
                                                ? rating
                                                : undefined,
                                        availability:
                                            availability !== "all"
                                                ? availability
                                                : undefined,
                                        per_page: value,
                                        page: 1,
                                    });
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={String(
                                            properties.per_page || 10
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
                            Page {properties.current_page} of{" "}
                            {properties.last_page}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get("/hotels", {
                                        search: search || undefined,
                                        province:
                                            province !== "all"
                                                ? province
                                                : undefined,
                                        rating:
                                            rating !== "all"
                                                ? rating
                                                : undefined,
                                        availability:
                                            availability !== "all"
                                                ? availability
                                                : undefined,
                                        page: 1,
                                    })
                                }
                                disabled={properties.current_page === 1}
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
                                    router.get("/hotels", {
                                        search: search || undefined,
                                        province:
                                            province !== "all"
                                                ? province
                                                : undefined,
                                        rating:
                                            rating !== "all"
                                                ? rating
                                                : undefined,
                                        availability:
                                            availability !== "all"
                                                ? availability
                                                : undefined,
                                        page: properties.current_page - 1,
                                    })
                                }
                                disabled={properties.current_page === 1}
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
                                    router.get("/hotels", {
                                        search: search || undefined,
                                        province:
                                            province !== "all"
                                                ? province
                                                : undefined,
                                        rating:
                                            rating !== "all"
                                                ? rating
                                                : undefined,
                                        availability:
                                            availability !== "all"
                                                ? availability
                                                : undefined,
                                        page: properties.current_page + 1,
                                    })
                                }
                                disabled={
                                    properties.current_page ===
                                    properties.last_page
                                }
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get("/hotels", {
                                        search: search || undefined,
                                        province:
                                            province !== "all"
                                                ? province
                                                : undefined,
                                        rating:
                                            rating !== "all"
                                                ? rating
                                                : undefined,
                                        availability:
                                            availability !== "all"
                                                ? availability
                                                : undefined,
                                        page: properties.last_page,
                                    })
                                }
                                disabled={
                                    properties.current_page ===
                                    properties.last_page
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
