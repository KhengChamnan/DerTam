import React from "react";
import { Link } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    Star,
    Clock,
    ExternalLink,
    Edit,
    Calendar,
    Image as ImageIcon,
    Users,
} from "lucide-react";

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

interface PlaceDetailsDialogProps {
    place: Place | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PlaceDetailsDialog({
    place,
    open,
    onOpenChange,
}: PlaceDetailsDialogProps) {
    if (!place) return null;

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {place.name}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        {place.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Location Details
                            </h3>
                            <div className="space-y-1">
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
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Coordinates:
                                        </span>
                                        <span className="text-sm font-mono">
                                            {typeof place.latitude ===
                                                "number" &&
                                            typeof place.longitude === "number"
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
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Ratings & Reviews
                            </h3>
                            <div className="space-y-1">
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
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Operating Hours */}
                    {Object.keys(operatingHours).length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Operating Hours
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(operatingHours).map(
                                    ([day, hours]) => (
                                        <div
                                            key={day}
                                            className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                        >
                                            <span className="text-sm font-medium">
                                                {day}:
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {hours || "Closed"}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Best Season to Visit */}
                    {place.best_season_to_visit && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Best Season to Visit
                                </h3>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                    {place.best_season_to_visit}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Images */}
                    {place.images_url && place.images_url.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    Images ({place.images_url.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {place.images_url
                                        .slice(0, 6)
                                        .map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative group"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`${
                                                        place.name
                                                    } - Image ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                                                    onError={(e) => {
                                                        const target =
                                                            e.target as HTMLImageElement;
                                                        target.src =
                                                            "/api/placeholder/300/200";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                            </div>
                                        ))}
                                </div>
                                {place.images_url.length > 6 && (
                                    <p className="text-sm text-muted-foreground text-center">
                                        +{place.images_url.length - 6} more
                                        images
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {place.google_maps_link && (
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1"
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
                        <Button asChild variant="outline" className="flex-1">
                            <Link
                                href={`/places/${place.placeID}/edit`}
                                className="flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Place
                            </Link>
                        </Button>
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
