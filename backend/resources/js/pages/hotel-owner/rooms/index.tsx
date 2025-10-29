import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Plus,
    Bed,
    Users,
    DollarSign,
    Edit3,
    Settings,
    Eye,
} from "lucide-react";

interface Room {
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
    created_at: string;
    updated_at: string;
}

interface Property {
    property_id: number;
    place?: {
        placeID: number;
        name: string;
        description: string;
        ratings: number;
        reviews_count: number;
    };
    roomProperties?: Room[];
}

interface Props {
    property?: Property;
}

export default function HotelOwnerRoomsIndex({
    property = {
        property_id: 0,
        place: undefined,
        roomProperties: [],
    },
}: Props) {
    const roomProperties = property.roomProperties || [];

    return (
        <AppLayout>
            <Head
                title={`${
                    property.place?.name || "Property"
                } - Room Management`}
            />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Room Management</h1>
                        <p className="text-muted-foreground">
                            {property.place?.name || "Unknown Property"} -
                            Manage room types and availability
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild>
                            <Link
                                href={`/hotel-owner/properties/${property.property_id}`}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Detail
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={`/hotel-owner/properties/${property.property_id}/rooms/create`}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Room Type
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Room Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Room Types
                            </CardTitle>
                            <Bed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {roomProperties.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Configured room types
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Available Rooms
                            </CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    roomProperties.filter(
                                        (room) => room.is_available
                                    ).length
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently available
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Average Price
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                $
                                {roomProperties.length > 0
                                    ? Math.round(
                                          roomProperties.reduce(
                                              (sum, room) =>
                                                  sum + room.price_per_night,
                                              0
                                          ) / roomProperties.length
                                      )
                                    : 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                per night
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Max Capacity
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {roomProperties.reduce(
                                    (sum, room) => sum + room.max_guests,
                                    0
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                total guests
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Rooms List */}
                <div className="space-y-4">
                    {roomProperties.map((room) => (
                        <Card
                            key={room.room_properties_id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">
                                            {room.room_type}
                                        </CardTitle>
                                        {room.room_description && (
                                            <p className="text-muted-foreground">
                                                {room.room_description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/hotel-owner/properties/${property.property_id}/rooms/${room.room_properties_id}/edit`}
                                            >
                                                <Edit3 className="h-4 w-4 mr-2" />
                                                Edit
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Room Image */}
                                {room.images_url &&
                                    room.images_url.length > 0 && (
                                        <div className="relative h-48 rounded-md overflow-hidden">
                                            <img
                                                src={room.images_url[0]}
                                                alt={room.room_type}
                                                className="w-full h-full object-cover"
                                            />
                                            {room.images_url.length > 1 && (
                                                <Badge className="absolute top-2 right-2">
                                                    +
                                                    {room.images_url.length - 1}{" "}
                                                    more
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                {/* Room Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            Max Guests
                                        </div>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Users className="h-3 w-3" />
                                            {room.max_guests} guests
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            Room Size
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {room.room_size || "Not specified"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            Price per Night
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-semibold">
                                            <DollarSign className="h-3 w-3" />
                                            {room.price_per_night}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            Status
                                        </div>
                                        <Badge
                                            variant={
                                                room.is_available
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className="text-xs"
                                        >
                                            {room.is_available
                                                ? "Available"
                                                : "Unavailable"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Amenities */}
                                {room.amenities &&
                                    room.amenities.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium">
                                                Amenities
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {room.amenities
                                                    .slice(0, 6)
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
                                                {room.amenities.length > 6 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        +
                                                        {room.amenities.length -
                                                            6}{" "}
                                                        more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button asChild size="sm" variant="outline">
                                        <Link
                                            href={`/hotel-owner/properties/${property.property_id}/rooms/${room.room_properties_id}`}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline">
                                        <Link
                                            href={`/hotel-owner/properties/${property.property_id}/rooms/${room.room_properties_id}/edit`}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Manage
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {roomProperties.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Bed className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">
                                No Room Types Configured
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                You haven't set up any room types for this
                                property yet.
                            </p>
                            <Button asChild>
                                <Link
                                    href={`/hotel-owner/properties/${property.property_id}/rooms/create`}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Room Type
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
