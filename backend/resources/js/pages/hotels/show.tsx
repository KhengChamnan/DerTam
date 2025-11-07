import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    Edit,
    MapPin,
    Star,
    Users,
    DollarSign,
    Bed,
    Mail,
    Phone,
    Calendar,
    TrendingUp,
} from "lucide-react";

interface Place {
    placeID: number;
    name: string;
    description: string;
    google_maps_link: string;
    ratings: number;
    reviews_count: number;
    images_url: string[];
    entry_free: boolean;
    operating_hours: string | Record<string, any>;
    latitude: number;
    longitude: number;
    province_id: number;
    category_id: number;
    provinceCategory?: {
        province_categoryID: number;
        province_categoryName: string;
        category_description: string;
    };
    category?: {
        placeCategoryID: number;
        category_name: string;
        category_description: string;
    };
}

interface Owner {
    id: number;
    name: string;
    email: string;
    phone_number: string;
}

interface Facility {
    facility_id: number;
    facility_name: string;
    image_url: string;
}

interface Amenity {
    amenity_id: number;
    amenity_name: string;
    image_url: string;
}

interface Room {
    room_properties_id: number;
    room_type: string;
    room_description: string;
    max_guests: number;
    room_size: number;
    price_per_night: number;
    images_url: string[];
    amenities: Amenity[];
    available_rooms_count: number;
    total_rooms_count: number;
}

interface Property {
    property_id: number;
    place: Place;
    owner: Owner;
    facilities: Facility[];
    rooms: Room[];
    created_at: string;
    updated_at: string;
}

interface BookingStats {
    total_bookings: number;
    confirmed_bookings: number;
    pending_bookings: number;
    total_revenue: number;
}

interface Props {
    property: Property;
    bookingStats: BookingStats;
}

export default function HotelShow({ property, bookingStats }: Props) {
    const availableRooms = property.rooms.reduce(
        (sum, room) => sum + room.available_rooms_count,
        0
    );
    const totalRooms = property.rooms.reduce(
        (sum, room) => sum + room.total_rooms_count,
        0
    );
    const priceRange =
        property.rooms.length > 0
            ? `$${Math.min(
                  ...property.rooms.map((r) => r.price_per_night)
              ).toFixed(2)} - $${Math.max(
                  ...property.rooms.map((r) => r.price_per_night)
              ).toFixed(2)}`
            : "N/A";

    // Format operating hours
    const formatOperatingHours = (
        hours: string | Record<string, any>
    ): string => {
        if (typeof hours === "string") {
            return hours;
        }
        if (typeof hours === "object" && hours !== null) {
            return JSON.stringify(hours, null, 2);
        }
        return "N/A";
    };

    return (
        <AppLayout>
            <Head title={`Hotel: ${property.place.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">
                                {property.place.name}
                            </h1>
                        </div>
                    </div>
                    <Link href="/hotels">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Hotels
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Hotel Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hotel Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-xs text-muted-foreground">
                                        Description
                                    </h4>
                                    <p className="text-sm font-medium leading-relaxed">
                                        {property.place.description}
                                    </p>
                                </div>

                                {/* Location & Details Section */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-4">
                                        Location & Details
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground">
                                                Province
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">
                                                    {property.place
                                                        .provinceCategory
                                                        ?.province_categoryName ||
                                                        "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground">
                                                Rating
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                <span className="text-sm font-medium">
                                                    {property.place.ratings} (
                                                    {
                                                        property.place
                                                            .reviews_count
                                                    }
                                                    )
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground">
                                                Total Rooms
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Bed className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">
                                                    {totalRooms} (
                                                    {availableRooms} available)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground">
                                                Price Range
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">
                                                    {priceRange}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <h4 className="text-xs text-muted-foreground">
                                            Category
                                        </h4>
                                        <span className="text-sm font-medium">
                                            {property.place.category
                                                ?.category_name || "N/A"}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-muted-foreground">
                                            Operating Hours
                                        </h4>
                                        {property.place?.operating_hours && (
                                            <div className="text-sm space-y-1">
                                                {typeof property.place
                                                    .operating_hours ===
                                                "string" ? (
                                                    <p className="text-muted-foreground">
                                                        {
                                                            property.place
                                                                .operating_hours
                                                        }
                                                    </p>
                                                ) : typeof property.place
                                                      .operating_hours ===
                                                  "object" ? (
                                                    Object.entries(
                                                        property.place
                                                            .operating_hours
                                                    ).map(([day, hours]) => (
                                                        <div key={day}>
                                                            <span className="font-medium capitalize">
                                                                {day}:
                                                            </span>{" "}
                                                            {hours}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted-foreground">
                                                        Operating hours
                                                        available
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {property.place.google_maps_link && (
                                            <div>
                                                <h4 className="text-xs text-muted-foreground">
                                                    Location
                                                </h4>
                                                <a
                                                    href={
                                                        property.place
                                                            .google_maps_link
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className=" hover:underline text-sm inline-flex items-center gap-1"
                                                >
                                                    <MapPin className="h-3 w-3" />
                                                    View on Google Maps
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Facilities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hotel Facilities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {property.facilities.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {property.facilities.map((facility) => (
                                            <div
                                                key={facility.facility_id}
                                                className="flex items-center space-x-2"
                                            >
                                                <Badge variant="secondary">
                                                    {facility.facility_name}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">
                                        No facilities listed
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rooms */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Room Properties</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {property.rooms.map((room) => (
                                    <div
                                        key={room.room_properties_id}
                                        className="border rounded-lg p-4 space-y-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">
                                                    {room.room_type}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {room.room_description}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    room.available_rooms_count >
                                                    0
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {room.available_rooms_count > 0
                                                    ? `${room.available_rooms_count} Available`
                                                    : "Unavailable"}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Max Guests:
                                                </span>
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {room.max_guests}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Size:
                                                </span>
                                                <div>
                                                    {room.room_size
                                                        ? `${room.room_size} sq ft`
                                                        : "N/A"}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Price:
                                                </span>
                                                <div className="flex items-center font-medium">
                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                    {room.price_per_night}/night
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Total Rooms:
                                                </span>
                                                <div className="font-medium">
                                                    {room.total_rooms_count}
                                                </div>
                                            </div>
                                        </div>

                                        {room.amenities.length > 0 && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">
                                                    Amenities:
                                                </span>
                                                <div className="flex flex-wrap gap-1 mt-1">
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
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Owner Information */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Property Owner</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <h4 className="font-medium">
                                        {property.owner.name}
                                    </h4>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3 mr-2" />
                                    {property.owner.email}
                                </div>
                                {property.owner.phone_number && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Phone className="h-3 w-3 mr-2" />
                                        {property.owner.phone_number}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Hotel Pictures</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {property.place.images_url &&
                                property.place.images_url.length > 0 ? (
                                    <div className="space-y-3">
                                        {/* Main Image */}
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                            <img
                                                src={
                                                    property.place.images_url[0]
                                                }
                                                alt={property.place.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Thumbnail Grid */}
                                        {property.place.images_url.length >
                                            1 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {property.place.images_url
                                                    .slice(1, 4)
                                                    .map((image, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative aspect-square overflow-hidden rounded-md"
                                                        >
                                                            <img
                                                                src={image}
                                                                alt={`${
                                                                    property
                                                                        .place
                                                                        .name
                                                                } ${index + 2}`}
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                            />
                                                        </div>
                                                    ))}
                                            </div>
                                        )}

                                        {property.place.images_url.length >
                                            4 && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                +
                                                {property.place.images_url
                                                    .length - 4}{" "}
                                                more photos
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center aspect-video bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                            No photos available
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
