import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";
import PlaceDetailsDialog from "@/components/place-details-dialog";
import { type BreadcrumbItem } from "@/types";

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
    const [selectedPlaces, setSelectedPlaces] = useState<number[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Places",
            href: "/places",
        },
    ];

    const handleFilter = () => {
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
            }
        );
    };

    const handleDelete = (id: number) => {
        router.delete(`/places/${id}`, {
            onSuccess: () => {
                // Handle success
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

    const toggleSelectPlace = (placeId: number) => {
        setSelectedPlaces((prev) =>
            prev.includes(placeId)
                ? prev.filter((id) => id !== placeId)
                : [...prev, placeId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedPlaces.length === places.data.length) {
            setSelectedPlaces([]);
        } else {
            setSelectedPlaces(places.data.map((place) => place.placeID));
        }
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
                        <Button variant="outline">Import</Button>
                        <Link href="/places/create">
                            <Button>Create Place</Button>
                        </Link>
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
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleFilter()
                            }
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
                </div>

                {/* Table-like layout */}
                <div className="rounded-md border overflow-x-auto">
                    <div className="min-w-[1400px]">
                        {/* Table Header */}
                        <div className="border-b bg-muted/50 p-4">
                            <div className="grid grid-cols-16 gap-4 items-center">
                                <div className="col-span-1 text-sm font-medium">
                                    <Checkbox
                                        checked={
                                            selectedPlaces.length ===
                                                places.data.length &&
                                            places.data.length > 0
                                        }
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </div>
                                <div className="col-span-1 text-sm font-medium">
                                    ID
                                </div>
                                <div className="col-span-2 text-sm font-medium">
                                    Name
                                </div>
                                <div className="col-span-3 text-sm font-medium">
                                    Description
                                </div>
                                <div className="col-span-2 text-sm font-medium">
                                    Category
                                </div>
                                <div className="col-span-2 text-sm font-medium">
                                    Province
                                </div>
                                <div className="col-span-1 text-sm font-medium">
                                    Rating
                                </div>
                                <div className="col-span-1 text-sm font-medium">
                                    Reviews
                                </div>
                                <div className="col-span-1 text-sm font-medium">
                                    Entry Fee
                                </div>
                                <div className="col-span-2 text-sm font-medium">
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
                                    <div className="grid grid-cols-16 gap-4 items-center">
                                        <div className="col-span-1">
                                            <Checkbox
                                                checked={selectedPlaces.includes(
                                                    place.placeID
                                                )}
                                                onCheckedChange={() =>
                                                    toggleSelectPlace(
                                                        place.placeID
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Link
                                                href={`/places/${place.placeID}`}
                                                className="font-medium text-blue-600 hover:underline"
                                            >
                                                {place.placeID}
                                            </Link>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="font-medium truncate">
                                                {place.name}
                                            </div>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="text-sm text-muted-foreground truncate">
                                                {place.description}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {place.category?.name || "N/A"}
                                            </Badge>
                                        </div>
                                        <div className="col-span-2">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {place.province?.name || "N/A"}
                                            </Badge>
                                        </div>
                                        <div className="col-span-1">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm">
                                                    {place.ratings || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <span className="text-sm text-muted-foreground">
                                                {place.reviews_count || 0}
                                            </span>
                                        </div>
                                        <div className="col-span-1">
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
                                        <div className="col-span-2">
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
                                                                    Delete place
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
                                                                        place "
                                                                        {
                                                                            place.name
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
                        {selectedPlaces.length} of {places.total} row(s)
                        selected.
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Rows per page</span>
                            <Select
                                value={places.per_page.toString()}
                                onValueChange={(value) => {
                                    router.get("/places", {
                                        ...filters,
                                        per_page: value,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-16">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-sm">
                            Page {places.current_page} of {places.last_page}
                        </div>

                        {places.last_page > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={places.current_page === 1}
                                    onClick={() =>
                                        router.get("/places", {
                                            ...filters,
                                            page: places.current_page - 1,
                                        })
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        places.current_page === places.last_page
                                    }
                                    onClick={() =>
                                        router.get("/places", {
                                            ...filters,
                                            page: places.current_page + 1,
                                        })
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        )}
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
