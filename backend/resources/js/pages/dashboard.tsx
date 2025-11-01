import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
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
import { TrendingUp, Users, DollarSign, Building2, MapPin } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: dashboard().url,
    },
];

// Mock data for statistics cards
const statsData = [
    {
        title: "Total Users",
        value: "2,543",
        change: "+12.5%",
        trend: "up",
        icon: Users,
        description: "Total registered users",
    },
    {
        title: "Total Bookings",
        value: "1,234",
        change: "+8.2%",
        trend: "up",
        icon: Building2,
        description: "Bookings this month",
    },
    {
        title: "Revenue",
        value: "$45,231",
        change: "+23.1%",
        trend: "up",
        icon: DollarSign,
        description: "Total revenue this month",
    },
    {
        title: "Active Properties",
        value: "156",
        change: "+4.3%",
        trend: "up",
        icon: MapPin,
        description: "Active hotel properties",
    },
];

// Mock data for revenue chart
const revenueData = [
    { month: "Jan", revenue: 12000, bookings: 145 },
    { month: "Feb", revenue: 15000, bookings: 178 },
    { month: "Mar", revenue: 18000, bookings: 210 },
    { month: "Apr", revenue: 22000, bookings: 256 },
    { month: "May", revenue: 28000, bookings: 312 },
    { month: "Jun", revenue: 32000, bookings: 380 },
];

const revenueChartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-1))",
    },
    bookings: {
        label: "Bookings",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

// Mock data for booking status
const bookingStatusData = [
    { status: "Confirmed", value: 450, fill: "hsl(var(--chart-1))" },
    { status: "Pending", value: 230, fill: "hsl(var(--chart-2))" },
    { status: "Cancelled", value: 120, fill: "hsl(var(--chart-3))" },
    { status: "Completed", value: 680, fill: "hsl(var(--chart-4))" },
];

const bookingStatusConfig = {
    value: {
        label: "Bookings",
    },
    Confirmed: {
        label: "Confirmed",
        color: "hsl(var(--chart-1))",
    },
    Pending: {
        label: "Pending",
        color: "hsl(var(--chart-2))",
    },
    Cancelled: {
        label: "Cancelled",
        color: "hsl(var(--chart-3))",
    },
    Completed: {
        label: "Completed",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

// Mock data for top destinations
const destinationData = [
    { destination: "Phnom Penh", bookings: 320 },
    { destination: "Siem Reap", bookings: 280 },
    { destination: "Sihanoukville", bookings: 240 },
    { destination: "Battambang", bookings: 180 },
    { destination: "Kampot", bookings: 150 },
];

const destinationChartConfig = {
    bookings: {
        label: "Bookings",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

// Mock data for user growth
const userGrowthData = [
    { month: "Jan", users: 1200 },
    { month: "Feb", users: 1450 },
    { month: "Mar", users: 1680 },
    { month: "Apr", users: 1890 },
    { month: "May", users: 2150 },
    { month: "Jun", users: 2543 },
];

const userGrowthConfig = {
    users: {
        label: "Users",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsData.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-green-600">
                                        {stat.change}
                                    </span>{" "}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Revenue & Bookings Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue & Bookings Overview</CardTitle>
                            <CardDescription>
                                Monthly revenue and booking trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={revenueChartConfig}>
                                <AreaChart data={revenueData}>
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

                    {/* Booking Status Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Status Distribution</CardTitle>
                            <CardDescription>
                                Current booking status breakdown
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={bookingStatusConfig}>
                                <PieChart>
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Pie
                                        data={bookingStatusData}
                                        dataKey="value"
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
                    {/* Top Destinations Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Destinations</CardTitle>
                            <CardDescription>
                                Most popular booking destinations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={destinationChartConfig}>
                                <BarChart data={destinationData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="destination"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
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

                    {/* User Growth Line Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Growth</CardTitle>
                            <CardDescription>
                                Registered users over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={userGrowthConfig}>
                                <LineChart data={userGrowthData}>
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
                                    <Line
                                        type="monotone"
                                        dataKey="users"
                                        stroke="var(--color-users)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
