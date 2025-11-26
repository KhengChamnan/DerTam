import React, { useState, useEffect, useRef } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ImportDialog from "@/components/ImportDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Plus,
    MapPin,
    Star,
    Edit,
    Trash2,
    Filter,
    Eye,
    MoreHorizontal,
    Upload,
    MapPinPlus,
    Settings2,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
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
import PlaceDetailsDialog from "@/components/place-details-dialog";
import { type BreadcrumbItem } from "@/types";
import { handleImageError, getSafeImageUrl } from "@/utils/imageUtils";
import { usePermissions } from "@/hooks/usePermissions";

interface Place {
    placeID: number;
    name: string;
    description: string;
    category: {
        placeCategoryID: number;
        name: string;
    };
    province: {
        province_categoryID: number;
        name: string;
    };
    ratings: number;
    reviews_count: number;
    entry_free: boolean;
    images_url: string[];
    latitude: number;
    longitude: number;
}

interface Category {
    placeCategoryID: number;
    name: string;
}

interface Province {
    province_categoryID: number;
    name: string;
}

interface Props {
    places: {
        data: Place[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    provinces: Province[];
    filters: {
        search?: string;
        category_id?: string;
        province_id?: string;
    };
}

interface ColumnVisibility {
    image: boolean;
    description: boolean;
    category: boolean;
    province: boolean;
    rating: boolean;
    reviews: boolean;
    entryFee: boolean;
}

export default function PlacesIndex({
    places,
    categories,
    provinces,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category_id || "all"
    );
    const [provinceFilter, setProvinceFilter] = useState(
        filters.province_id || "all"
    );
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Column visibility state with localStorage persistence
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
        () => {
            // Try to load saved preferences from localStorage
            const savedPreferences = localStorage.getItem(
                "placesTableColumnVisibility"
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
            // Default values if nothing saved
            return {
                image: true,
                description: true,
                category: true,
                province: true,
                rating: true,
                reviews: true,
                entryFee: true,
            };
        }
    );

    // Save column visibility preferences to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(
            "placesTableColumnVisibility",
            JSON.stringify(columnVisibility)
        );
    }, [columnVisibility]);

    // Use useRef to track if this is the initial mount
    const isInitialMount = useRef(true);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-search with debouncing for search term
    useEffect(() => {
        // Skip the initial mount
        if (isInitialMount.current) {
            return;
        }

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer for debounced search
        debounceTimer.current = setTimeout(() => {
            router.get(
                "/places",
                {
                    search: search || undefined,
                    category_id:
                        categoryFilter !== "all" ? categoryFilter : undefined,
                    province_id:
                        provinceFilter !== "all" ? provinceFilter : undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 500); // 500ms debounce

        // Cleanup function
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [search]);

    // Separate useEffect for filter changes (immediate)
    useEffect(() => {
        // Skip the initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            "/places",
            {
                search: search || undefined,
                category_id:
                    categoryFilter !== "all" ? categoryFilter : undefined,
                province_id:
                    provinceFilter !== "all" ? provinceFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [categoryFilter, provinceFilter]);

    // Update state when filters change from server (e.g., pagination)
    useEffect(() => {
        setSearch(filters.search || "");
        setCategoryFilter(filters.category_id || "all");
        setProvinceFilter(filters.province_id || "all");
    }, [filters.search, filters.category_id, filters.province_id]);

    // Permission checks
    const {
        canCreatePlaces,
        canEditPlaces,
        canDeletePlaces,
        canImportPlaces,
        user,
    } = usePermissions();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Places",
            href: "/places",
        },
    ];

    const handleDelete = (id: number) => {
        router.delete(`/places/${id}`, {
            onSuccess: () => {
                toast.success("Place deleted successfully");
            },
            onError: () => {
                toast.error("Failed to delete place");
            },
        });
    };

    const handleViewDetails = (place: Place) => {
        setSelectedPlace(place);
        setDialogOpen(true);
    };

    const clearFilters = () => {
        setSearch("");
        setCategoryFilter("all");
        setProvinceFilter("all");
        router.get("/places");
    };

    const getStatusBadge = (place: Place) => {
        if (place.ratings && place.ratings >= 4) {
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Excellent
                </Badge>
            );
        } else if (place.ratings && place.ratings >= 3) {
            return (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    Good
                </Badge>
            );
        } else if (place.ratings && place.ratings >= 2) {
            return (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Average
                </Badge>
            );
        } else {
            return (
                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                    New
                </Badge>
            );
        }
    };

    const getPriorityBadge = (place: Place) => {
        if (place.entry_free) {
            return (
                <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                >
                    Free
                </Badge>
            );
        } else {
            return (
                <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-200"
                >
                    Paid
                </Badge>
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Places" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Places
                        </h1>
                        <p className="text-muted-foreground">
                            Here's a list of your places
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canImportPlaces() && (
                            <ImportDialog
                                trigger={
                                    <Button variant="outline" className="gap-2">
                                        <Upload className="h-4 w-4" />
                                        Import
                                    </Button>
                                }
                            />
                        )}
                        {canCreatePlaces() && (
                            <Link href="/places/create">
                                <Button className="gap-2">
                                    <MapPinPlus className="h-4 w-4" />
                                    Create Place
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter places..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.placeCategoryID}
                                    value={category.placeCategoryID.toString()}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={provinceFilter}
                        onValueChange={setProvinceFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <MapPin className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Province" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Provinces</SelectItem>
                            {provinces.map((province) => (
                                <SelectItem
                                    key={province.province_categoryID}
                                    value={province.province_categoryID.toString()}
                                >
                                    {province.name}
                                </SelectItem>
                            ))}
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
                                checked={columnVisibility.image}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        image: !!value,
                                    }))
                                }
                            >
                                Image
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.description}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        description: !!value,
                                    }))
                                }
                            >
                                Description
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.category}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        category: !!value,
                                    }))
                                }
                            >
                                Category
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.province}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        province: !!value,
                                    }))
                                }
                            >
                                Province
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
                                checked={columnVisibility.reviews}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        reviews: !!value,
                                    }))
                                }
                            >
                                Reviews
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.entryFee}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        entryFee: !!value,
                                    }))
                                }
                            >
                                Entry Fee
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
                                className="grid gap-4 items-center"
                                style={{
                                    gridTemplateColumns: `${
                                        columnVisibility.image ? "1fr" : ""
                                    } 2fr ${
                                        columnVisibility.description
                                            ? "3fr"
                                            : ""
                                    } ${
                                        columnVisibility.category ? "2fr" : ""
                                    } ${
                                        columnVisibility.province ? "2fr" : ""
                                    } ${columnVisibility.rating ? "1fr" : ""} ${
                                        columnVisibility.reviews ? "1fr" : ""
                                    } ${
                                        columnVisibility.entryFee ? "1fr" : ""
                                    } 2fr`.trim(),
                                }}
                            >
                                {columnVisibility.image && (
                                    <div className="text-sm font-medium">
                                        Image
                                    </div>
                                )}
                                <div className="text-sm font-medium">Name</div>
                                {columnVisibility.description && (
                                    <div className="text-sm font-medium">
                                        Description
                                    </div>
                                )}
                                {columnVisibility.category && (
                                    <div className="text-sm font-medium">
                                        Category
                                    </div>
                                )}
                                {columnVisibility.province && (
                                    <div className="text-sm font-medium">
                                        Province
                                    </div>
                                )}
                                {columnVisibility.rating && (
                                    <div className="text-sm font-medium">
                                        Rating
                                    </div>
                                )}
                                {columnVisibility.reviews && (
                                    <div className="text-sm font-medium">
                                        Reviews
                                    </div>
                                )}
                                {columnVisibility.entryFee && (
                                    <div className="text-sm font-medium">
                                        Entry Fee
                                    </div>
                                )}
                                <div className="text-sm font-medium">
                                    Actions
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y">
                            {places.data.map((place) => (
                                <div
                                    key={place.placeID}
                                    className="p-4 hover:bg-muted/50"
                                >
                                    <div
                                        className="grid gap-4 items-center"
                                        style={{
                                            gridTemplateColumns: `${
                                                columnVisibility.image
                                                    ? "1fr"
                                                    : ""
                                            } 2fr ${
                                                columnVisibility.description
                                                    ? "3fr"
                                                    : ""
                                            } ${
                                                columnVisibility.category
                                                    ? "2fr"
                                                    : ""
                                            } ${
                                                columnVisibility.province
                                                    ? "2fr"
                                                    : ""
                                            } ${
                                                columnVisibility.rating
                                                    ? "1fr"
                                                    : ""
                                            } ${
                                                columnVisibility.reviews
                                                    ? "1fr"
                                                    : ""
                                            } ${
                                                columnVisibility.entryFee
                                                    ? "1fr"
                                                    : ""
                                            } 2fr`.trim(),
                                        }}
                                    >
                                        {columnVisibility.image && (
                                            <div>
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {place.images_url &&
                                                    place.images_url.length >
                                                        0 ? (
                                                        <img
                                                            src={getSafeImageUrl(
                                                                place
                                                                    .images_url[0],
                                                                48,
                                                                48
                                                            )}
                                                            alt={place.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) =>
                                                                handleImageError(
                                                                    e,
                                                                    48,
                                                                    48
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                                            <svg
                                                                className="w-6 h-6 text-gray-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium truncate">
                                                {place.name}
                                            </div>
                                        </div>
                                        {columnVisibility.description && (
                                            <div>
                                                <div
                                                    className="text-sm text-muted-foreground line-clamp-2"
                                                    title={place.description}
                                                >
                                                    {place.description}
                                                </div>
                                            </div>
                                        )}
                                        {columnVisibility.category && (
                                            <div>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {place.category?.name ||
                                                        "N/A"}
                                                </Badge>
                                            </div>
                                        )}
                                        {columnVisibility.province && (
                                            <div>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {place.province?.name ||
                                                        "N/A"}
                                                </Badge>
                                            </div>
                                        )}
                                        {columnVisibility.rating && (
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm">
                                                        {place.ratings || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {columnVisibility.reviews && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">
                                                    {place.reviews_count || 0}
                                                </span>
                                            </div>
                                        )}
                                        {columnVisibility.entryFee && (
                                            <div>
                                                <Badge
                                                    variant={
                                                        place.entry_free
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {place.entry_free
                                                        ? "Free"
                                                        : "Paid"}
                                                </Badge>
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/places/${place.placeID}/edit`}
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
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    place
                                                                )
                                                            }
                                                        >
                                                            View details
                                                            <Eye className="ml-2 h-4 w-4" />
                                                        </DropdownMenuItem>
                                                        {canEditPlaces() && (
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/places/${place.placeID}/edit`}
                                                                >
                                                                    Edit place
                                                                    <Edit className="ml-5 h-4 w-4" />
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDeletePlaces() && (
                                                            <>
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
                                                                            place
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
                                                                                place
                                                                                "
                                                                                {
                                                                                    place.name
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
                                                                                        place.placeID
                                                                                    )
                                                                                }
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing{" "}
                        {(places.current_page - 1) * places.per_page + 1} to{" "}
                        {Math.min(
                            places.current_page * places.per_page,
                            places.total
                        )}{" "}
                        of {places.total} row(s).
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(places.per_page)}
                                onValueChange={(value) => {
                                    router.get("/places", {
                                        ...filters,
                                        per_page: value,
                                        page: 1,
                                    });
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={String(places.per_page)}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="30">30</SelectItem>
                                    <SelectItem value="40">40</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {places.current_page} of {places.last_page}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get("/places", {
                                        ...filters,
                                        page: 1,
                                    })
                                }
                                disabled={places.current_page === 1}
                            >
                                <span className="sr-only">
                                    Go to first page
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <polyline points="11,17 6,12 11,7" />
                                    <polyline points="18,17 13,12 18,7" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    router.get("/places", {
                                        ...filters,
                                        page: places.current_page - 1,
                                    })
                                }
                                disabled={places.current_page === 1}
                            >
                                <span className="sr-only">
                                    Go to previous page
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <polyline points="15,18 9,12 15,6" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    router.get("/places", {
                                        ...filters,
                                        page: places.current_page + 1,
                                    })
                                }
                                disabled={
                                    places.current_page === places.last_page
                                }
                            >
                                <span className="sr-only">Go to next page</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <polyline points="9,18 15,12 9,6" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get("/places", {
                                        ...filters,
                                        page: places.last_page,
                                    })
                                }
                                disabled={
                                    places.current_page === places.last_page
                                }
                            >
                                <span className="sr-only">Go to last page</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <polyline points="13,17 18,12 13,7" />
                                    <polyline points="6,17 11,12 6,7" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Place Details Dialog */}
            <PlaceDetailsDialog
                place={selectedPlace}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </AppLayout>
    );
}
