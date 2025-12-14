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

interface Stats {
    totalUsers: number;
    usersChange: number;
    totalBookings: number;
    bookingsChange: number;
    revenue: number;
    revenueChange: number;
    activeProperties: number;
    propertiesChange: number;
}

interface RevenueData {
    month: string;
    revenue: number;
    bookings: number;
}

interface BookingStatusData {
    status: string;
    value: number;
    fill: string;
}

interface DestinationData {
    destination: string;
    bookings: number;
}

interface UserGrowthData {
    month: string;
    users: number;
}

interface DashboardProps {
    stats: Stats;
    revenueData: RevenueData[];
    bookingStatusData: BookingStatusData[];
    topDestinations: DestinationData[];
    userGrowthData: UserGrowthData[];
}

const revenueChartConfig = {
    revenue: {
        label: "Revenue",
        color: "var(--chart-1)",
    },
    bookings: {
        label: "Bookings",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const bookingStatusConfig = {
    value: {
        label: "Bookings",
    },
    Confirmed: {
        label: "Confirmed",
        color: "var(--chart-4)",
    },
    Pending: {
        label: "Pending",
        color: "var(--chart-5)",
    },
    Cancelled: {
        label: "Cancelled",
        color: "var(--destructive)",
    },
    Completed: {
        label: "Completed",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

const destinationChartConfig = {
    bookings: {
        label: "Bookings",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const userGrowthConfig = {
    users: {
        label: "Users",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

export default function Dashboard({
    stats,
    revenueData,
    bookingStatusData,
    topDestinations,
    userGrowthData,
}: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatChange = (change: number) => {
        const sign = change >= 0 ? "+" : "";
        return `${sign}${change}%`;
    };

    const statsData = [
        {
            title: "Total Users",
            value: stats.totalUsers.toLocaleString(),
            change: formatChange(stats.usersChange),
            trend: stats.usersChange >= 0 ? "up" : "down",
            icon: Users,
            description: "Total registered users",
        },
        {
            title: "Total Bookings",
            value: stats.totalBookings.toLocaleString(),
            change: formatChange(stats.bookingsChange),
            trend: stats.bookingsChange >= 0 ? "up" : "down",
            icon: Building2,
            description: "Bookings this month",
        },
        {
            title: "Revenue",
            value: formatCurrency(stats.revenue),
            change: formatChange(stats.revenueChange),
            trend: stats.revenueChange >= 0 ? "up" : "down",
            icon: DollarSign,
            description: "Total revenue this month",
        },
        {
            title: "Active Properties",
            value: stats.activeProperties.toLocaleString(),
            change: formatChange(stats.propertiesChange),
            trend: stats.propertiesChange >= 0 ? "up" : "down",
            icon: MapPin,
            description: "Active hotel properties",
        },
    ];
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
                                    <span
                                        className={
                                            stat.trend === "up"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }
                                    >
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
                                        data={bookingStatusData.map((item) => {
                                            const config =
                                                bookingStatusConfig[
                                                    item.status as keyof typeof bookingStatusConfig
                                                ];
                                            const color =
                                                config && "color" in config
                                                    ? config.color
                                                    : "var(--chart-1)";
                                            return {
                                                ...item,
                                                fill: color,
                                            };
                                        })}
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
                                <BarChart data={topDestinations}>
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
