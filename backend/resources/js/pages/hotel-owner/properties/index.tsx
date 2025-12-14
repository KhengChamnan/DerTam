import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from "@/components/ui/empty";
import {
    Hotel,
    Eye,
    Settings,
    Users,
    MapPin,
    Star,
    Bed,
    DollarSign,
    DoorOpen,
    Pencil,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface RoomProperty {
    room_properties_id: number;
    room_type: string;
    room_description?: string;
    max_guests: number;
    room_size?: string;
    price_per_night: number;
    images_url?: string;
    rooms?: Array<{
        room_id: number;
        room_number: string;
        is_available: boolean;
        status: string;
    }>;
    amenities?: Array<{
        amenity_id: number;
        amenity_name: string;
    }>;
}

interface Property {
    property_id: number;
    place?: {
        placeID: number;
        name: string;
        description: string;
        ratings: number;
        reviews_count: number;
        images_url?: string[];
    };
    room_properties?: RoomProperty[];
    facilities?: Array<{
        facility_id: number;
        facility_name: string;
    }>;
}

interface Props {
    property?: Property;
}

const emptyBreadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/hotel-owner/dashboard",
    },
    {
        title: "My Hotel",
        href: "/hotel-owner/properties",
    },
];

export default function HotelOwnerPropertiesIndex({ property }: Props) {
    if (!property) {
        return (
            <AppLayout breadcrumbs={emptyBreadcrumbs}>
                <Head title="My Hotel" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Hotel className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No Property Assigned</EmptyTitle>
                            <EmptyDescription>
                                You don't have a hotel property assigned to your
                                account yet. Contact your administrator to get a
                                hotel property assigned to your account.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            </AppLayout>
        );
    }

    const roomProperties = property.room_properties || [];
    const facilities = property.facilities || [];
    const images = property.place?.images_url || [];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/hotel-owner/dashboard",
        },
        {
            title: property.place?.name || "My Hotel",
            href: "/hotel-owner/properties",
        },
    ];

    const totalRooms = roomProperties.reduce(
        (sum, rp) => sum + (rp.rooms?.length || 0),
        0
    );
    const availableRooms = roomProperties.reduce(
        (sum, rp) =>
            sum + (rp.rooms?.filter((r) => r.is_available).length || 0),
        0
    );
    const prices = roomProperties.map((rp) => rp.price_per_night);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${property.place?.name || "My Hotel"}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {property.place?.name || "My Hotel"}
                        </h1>
                        <p className="text-muted-foreground">
                            Manage and monitor your hotel property
                        </p>
                    </div>
                    <Badge variant="outline" className="h-fit">
                        <Hotel className="h-4 w-4 mr-2" />
                        Hotel
                    </Badge>
                </div>

                {/* Hotel Info Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Image */}
                            {images.length > 0 && (
                                <div className="relative h-64 rounded-lg overflow-hidden">
                                    <img
                                        src={images[0]}
                                        alt={property.place?.name || "Hotel"}
                                        className="w-full h-full object-cover"
                                    />
                                    {images.length > 1 && (
                                        <Badge className="absolute bottom-2 right-2">
                                            +{images.length - 1} more photos
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Details */}
                            <div className="space-y-4">
                                {/* Rating */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xl font-semibold">
                                            {property.place?.ratings || 0}
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        ({property.place?.reviews_count || 0}{" "}
                                        reviews)
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-muted-foreground">
                                    {property.place?.description ||
                                        "No description available"}
                                </p>

                                {/* Facilities */}
                                {facilities.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">
                                            Facilities
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {facilities.map((facility) => (
                                                <Badge
                                                    key={facility.facility_id}
                                                    variant="secondary"
                                                >
                                                    {facility.facility_name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Room Types
                            </CardTitle>
                            <Bed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {roomProperties.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Different room categories
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Rooms
                            </CardTitle>
                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalRooms}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Individual room units
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Available Rooms
                            </CardTitle>
                            <DoorOpen className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {availableRooms}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Ready for booking
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Price Range
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {minPrice === maxPrice
                                    ? `$${minPrice}`
                                    : `$${minPrice}-${maxPrice}`}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                per night
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Room Types Section */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Room Types</h2>
                    <Button asChild>
                        <Link
                            href={`/hotel-owner/properties/${property.property_id}/room-properties/create`}
                        >
                            <Bed className="h-4 w-4 mr-2" />
                            Add New Room Type
                        </Link>
                    </Button>
                </div>

                {roomProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roomProperties.map((roomType) => {
                            const typeRooms = roomType.rooms || [];
                            const typeAvailable = typeRooms.filter(
                                (r) => r.is_available
                            ).length;

                            return (
                                <Card
                                    key={roomType.room_properties_id}
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    {/* Image Display */}
                                    {roomType.images_url &&
                                        (() => {
                                            try {
                                                // Handle both array and string formats
                                                const images =
                                                    typeof roomType.images_url ===
                                                    "string"
                                                        ? JSON.parse(
                                                              roomType.images_url
                                                          )
                                                        : roomType.images_url;

                                                return Array.isArray(images) &&
                                                    images.length > 0 ? (
                                                    <div className="h-48 overflow-hidden bg-muted">
                                                        <img
                                                            src={images[0]}
                                                            alt={
                                                                roomType.room_type
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : null;
                                            } catch (e) {
                                                console.error(
                                                    "Error parsing room images:",
                                                    e
                                                );
                                                return null;
                                            }
                                        })()}

                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1">
                                                <CardTitle className="text-lg">
                                                    {roomType.room_type}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {roomType.room_description ||
                                                        "No description"}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    typeAvailable > 0
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {typeAvailable}/
                                                {typeRooms.length}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Price
                                                </p>
                                                <p className="font-semibold">
                                                    ${roomType.price_per_night}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Guests
                                                </p>
                                                <p className="font-semibold">
                                                    {roomType.max_guests}
                                                </p>
                                            </div>
                                            {roomType.room_size && (
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        Size
                                                    </p>
                                                    <p className="font-semibold">
                                                        {roomType.room_size}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Total Rooms
                                                </p>
                                                <p className="font-semibold">
                                                    {typeRooms.length}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Amenities */}
                                        {roomType.amenities &&
                                            roomType.amenities.length > 0 && (
                                                <div className="space-y-2 pt-2 border-t">
                                                    <p className="text-sm font-medium">
                                                        Amenities
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {roomType.amenities
                                                            .slice(0, 3)
                                                            .map((amenity) => (
                                                                <Badge
                                                                    key={
                                                                        amenity.amenity_id
                                                                    }
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        amenity.amenity_name
                                                                    }
                                                                </Badge>
                                                            ))}
                                                        {roomType.amenities
                                                            .length > 3 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                +
                                                                {roomType
                                                                    .amenities
                                                                    .length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2 border-t">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <Link
                                                    href={`/hotel-owner/properties/${property.property_id}/room-properties/${roomType.room_properties_id}/edit`}
                                                >
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit Room Type
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Bed className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No Room Types Configured</EmptyTitle>
                            <EmptyDescription>
                                Start by adding room types to your hotel
                                property.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button asChild>
                                <Link
                                    href={`/hotel-owner/properties/${property.property_id}/room-properties/create`}
                                >
                                    <Bed className="h-4 w-4 mr-2" />
                                    Add Your First Room Type
                                </Link>
                            </Button>
                        </EmptyContent>
                    </Empty>
                )}
            </div>
        </AppLayout>
    );
}
