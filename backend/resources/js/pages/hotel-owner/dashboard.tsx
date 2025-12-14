import React from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";
import {
    Hotel,
    Users,
    DollarSign,
    Calendar,
    TrendingUp,
    Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type BreadcrumbItem } from "@/types";

interface Property {
    property_id: number;
    place?: {
        placeID: number;
        name: string;
        ratings: number;
    };
    roomProperties?: Array<{
        room_properties_id: number;
        room_type: string;
        price_per_night: number;
        is_available: boolean;
    }>;
}

interface Stats {
    total_hotels: number;
    total_rooms: number;
    available_rooms: number;
    occupancy_rate: number;
    total_revenue: number;
    recent_revenue: number;
    total_bookings: number;
    avg_daily_rate: number;
}

interface RecentBooking {
    id: number;
    booking_id: number;
    booking: {
        id: number;
        user_id: number;
        total_amount: number;
        currency: string;
        status: "pending" | "confirmed" | "cancelled" | "completed";
        created_at: string;
        user?: {
            id: number;
            name: string;
            email: string;
            phone_number?: string;
        };
    };
    room_property: {
        room_properties_id: number;
        room_type: string;
        price_per_night: number;
        property: {
            property_id: number;
            place?: {
                placeID: number;
                name: string;
            };
        };
    };
    hotel_details?: {
        id: number;
        check_in: string;
        check_out: string;
        nights: number;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}

interface RevenueTrendData {
    month: string;
    revenue: number;
    bookings: number;
}

interface RoomTypeData {
    type: string;
    occupancy: number;
}

interface BookingSourceData {
    source: string;
    bookings: number;
}

interface DailyOccupancyData {
    day: string;
    rate: number;
}

interface Props {
    properties: Property[];
    stats: Stats;
    recent_bookings: RecentBooking[];
    revenue_trend_data: RevenueTrendData[];
    room_type_data: RoomTypeData[];
    booking_source_data: BookingSourceData[];
    daily_occupancy_data: DailyOccupancyData[];
}

const revenueTrendConfig = {
    revenue: {
        label: "Revenue",
        color: "var(--chart-1)",
    },
    bookings: {
        label: "Bookings",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const roomTypeConfig = {
    occupancy: {
        label: "Occupancy %",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const bookingSourceConfig = {
    bookings: {
        label: "Bookings",
    },
    Direct: {
        label: "Direct Booking",
        color: "var(--chart-1)",
    },
    Online: {
        label: "Online Travel Agency",
        color: "var(--chart-2)",
    },
    Agency: {
        label: "Travel Agency",
        color: "var(--chart-3)",
    },
    Corporate: {
        label: "Corporate Booking",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

const dailyOccupancyConfig = {
    rate: {
        label: "Occupancy Rate %",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/hotel-owner/dashboard" },
];

export default function HotelOwnerDashboard({
    properties = [],
    stats = {
        total_hotels: 0,
        total_rooms: 0,
        available_rooms: 0,
        occupancy_rate: 0,
        total_revenue: 0,
        recent_revenue: 0,
        total_bookings: 0,
        avg_daily_rate: 0,
    },
    recent_bookings = [],
    revenue_trend_data = [],
    room_type_data = [],
    booking_source_data = [],
    daily_occupancy_data = [],
}: Props) {
    // Map booking source data to include fill colors
    const bookingSourceDataWithColors = booking_source_data.map((item) => {
        const config =
            bookingSourceConfig[
                item.source as keyof typeof bookingSourceConfig
            ];
        const color =
            config && "color" in config ? config.color : "var(--chart-1)";
        return {
            ...item,
            fill: color,
        };
    });
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hotel Owner Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Overview of your hotel properties and performance
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Hotels
                            </CardTitle>
                            <Hotel className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_hotels}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Properties you manage
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Rooms
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_rooms}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.available_rooms} available
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Occupancy Rate
                            </CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.occupancy_rate}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Current occupancy
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
                                ${stats.total_revenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${stats.recent_revenue} last 7 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                All time bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg Daily Rate
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${stats.avg_daily_rate}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Average per booking
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 1 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Revenue & Bookings Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue & Bookings Trend</CardTitle>
                            <CardDescription>
                                Monthly revenue and booking performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={revenueTrendConfig}>
                                <AreaChart data={revenue_trend_data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="var(--color-revenue)"
                                        fill="var(--color-revenue)"
                                        fillOpacity={0.3}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="bookings"
                                        stroke="var(--color-bookings)"
                                        fill="var(--color-bookings)"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Booking Sources Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Sources</CardTitle>
                            <CardDescription>
                                Distribution of booking channels
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={bookingSourceConfig}>
                                <PieChart>
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Pie
                                        data={bookingSourceDataWithColors}
                                        dataKey="bookings"
                                        nameKey="source"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                    />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Room Type Occupancy */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Type Occupancy</CardTitle>
                            <CardDescription>
                                Occupancy rate by room type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={roomTypeConfig}>
                                <BarChart data={room_type_data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="type"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="occupancy"
                                        fill="var(--color-occupancy)"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Daily Occupancy Rate */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Occupancy Rate</CardTitle>
                            <CardDescription>
                                Daily occupancy rate this week
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={dailyOccupancyConfig}>
                                <LineChart data={daily_occupancy_data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rate"
                                        stroke="var(--color-rate)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Your Properties
                <Card>
                    <CardHeader>
                        <CardTitle>Your Hotel Properties</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Overview of your managed properties
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {properties.map((property) => {
                                const roomProperties =
                                    property.roomProperties || [];
                                const availableRooms = roomProperties.filter(
                                    (room) => room.is_available
                                );
                                const minPrice =
                                    roomProperties.length > 0
                                        ? Math.min(
                                              ...roomProperties.map(
                                                  (room) => room.price_per_night
                                              )
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={property.property_id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-semibold text-sm">
                                                    {property.place?.name ||
                                                        "Unknown Property"}
                                                </h3>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {property.place?.ratings ||
                                                        0}
                                                    /5
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {roomProperties.length} rooms
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {availableRooms.length}{" "}
                                                available
                                            </p>
                                            {roomProperties.length > 0 && (
                                                <p className="text-xs font-medium">
                                                    From ${minPrice}/night
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {properties.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Hotel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No properties assigned yet.</p>
                                <p className="text-sm">
                                    Contact your administrator to get properties
                                    assigned.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card> */}

                {/* Recent Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Latest bookings for your properties
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recent_bookings.map((booking) => {
                                const propertyName =
                                    booking.room_property?.property?.place
                                        ?.name || "Unknown Property";
                                const guestName =
                                    booking.booking.user?.name ||
                                    "Unknown Guest";

                                return (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm">
                                                {guestName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {propertyName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.hotel_details?.check_in
                                                    ? new Date(
                                                          booking.hotel_details.check_in
                                                      ).toLocaleDateString()
                                                    : "N/A"}{" "}
                                                -{" "}
                                                {booking.hotel_details
                                                    ?.check_out
                                                    ? new Date(
                                                          booking.hotel_details.check_out
                                                      ).toLocaleDateString()
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="font-medium text-sm">
                                                ${booking.total_price || 0}
                                            </p>
                                            <Badge
                                                variant={
                                                    booking.booking.status ===
                                                    "confirmed"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className="text-xs"
                                            >
                                                {booking.booking.status ||
                                                    "Unknown"}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {recent_bookings.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No recent bookings found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
