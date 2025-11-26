import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    MapPin,
    Star,
    Users,
    DollarSign,
    Settings,
    Plus,
    Eye,
    Bed,
    Wifi,
    Coffee,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface Property {
    property_id: number;
    place?: {
        placeID: number;
        name: string;
        description: string;
        ratings: number;
        reviews_count: number;
        images_url?: string[];
        google_maps_link?: string;
        operating_hours?: string | { [key: string]: string };
    };
    roomProperties?: Array<{
        room_properties_id: number;
        room_type: string;
        room_description?: string;
        max_guests: number;
        room_size?: string;
        price_per_night: number;
        is_available: boolean;
        images_url?: string[];
        amenities?: Array<{
            amenity_id: number;
            amenity_name: string;
            image_url?: string;
        }>;
    }>;
    facilities?: Array<{
        facility_id: number;
        facility_name: string;
    }>;
}

interface Analytics {
    rooms_count: number;
    bookings_count: number;
    total_revenue: number;
}

interface Props {
    property?: Property;
    analytics?: Analytics;
}

export default function HotelOwnerPropertyShow({
    property = {
        property_id: 0,
        place: undefined,
        roomProperties: [],
        facilities: [],
    },
    analytics = { rooms_count: 0, bookings_count: 0, total_revenue: 0 },
}: Props) {
    const roomProperties = property.roomProperties || [];
    const facilities = property.facilities || [];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/hotel-owner/dashboard",
        },
        {
            title: "My Hotel",
            href: "/hotel-owner/properties",
        },
        {
            title: property.place?.name || "Property Details",
            href: `/hotel-owner/properties/${property.property_id}`,
        },
    ];

    const averagePrice =
        roomProperties.length > 0
            ? roomProperties.reduce(
                  (sum, room) => sum + room.price_per_night,
                  0
              ) / roomProperties.length
            : 0;

    const availableRooms = roomProperties.filter(
        (room) => room.is_available
    ).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${
                    property.place?.name || "Property"
                } - Property Details`}
            />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 jus">
                        <div>
                            <h1 className="text-3xl font-bold">
                                {property.place?.name || "Unknown Property"}
                            </h1>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>
                                        {property.place?.ratings || 0} (
                                        {property.place?.reviews_count || 0}{" "}
                                        reviews)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/hotel-owner/properties">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Property
                        </Link>
                    </Button>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Rooms
                            </CardTitle>
                            <Bed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analytics.rooms_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {availableRooms} available
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Bookings
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analytics.bookings_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${analytics.total_revenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                From this property
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg. Price
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${Math.round(averagePrice)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                per night
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Property Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Images */}
                        {property.place?.images_url &&
                            property.place.images_url.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Property Images</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {property.place.images_url
                                                .slice(0, 4)
                                                .map((image, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative h-48 rounded-lg overflow-hidden"
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={`${
                                                                property.place
                                                                    ?.name ||
                                                                "Property"
                                                            } ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                        </div>
                                        {property.place.images_url.length >
                                            4 && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                +
                                                {property.place.images_url
                                                    .length - 4}{" "}
                                                more images
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About This Property</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground leading-relaxed">
                                    {property.place?.description ||
                                        "No description available"}
                                </p>

                                {property.place?.operating_hours && (
                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium mb-2">
                                            Operating Hours
                                        </h4>
                                        <p className="text-muted-foreground">
                                            {typeof property.place
                                                .operating_hours === "string"
                                                ? property.place.operating_hours
                                                : typeof property.place
                                                      .operating_hours ===
                                                  "object"
                                                ? Object.entries(
                                                      property.place
                                                          .operating_hours
                                                  )
                                                      .map(
                                                          ([day, hours]) =>
                                                              `${day}: ${hours}`
                                                      )
                                                      .join(", ")
                                                : "Operating hours available"}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rooms */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Room Types</CardTitle>
                                    <Button size="sm" asChild>
                                        <Link href={`/hotel-owner/properties`}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Go to My Hotels
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {roomProperties.map((room) => (
                                        <div
                                            key={room.room_properties_id}
                                            className="border rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-medium">
                                                        {room.room_type}
                                                    </h4>
                                                    {room.room_description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                room.room_description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">
                                                        ${room.price_per_night}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        per night
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                <span>
                                                    Max {room.max_guests} guests
                                                </span>
                                                {room.room_size && (
                                                    <span>
                                                        {room.room_size}
                                                    </span>
                                                )}
                                                <Badge
                                                    variant={
                                                        room.is_available
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {room.is_available
                                                        ? "Available"
                                                        : "Unavailable"}
                                                </Badge>
                                            </div>

                                            {room.amenities &&
                                                room.amenities.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {room.amenities.map(
                                                            (amenity) => (
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
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    ))}
                                </div>
                                {roomProperties.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Bed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No rooms configured yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Facilities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Facilities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {facilities.map((facility) => (
                                        <div
                                            key={facility.facility_id}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <span className="text-sm">
                                                {facility.facility_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {facilities.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No facilities added yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Property Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Property Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">
                                        Total Rooms:
                                    </span>
                                    <span className="text-sm font-medium">
                                        {roomProperties.length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Available:</span>
                                    <span className="text-sm font-medium">
                                        {availableRooms}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Occupancy:</span>
                                    <span className="text-sm font-medium">
                                        {roomProperties.length > 0
                                            ? Math.round(
                                                  ((roomProperties.length -
                                                      availableRooms) /
                                                      roomProperties.length) *
                                                      100
                                              )
                                            : 0}
                                        %
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
