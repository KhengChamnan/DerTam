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

interface Props {
    companies: Company[];
    stats: Stats;
    recent_bookings: RecentBooking[];
}

// Mock data for revenue trend chart
const revenueTrendData = [
    { month: "Jan", revenue: 12000, bookings: 340 },
    { month: "Feb", revenue: 15800, bookings: 425 },
    { month: "Mar", revenue: 18200, bookings: 498 },
    { month: "Apr", revenue: 22000, bookings: 578 },
    { month: "May", revenue: 25400, bookings: 645 },
    { month: "Jun", revenue: 28900, bookings: 720 },
];

const revenueTrendConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--primary))",
    },
    bookings: {
        label: "Bookings",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

// Mock data for route performance
const routePerformanceData = [
    { route: "Phnom Penh - Siem Reap", bookings: 450 },
    { route: "Phnom Penh - Sihanoukville", bookings: 380 },
    { route: "Siem Reap - Battambang", bookings: 290 },
    { route: "Phnom Penh - Kampot", bookings: 240 },
    { route: "Siem Reap - Poipet", bookings: 185 },
];

const routePerformanceConfig = {
    bookings: {
        label: "Bookings",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

// Mock data for bus utilization
const busUtilizationData = [
    { status: "Active", count: 28, fill: "hsl(var(--primary))" },
    { status: "Scheduled", count: 15, fill: "hsl(var(--chart-2))" },
    { status: "Maintenance", count: 5, fill: "hsl(var(--chart-3))" },
    { status: "Idle", count: 8, fill: "hsl(var(--chart-4))" },
];

const busUtilizationConfig = {
    count: {
        label: "Buses",
    },
    Active: {
        label: "Active",
        color: "hsl(var(--primary))",
    },
    Scheduled: {
        label: "Scheduled",
        color: "hsl(var(--chart-2))",
    },
    Maintenance: {
        label: "Maintenance",
        color: "hsl(var(--chart-3))",
    },
    Idle: {
        label: "Idle",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

// Mock data for weekly occupancy
const weeklyOccupancyData = [
    { day: "Mon", rate: 68 },
    { day: "Tue", rate: 72 },
    { day: "Wed", rate: 75 },
    { day: "Thu", rate: 82 },
    { day: "Fri", rate: 88 },
    { day: "Sat", rate: 92 },
    { day: "Sun", rate: 85 },
];

const weeklyOccupancyConfig = {
    rate: {
        label: "Occupancy Rate %",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

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
}: Props) {
    return (
        <AppLayout>
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
                                <AreaChart data={revenueTrendData}>
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
                                        data={busUtilizationData}
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
                                <BarChart data={routePerformanceData}>
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
                                <LineChart data={weeklyOccupancyData}>
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
