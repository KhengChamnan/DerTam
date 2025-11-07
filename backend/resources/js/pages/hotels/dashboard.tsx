import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    MapPin,
    Users,
    DollarSign,
    TrendingUp,
    Calendar,
    Bed,
    Star,
    Eye,
} from "lucide-react";

interface Stats {
    total_properties: number;
    total_rooms: number;
    available_rooms: number;
    total_bookings: number;
    confirmed_bookings: number;
    pending_bookings: number;
    total_revenue: number;
}

interface Property {
    property_id: number;
    place: {
        placeID: number;
        name: string;
    };
    ownerUser: {
        id: number;
        name: string;
    };
    created_at: string;
    booking_count?: number;
}

interface Props {
    stats: Stats;
    recentProperties: Property[];
    topProperties: Property[];
}

export default function HotelDashboard({
    stats,
    recentProperties,
    topProperties,
}: Props) {
    const occupancyRate =
        stats.total_rooms > 0
            ? (
                  ((stats.total_rooms - stats.available_rooms) /
                      stats.total_rooms) *
                  100
              ).toFixed(1)
            : "0";

    return (
        <AppLayout>
            <Head title="Hotel Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Hotel Dashboard</h1>
                        <p className="text-muted-foreground">
                            Overview of hotel properties and bookings
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/hotels">
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                All Hotels
                            </Button>
                        </Link>
                        <Link href="/hotels/create">
                            <Button>Add New Hotel</Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Properties
                            </CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_properties}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Hotel properties in system
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Room Occupancy
                            </CardTitle>
                            <Bed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {occupancyRate}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total_rooms - stats.available_rooms}/
                                {stats.total_rooms} rooms occupied
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Bookings
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_bookings}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.confirmed_bookings} confirmed,{" "}
                                {stats.pending_bookings} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${stats.total_revenue.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                From confirmed bookings
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Available Rooms
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.available_rooms}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Ready for new bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Confirmed Bookings
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.confirmed_bookings}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active reservations
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Bookings
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {stats.pending_bookings}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting confirmation
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Properties */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recently Added Properties</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hotel Name</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Added</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentProperties.map((property) => (
                                        <TableRow key={property.property_id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {property.place.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {property.ownerUser.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {new Date(
                                                        property.created_at
                                                    ).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/hotels/${property.property_id}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {recentProperties.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground">
                                    No recent properties
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Properties by Bookings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Properties by Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hotel Name</TableHead>
                                        <TableHead>Bookings</TableHead>
                                        <TableHead>Popularity</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProperties.map((property, index) => (
                                        <TableRow key={property.property_id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {property.place.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {property.booking_count ||
                                                        0}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        index < 3
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {index === 0
                                                        ? "🥇 Top"
                                                        : index === 1
                                                        ? "🥈 2nd"
                                                        : index === 2
                                                        ? "🥉 3rd"
                                                        : `#${index + 1}`}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/hotels/${property.property_id}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {topProperties.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground">
                                    No booking data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Link href="/hotels">
                                <Button variant="outline" className="w-full">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    View All Hotels
                                </Button>
                            </Link>
                            <Link href="/hotels/create">
                                <Button variant="outline" className="w-full">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Add New Hotel
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled
                            >
                                <Star className="h-4 w-4 mr-2" />
                                Booking Reports
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Analytics
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
