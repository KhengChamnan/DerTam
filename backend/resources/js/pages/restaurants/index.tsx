import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Search,
    Plus,
    Eye,
    Pencil,
    Trash,
    Star,
    MapPin,
    DollarSign,
    Settings2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    UtensilsCrossed,
    ChefHat,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface RestaurantProperty {
    restaurant_property_id: number;
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
        id: number | null;
        name: string;
        email: string;
    };
    menu_stats: {
        available: number;
        total: number;
        price_range: string;
        categories_count: number;
    };
    created_at: string;
}

interface Province {
    province_categoryID: number;
    province_categoryName: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface MenuCategory {
    menu_category_id: number;
    name: string;
    description?: string;
}

interface Props {
    properties: {
        data: RestaurantProperty[];
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
    };
    provinces: Province[];
    users: User[];
    menuCategories: MenuCategory[];
}

interface ColumnVisibility {
    location: boolean;
    owner: boolean;
    rating: boolean;
    menu: boolean;
    priceRange: boolean;
    categories: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
    },
    {
        title: "Restaurants",
        href: "/restaurants",
    },
];

export default function RestaurantIndex({ properties, provinces }: Props) {
    // Client-side filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [provinceFilter, setProvinceFilter] = useState<string>("all");
    const [ratingFilter, setRatingFilter] = useState<string>("all");

    // Client-side pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Column visibility state
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
        () => {
            const savedPreferences = localStorage.getItem(
                "restaurantColumnPreferences"
            );
            return savedPreferences
                ? JSON.parse(savedPreferences)
                : {
                      location: true,
                      owner: true,
                      rating: true,
                      menu: true,
                      priceRange: true,
                      categories: true,
                  };
        }
    );

    // Save column preferences when they change
    React.useEffect(() => {
        localStorage.setItem(
            "restaurantColumnPreferences",
            JSON.stringify(columnVisibility)
        );
    }, [columnVisibility]);

    // Filter and paginate data
    const filteredData = useMemo(() => {
        let filtered = properties.data;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (property) =>
                    property.place.name.toLowerCase().includes(query) ||
                    property.place.province.toLowerCase().includes(query) ||
                    property.owner.name.toLowerCase().includes(query) ||
                    property.owner.email.toLowerCase().includes(query)
            );
        }

        // Province filter
        if (provinceFilter !== "all") {
            filtered = filtered.filter(
                (property) =>
                    property.place.province ===
                    provinces.find(
                        (p) =>
                            p.province_categoryID.toString() === provinceFilter
                    )?.province_categoryName
            );
        }

        // Rating filter
        if (ratingFilter !== "all") {
            const minRating = parseFloat(ratingFilter);
            filtered = filtered.filter(
                (property) => property.place.ratings >= minRating
            );
        }

        return filtered;
    }, [properties.data, searchQuery, provinceFilter, ratingFilter, provinces]);

    // Paginate filtered data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, perPage]);

    const totalFiltered = filteredData.length;
    const lastPage = Math.ceil(totalFiltered / perPage) || 1;
    const from = totalFiltered === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalFiltered);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, provinceFilter, ratingFilter]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Restaurants" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Restaurant Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage restaurant properties and menus
                        </p>
                    </div>
                    <Link href="/restaurants/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Restaurant
                        </Button>
                    </Link>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search restaurants..."
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
                            <MapPin className="h-4 w-4" />
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
                                    checked={columnVisibility.menu}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility((prev) => ({
                                            ...prev,
                                            menu: !!value,
                                        }))
                                    }
                                >
                                    Menu Items
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
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
                                    checked={columnVisibility.categories}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility((prev) => ({
                                            ...prev,
                                            categories: !!value,
                                        }))
                                    }
                                >
                                    Categories
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1200px]">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="h-12 px-4 text-left align-middle font-medium">
                                        Restaurant Name
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
                                    {columnVisibility.rating && (
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Rating
                                        </th>
                                    )}
                                    {columnVisibility.menu && (
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Menu Items
                                        </th>
                                    )}
                                    {columnVisibility.priceRange && (
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Price Range
                                        </th>
                                    )}
                                    {columnVisibility.categories && (
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Categories
                                        </th>
                                    )}
                                    <th className="h-12 px-4 text-left align-middle font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="h-64 text-center"
                                        >
                                            <Empty className="py-12">
                                                <EmptyHeader>
                                                    <EmptyMedia>
                                                        <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                                                    </EmptyMedia>
                                                    <EmptyTitle>
                                                        No Restaurants Found
                                                    </EmptyTitle>
                                                    <EmptyDescription>
                                                        {searchQuery ||
                                                        provinceFilter !==
                                                            "all" ||
                                                        ratingFilter !== "all"
                                                            ? "Try adjusting your filters to find what you're looking for."
                                                            : "Get started by adding your first restaurant."}
                                                    </EmptyDescription>
                                                </EmptyHeader>
                                                {!searchQuery &&
                                                    provinceFilter === "all" &&
                                                    ratingFilter === "all" && (
                                                        <EmptyContent>
                                                            <Link href="/restaurants/create">
                                                                <Button>
                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                    Add
                                                                    Restaurant
                                                                </Button>
                                                            </Link>
                                                        </EmptyContent>
                                                    )}
                                            </Empty>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((property) => (
                                        <tr
                                            key={
                                                property.restaurant_property_id
                                            }
                                            className="border-b transition-colors hover:bg-muted/50"
                                        >
                                            {/* Restaurant Name */}
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={
                                                                property.place
                                                                    .images_url?.[0] ||
                                                                "/placeholder.jpg"
                                                            }
                                                            alt={
                                                                property.place
                                                                    .name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/restaurants/${property.restaurant_property_id}`}
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
                                                            {property.owner
                                                                .name ||
                                                                "Unassigned"}
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

                                            {/* Menu Items */}
                                            {columnVisibility.menu && (
                                                <td className="p-4 align-middle">
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                property
                                                                    .menu_stats
                                                                    .available
                                                            }
                                                            /
                                                            {
                                                                property
                                                                    .menu_stats
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
                                                            {property.menu_stats
                                                                .price_range ||
                                                                "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Categories */}
                                            {columnVisibility.categories && (
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <ChefHat className="h-4 w-4 text-orange-600" />
                                                        <span className="font-medium">
                                                            {
                                                                property
                                                                    .menu_stats
                                                                    .categories_count
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Actions */}
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/restaurants/${property.restaurant_property_id}/edit`}
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
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    router.visit(
                                                                        `/restaurants/${property.restaurant_property_id}`
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    router.visit(
                                                                        `/restaurants/${property.restaurant_property_id}/edit`
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600">
                                                                <Trash className="mr-2 h-4 w-4" />
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

                {/* Pagination Footer */}
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
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === lastPage}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => setCurrentPage(lastPage)}
                                disabled={currentPage === lastPage}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
