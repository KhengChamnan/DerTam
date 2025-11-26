import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, ArrowLeft, Bus, Clock, Save } from "lucide-react";
import { toast } from "sonner";
import { type BreadcrumbItem } from "@/types";

interface BusData {
    id: number;
    bus_name: string;
    bus_plate: string;
    seat_capacity: number;
}

interface RouteData {
    id: number;
    origin: string;
    destination: string;
    distance?: number;
    duration?: number;
}

interface ScheduleData {
    id: number;
    bus_id: number;
    route_id: number;
    departure_time: string;
    arrival_time: string;
    price: number;
    status: string;
    notes?: string;
}

interface Props {
    schedule?: ScheduleData;
    buses: BusData[];
    routes: RouteData[];
}

export default function TransportationOwnerSchedulesCreateEdit({
    schedule,
    buses = [],
    routes = [],
}: Props) {
    const isEditing = !!schedule;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/transportation-owner/dashboard" },
        { title: "Schedules", href: "/transportation-owner/schedules" },
        { title: isEditing ? "Edit Schedule" : "Add Schedule", href: "#" },
    ];

    // Helper function to format datetime for input field
    const formatDateTimeLocal = (
        dateString: string | null | undefined
    ): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        bus_id: schedule?.bus_id || "",
        route_id: schedule?.route_id || "",
        departure_time: schedule?.departure_time
            ? formatDateTimeLocal(schedule.departure_time)
            : "",
        arrival_time: schedule?.arrival_time
            ? formatDateTimeLocal(schedule.arrival_time)
            : "",
        price: schedule?.price || "",
        status: schedule?.status || "scheduled",
    });

    const [selectedBus, setSelectedBus] = useState<BusData | null>(
        buses.find((b) => b.id === schedule?.bus_id) || null
    );

    const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(
        routes.find((r) => r.id === schedule?.route_id) || null
    );

    const handleBusChange = (busId: string) => {
        const bus = buses.find((b) => b.id === parseInt(busId));
        setSelectedBus(bus || null);
        setData("bus_id", busId);
    };

    const handleRouteChange = (routeId: string) => {
        const route = routes.find((r) => r.id === parseInt(routeId));
        setSelectedRoute(route || null);
        setData("route_id", routeId);

        // Auto-calculate arrival time if route has duration
        if (route?.duration && data.departure_time) {
            const departureDate = new Date(data.departure_time);
            const arrivalDate = new Date(
                departureDate.getTime() + route.duration * 60000
            );
            setData(
                "arrival_time",
                formatDateTimeLocal(arrivalDate.toISOString())
            );
        }
    };

    const handleDepartureTimeChange = (departureTime: string) => {
        setData("departure_time", departureTime);

        // Auto-update arrival time if route has duration
        if (selectedRoute?.duration && departureTime) {
            const departureDate = new Date(departureTime);
            const arrivalDate = new Date(
                departureDate.getTime() + selectedRoute.duration * 60000
            );
            setData(
                "arrival_time",
                formatDateTimeLocal(arrivalDate.toISOString())
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/transportation-owner/schedules/${schedule.id}`, {
                onSuccess: () => {
                    toast.success("Schedule updated successfully!");
                },
                onError: () => {
                    toast.error("Failed to update schedule. Please try again.");
                },
            });
        } else {
            post("/transportation-owner/schedules", {
                onSuccess: () => {
                    toast.success("Schedule created successfully!");
                    reset();
                    setSelectedBus(null);
                    setSelectedRoute(null);
                },
                onError: () => {
                    toast.error("Failed to create schedule. Please try again.");
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? "Edit Schedule" : "Add Schedule"} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEditing ? "Edit Schedule" : "Add New Schedule"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? "Update schedule information"
                                : "Create a new bus schedule"}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/transportation-owner/schedules">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to All Schedules
                        </Link>
                    </Button>
                </div>
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Schedule Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Schedule Information
                                </CardTitle>
                                <CardDescription>
                                    Select bus and route for this schedule
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Bus Selection */}
                                    <div>
                                        <Label htmlFor="bus_id">
                                            Select Bus *
                                        </Label>
                                        <Select
                                            value={String(data.bus_id)}
                                            onValueChange={handleBusChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a bus" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {buses.map((bus) => (
                                                    <SelectItem
                                                        key={bus.id}
                                                        value={String(bus.id)}
                                                    >
                                                        {bus.bus_name} (
                                                        {bus.bus_plate}) -{" "}
                                                        {bus.seat_capacity}{" "}
                                                        seats
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.bus_id && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.bus_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Route Selection */}
                                    <div>
                                        <Label htmlFor="route_id">
                                            Select Route *
                                        </Label>
                                        <Select
                                            value={String(data.route_id)}
                                            onValueChange={handleRouteChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a route" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {routes.map((route) => (
                                                    <SelectItem
                                                        key={route.id}
                                                        value={String(route.id)}
                                                    >
                                                        {route.origin} →{" "}
                                                        {route.destination}
                                                        {route.distance &&
                                                            ` (${route.distance}km)`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.route_id && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.route_id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timing and Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Timing and Pricing</CardTitle>
                                <CardDescription>
                                    Set departure, arrival times and price
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Departure Time */}
                                    <div>
                                        <Label htmlFor="departure_time">
                                            Departure Date & Time *
                                        </Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="departure_time"
                                                type="datetime-local"
                                                value={data.departure_time}
                                                onChange={(e) =>
                                                    handleDepartureTimeChange(
                                                        e.target.value
                                                    )
                                                }
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.departure_time && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.departure_time}
                                            </p>
                                        )}
                                    </div>

                                    {/* Arrival Time */}
                                    <div>
                                        <Label htmlFor="arrival_time">
                                            Arrival Date & Time *
                                        </Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="arrival_time"
                                                type="datetime-local"
                                                value={data.arrival_time}
                                                onChange={(e) =>
                                                    setData(
                                                        "arrival_time",
                                                        e.target.value
                                                    )
                                                }
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.arrival_time && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.arrival_time}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <Label htmlFor="price">
                                            Price ($) *
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={data.price}
                                            onChange={(e) =>
                                                setData("price", e.target.value)
                                            }
                                            placeholder="e.g., 25.00"
                                        />
                                        {errors.price && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.price}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData("status", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="scheduled">
                                                    Scheduled
                                                </SelectItem>
                                                <SelectItem value="departed">
                                                    Departed
                                                </SelectItem>
                                                <SelectItem value="arrived">
                                                    Arrived
                                                </SelectItem>
                                                <SelectItem value="cancelled">
                                                    Cancelled
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4">
                            <Link href="/transportation-owner/schedules">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="w-4 h-4 mr-2" />
                                {processing
                                    ? isEditing
                                        ? "Updating..."
                                        : "Creating..."
                                    : isEditing
                                    ? "Update Schedule"
                                    : "Create Schedule"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
