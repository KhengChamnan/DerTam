import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    MapPin,
    Star,
    Clock,
    ExternalLink,
    Edit,
    Calendar,
    Image as ImageIcon,
    Users,
    ArrowLeft,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface Place {
    placeID: number;
    name: string;
    description: string;
    category?: {
        placeCategoryID: number;
        name: string;
    };
    province?: {
        province_categoryID: number;
        name: string;
    };
    ratings?: number | string; // Can be either due to data transformation
    reviews_count?: number;
    entry_free: boolean;
    images_url?: string[];
    latitude?: number | string | null; // Can be either due to data transformation
    longitude?: number | string | null; // Can be either due to data transformation
    google_maps_link?: string;
    operating_hours?: { [key: string]: string };
    best_season_to_visit?: string;
}

interface Props {
    place: Place;
    error?: string;
}

export default function PlaceShow({ place, error }: Props) {
    if (error || !place) {
        return (
            <AppLayout>
                <Head title="Place Not Found" />
                <div className="flex h-full flex-1 flex-col gap-4 p-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Place Not Found</h1>
                        <p className="text-muted-foreground mt-2">
                            {error ||
                                "The place you're looking for doesn't exist."}
                        </p>
                        <Link href="/places">
                            <Button className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Places
                            </Button>
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Places",
            href: "/places",
        },
        {
            title: place.name,
            href: "#",
        },
    ];

    const formatOperatingHours = (
        hours: { [key: string]: string } | undefined
    ) => {
        if (!hours) return {};

        const daysOrder = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ];
        const formattedHours: { [key: string]: string } = {};

        daysOrder.forEach((day) => {
            if (hours[day]) {
                formattedHours[day.charAt(0).toUpperCase() + day.slice(1)] =
                    hours[day];
            }
        });

        return formattedHours;
    };

    const operatingHours = formatOperatingHours(place.operating_hours);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={place.name} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {place.name}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {place.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/places">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Places
                            </Button>
                        </Link>
                        <Link href={`/places/${place.placeID}/edit`}>
                            <Button>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Place
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Location Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {place.category && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Category:
                                            </span>
                                            <Badge variant="secondary">
                                                {place.category.name}
                                            </Badge>
                                        </div>
                                    )}
                                    {place.province && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Province:
                                            </span>
                                            <Badge variant="outline">
                                                {place.province.name}
                                            </Badge>
                                        </div>
                                    )}
                                    {place.latitude && place.longitude && (
                                        <div className="flex items-center justify-between col-span-full">
                                            <span className="text-sm text-muted-foreground">
                                                Coordinates:
                                            </span>
                                            <span className="text-sm font-mono">
                                                {typeof place.latitude ===
                                                    "number" &&
                                                typeof place.longitude ===
                                                    "number"
                                                    ? `${place.latitude.toFixed(
                                                          6
                                                      )}, ${place.longitude.toFixed(
                                                          6
                                                      )}`
                                                    : `${place.latitude}, ${place.longitude}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Operating Hours */}
                        {Object.keys(operatingHours).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Operating Hours
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {Object.entries(operatingHours).map(
                                            ([day, hours]) => (
                                                <div
                                                    key={day}
                                                    className="flex items-center justify-between p-3 bg-muted/50 rounded"
                                                >
                                                    <span className="font-medium">
                                                        {day}:
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {hours || "Closed"}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Images */}
                        {place.images_url && place.images_url.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Images ({place.images_url.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {place.images_url.map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative group"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`${
                                                        place.name
                                                    } - Image ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded-lg transition-transform group-hover:scale-105"
                                                    onError={(e) => {
                                                        const target =
                                                            e.target as HTMLImageElement;
                                                        target.src =
                                                            "/api/placeholder/400/300";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Ratings & Reviews */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Ratings & Reviews
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Rating:
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-medium">
                                            {place.ratings &&
                                            typeof place.ratings === "number"
                                                ? place.ratings.toFixed(1)
                                                : place.ratings || "N/A"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Reviews:
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span className="font-medium">
                                            {place.reviews_count
                                                ? place.reviews_count.toLocaleString()
                                                : "0"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Entry Fee:
                                    </span>
                                    <Badge
                                        variant={
                                            place.entry_free
                                                ? "default"
                                                : "destructive"
                                        }
                                        className="text-xs"
                                    >
                                        {place.entry_free ? "Free" : "Paid"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Best Season */}
                        {place.best_season_to_visit && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Best Season to Visit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {place.best_season_to_visit}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {place.google_maps_link && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <a
                                            href={place.google_maps_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            View on Google Maps
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link
                                        href={`/places/${place.placeID}/edit`}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit Place
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
