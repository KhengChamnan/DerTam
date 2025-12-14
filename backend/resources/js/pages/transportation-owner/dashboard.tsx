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
    Bus,
    Calendar,
    DollarSign,
    TrendingUp,
    Users,
    Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type BreadcrumbItem } from "@/types";

interface Company {
    id: number;
    place?: {
        placeID: number;
        name: string;
    };
    buses?: Array<{
        id: number;
        bus_name: string;
        bus_plate: string;
        seat_capacity: number;
    }>;
}

interface Stats {
    total_companies: number;
    total_buses: number;
    active_buses: number;
    total_schedules: number;
    total_bookings: number;
    total_revenue: number;
    utilization_rate: number;
    avg_ticket_price: number;
    recent_revenue: number;
}

interface RecentBooking {
    id: number;
    price?: number;
    created_at?: string;
    schedule?: {
        route?: {
            origin: string;
            destination: string;
        };
        bus?: {
            bus_name: string;
        };
        departure_time?: string;
    };
    seat?: {
        seat_number: string;
    };
}

interface RevenueTrendData {
    month: string;
    revenue: number;
    bookings: number;
}

interface RoutePerformanceData {
    route: string;
    bookings: number;
}

interface BusUtilizationData {
    status: string;
    count: number;
}

interface WeeklyOccupancyData {
    day: string;
    rate: number;
}

interface Props {
    companies: Company[];
    stats: Stats;
    recent_bookings: RecentBooking[];
    revenue_trend_data: RevenueTrendData[];
    route_performance_data: RoutePerformanceData[];
    bus_utilization_data: BusUtilizationData[];
    weekly_occupancy_data: WeeklyOccupancyData[];
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

const routePerformanceConfig = {
    bookings: {
        label: "Bookings",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const busUtilizationConfig = {
    count: {
        label: "Buses",
    },
    Active: {
        label: "Active",
        color: "var(--chart-1)",
    },
    Scheduled: {
        label: "Scheduled",
        color: "var(--chart-2)",
    },
    Maintenance: {
        label: "Maintenance",
        color: "var(--chart-3)",
    },
    Idle: {
        label: "Idle",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

const weeklyOccupancyConfig = {
    rate: {
        label: "Occupancy Rate %",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/transportation-owner/dashboard",
    },
];

export default function TransportationOwnerDashboard({
    companies = [],
    stats = {
        total_companies: 0,
        total_buses: 0,
        active_buses: 0,
        total_schedules: 0,
        total_bookings: 0,
        total_revenue: 0,
        utilization_rate: 0,
        avg_ticket_price: 0,
        recent_revenue: 0,
    },
    recent_bookings = [],
    revenue_trend_data = [],
    route_performance_data = [],
    bus_utilization_data = [],
    weekly_occupancy_data = [],
}: Props) {
    // Map bus utilization data to include fill colors
    const busUtilizationDataWithColors = bus_utilization_data.map((item) => {
        const config =
            busUtilizationConfig[
                item.status as keyof typeof busUtilizationConfig
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
            <Head title="Transportation Owner Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Overview of your transportation companies and
                            performance
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Companies
                            </CardTitle>
                            <Bus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_companies}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Companies you manage
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Buses
                            </CardTitle>
                            <Bus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_buses}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_buses} currently active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Utilization Rate
                            </CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.utilization_rate}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Average seat utilization
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
                                Active Schedules
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_schedules}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently scheduled trips
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg Ticket Price
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${stats.avg_ticket_price}
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

                    {/* Bus Utilization */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bus Status Distribution</CardTitle>
                            <CardDescription>
                                Current status of your buses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={busUtilizationConfig}>
                                <PieChart>
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Pie
                                        data={busUtilizationDataWithColors}
                                        dataKey="count"
                                        nameKey="status"
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
                    {/* Route Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Routes by Bookings</CardTitle>
                            <CardDescription>
                                Most popular routes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={routePerformanceConfig}>
                                <BarChart data={route_performance_data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="route"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="bookings"
                                        fill="var(--color-bookings)"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Weekly Occupancy */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Occupancy Rate</CardTitle>
                            <CardDescription>
                                Average seat occupancy by day
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={weeklyOccupancyConfig}>
                                <LineChart data={weekly_occupancy_data}>
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

                {/* Recent Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>
                            Latest ticket bookings across your buses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recent_bookings.length > 0 ? (
                                recent_bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between border-b pb-4"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {booking.schedule?.route
                                                    ?.origin || "N/A"}{" "}
                                                →{" "}
                                                {booking.schedule?.route
                                                    ?.destination || "N/A"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Bus:{" "}
                                                {booking.schedule?.bus
                                                    ?.bus_name || "N/A"}{" "}
                                                | Seat:{" "}
                                                {booking.seat?.seat_number ||
                                                    "N/A"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.schedule
                                                    ?.departure_time
                                                    ? new Date(
                                                          booking.schedule.departure_time
                                                      ).toLocaleString()
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">
                                                ${booking.price || 0}
                                            </p>
                                            <Badge variant="outline">
                                                Confirmed
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground">
                                    No recent bookings
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
