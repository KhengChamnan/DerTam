import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hotel, Eye, Settings, Users, MapPin, Star } from "lucide-react";

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
    roomProperties?: Array<{
        room_properties_id: number;
        room_type: string;
        price_per_night: number;
        is_available: boolean;
    }>;
    facilities?: Array<{
        facility_id: number;
        facility_name: string;
    }>;
}

interface PaginatedProperties {
    data: Property[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    properties?: PaginatedProperties;
}

export default function HotelOwnerPropertiesIndex({
    properties = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        links: [],
    },
}: Props) {
    return (
        <AppLayout>
            <Head title="My Properties" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            My Hotel Properties
                        </h1>
                        <p className="text-muted-foreground">
                            Manage and monitor your hotel properties
                        </p>
                    </div>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.data.map((property) => {
                        const roomProperties = property.roomProperties || [];
                        const facilities = property.facilities || [];
                        const images = property.place?.images_url || [];
                        const availableRooms = roomProperties.filter(
                            (room) => room.is_available
                        );
                        const prices = roomProperties.map(
                            (room) => room.price_per_night
                        );
                        const minPrice =
                            prices.length > 0 ? Math.min(...prices) : 0;
                        const maxPrice =
                            prices.length > 0 ? Math.max(...prices) : 0;

                        return (
                            <Card
                                key={property.property_id}
                                className="hover:shadow-lg transition-shadow"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">
                                                {property.place?.name ||
                                                    "Unknown Property"}
                                            </CardTitle>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium">
                                                        {property.place
                                                            ?.ratings || 0}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    (
                                                    {property.place
                                                        ?.reviews_count ||
                                                        0}{" "}
                                                    reviews)
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="outline">
                                            <Hotel className="h-3 w-3 mr-1" />
                                            Hotel
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Property Image */}
                                    {images.length > 0 && (
                                        <div className="relative h-32 rounded-md overflow-hidden">
                                            <img
                                                src={images[0]}
                                                alt={
                                                    property.place?.name ||
                                                    "Property"
                                                }
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Property Description */}
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {property.place?.description ||
                                            "No description available"}
                                    </p>

                                    {/* Property Stats */}
                                    <div className="grid grid-cols-2 gap-4 py-2">
                                        <div className="text-center">
                                            <div className="text-lg font-semibold">
                                                {roomProperties.length}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Total Rooms
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-semibold">
                                                {availableRooms.length}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Available
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    {roomProperties.length > 0 && (
                                        <div className="text-center py-2 border-t">
                                            <div className="text-sm font-medium">
                                                {minPrice === maxPrice
                                                    ? `$${minPrice}`
                                                    : `From $${minPrice} - $${maxPrice}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                per night
                                            </div>
                                        </div>
                                    )}

                                    {/* Facilities */}
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">
                                            Facilities
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {facilities
                                                .slice(0, 3)
                                                .map((facility) => (
                                                    <Badge
                                                        key={
                                                            facility.facility_id
                                                        }
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {facility.facility_name}
                                                    </Badge>
                                                ))}
                                            {facilities.length > 3 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    +{facilities.length - 3}{" "}
                                                    more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            asChild
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <Link
                                                href={`/hotel-owner/properties/${property.property_id}`}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <Link
                                                href={`/hotel-owner/properties/${property.property_id}/rooms`}
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                Manage Rooms
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {properties.data.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Hotel className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">
                                No Properties Assigned
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                You don't have any hotel properties assigned to
                                your account yet.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Contact your administrator to get hotel
                                properties assigned to your account.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {properties.last_page > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                        {properties.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                asChild={!!link.url}
                                disabled={!link.url}
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
