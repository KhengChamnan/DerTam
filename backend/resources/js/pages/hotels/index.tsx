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
    ImageIcon,
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
                            Add Hotel
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
                        <SelectTrigger className="w-[200px]">
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
                {/* Table layout */}
                <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1200px]">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">
                                        Hotel Name
                                    </th>
                                    {columnVisibility.location && (
                                        <th className="text-left p-4 font-medium">
                                            Location
                                        </th>
                                    )}
                                    {columnVisibility.owner && (
                                        <th className="text-left p-4 font-medium">
                                            Owner
                                        </th>
                                    )}
                                    {columnVisibility.rating && (
                                        <th className="text-left p-4 font-medium">
                                            Rating
                                        </th>
                                    )}
                                    {columnVisibility.rooms && (
                                        <th className="text-left p-4 font-medium">
                                            Rooms
                                        </th>
                                    )}
                                    {columnVisibility.priceRange && (
                                        <th className="text-left p-4 font-medium">
                                            Price Range
                                        </th>
                                    )}
                                    {columnVisibility.facilities && (
                                        <th className="text-left p-4 font-medium">
                                            Facilities
                                        </th>
                                    )}
                                    {columnVisibility.status && (
                                        <th className="text-left p-4 font-medium">
                                            Status
                                        </th>
                                    )}
                                    <th className="text-left p-4 font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProperties.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={100}
                                            className="p-12 text-center"
                                        >
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
                                                        provinceFilter !==
                                                            "all" ||
                                                        ratingFilter !==
                                                            "all" ||
                                                        availabilityFilter !==
                                                            "all"
                                                            ? "No hotels match your current filters. Try adjusting your search criteria."
                                                            : "Get started by adding your first hotel property."}
                                                    </EmptyDescription>
                                                </EmptyHeader>
                                                <EmptyContent className="flex gap-2">
                                                    {(searchQuery ||
                                                        provinceFilter !==
                                                            "all" ||
                                                        ratingFilter !==
                                                            "all" ||
                                                        availabilityFilter !==
                                                            "all") && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSearchQuery(
                                                                    ""
                                                                );
                                                                setProvinceFilter(
                                                                    "all"
                                                                );
                                                                setRatingFilter(
                                                                    "all"
                                                                );
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
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProperties.map((property) => (
                                        <tr
                                            key={property.property_id}
                                            className="border-b transition-colors hover:bg-muted/50"
                                        >
                                            {/* Hotel Name with Image */}
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                                        {property.place
                                                            .images_url?.[0] ? (
                                                            <img
                                                                src={
                                                                    property
                                                                        .place
                                                                        .images_url[0]
                                                                }
                                                                alt={
                                                                    property
                                                                        .place
                                                                        .name
                                                                }
                                                                className="h-full w-full object-cover"
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.display =
                                                                        "none";
                                                                    const parent =
                                                                        e
                                                                            .currentTarget
                                                                            .parentElement;
                                                                    if (
                                                                        parent
                                                                    ) {
                                                                        parent.innerHTML =
                                                                            '<div class="h-full w-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/hotels/${property.property_id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {
                                                                property.place
                                                                    .name
                                                            }
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                                            {
                                                                property.place
                                                                    .description
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Location */}
                                            {columnVisibility.location && (
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {
                                                                property.place
                                                                    .province
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Owner */}
                                            {columnVisibility.owner && (
                                                <td className="p-4 align-middle">
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                property.owner
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {
                                                                property.owner
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Rating */}
                                            {columnVisibility.rating && (
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-medium">
                                                            {property.place.ratings.toFixed(
                                                                1
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            (
                                                            {
                                                                property.place
                                                                    .reviews_count
                                                            }
                                                            )
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Rooms */}
                                            {columnVisibility.rooms && (
                                                <td className="p-4 align-middle">
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                property
                                                                    .room_stats
                                                                    .available
                                                            }
                                                            /
                                                            {
                                                                property
                                                                    .room_stats
                                                                    .total
                                                            }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Available
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Price Range */}
                                            {columnVisibility.priceRange && (
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium">
                                                            {property.room_stats
                                                                .price_range ||
                                                                "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Facilities */}
                                            {columnVisibility.facilities && (
                                                <td className="p-4 align-middle">
                                                    <span className="font-medium">
                                                        {
                                                            property.facilities_count
                                                        }
                                                    </span>
                                                </td>
                                            )}

                                            {/* Status */}
                                            {columnVisibility.status && (
                                                <td className="p-4 align-middle">
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
                                                </td>
                                            )}

                                            {/* Actions */}
                                            <td className="p-4 align-middle">
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
                                                                        Delete
                                                                        hotel
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
                                                                            hotel
                                                                            "
                                                                            {
                                                                                property
                                                                                    .place
                                                                                    .name
                                                                            }
                                                                            "
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
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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
