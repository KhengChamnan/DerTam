import React from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Bus, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface BusData {
    id: number;
    bus_name: string;
    bus_plate: string;
    bus_type: string;
    seat_capacity: number;
    is_active: boolean;
    description?: string;
    features?: string;
}

interface Props {
    bus?: BusData;
}

export default function TransportationOwnerBusesCreateEdit({ bus }: Props) {
    const isEditing = !!bus;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        bus_name: bus?.bus_name || "",
        bus_plate: bus?.bus_plate || "",
        bus_type: bus?.bus_type || "standard",
        seat_capacity: bus?.seat_capacity || 30,
        is_active: bus?.is_active ?? true,
        description: bus?.description || "",
        features: bus?.features || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/transportation-owner/buses/${bus.id}`, {
                onSuccess: () => {
                    toast.success("Bus updated successfully!");
                },
                onError: () => {
                    toast.error("Failed to update bus. Please try again.");
                },
            });
        } else {
            post("/transportation-owner/buses", {
                onSuccess: () => {
                    toast.success("Bus created successfully!");
                    reset();
                },
                onError: () => {
                    toast.error("Failed to create bus. Please try again.");
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? "Edit Bus" : "Add Bus"} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEditing ? "Edit Bus" : "Add New Bus"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? "Update bus information"
                                : "Add a new bus to your fleet"}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/transportation-owner/buses">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to All Buses
                        </Link>
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bus className="h-5 w-5" />
                                Bus Information
                            </CardTitle>
                            <CardDescription>
                                Enter the basic details of the bus
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Bus Name */}
                                <div>
                                    <Label htmlFor="bus_name">Bus Name *</Label>
                                    <Input
                                        id="bus_name"
                                        type="text"
                                        value={data.bus_name}
                                        onChange={(e) =>
                                            setData("bus_name", e.target.value)
                                        }
                                        placeholder="e.g., Express 01"
                                    />
                                    {errors.bus_name && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.bus_name}
                                        </p>
                                    )}
                                </div>

                                {/* Bus Plate */}
                                <div>
                                    <Label htmlFor="bus_plate">
                                        Bus Plate Number *
                                    </Label>
                                    <Input
                                        id="bus_plate"
                                        type="text"
                                        value={data.bus_plate}
                                        onChange={(e) =>
                                            setData("bus_plate", e.target.value)
                                        }
                                        placeholder="e.g., 1A-1234"
                                    />
                                    {errors.bus_plate && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.bus_plate}
                                        </p>
                                    )}
                                </div>

                                {/* Bus Type */}
                                <div>
                                    <Label htmlFor="bus_type">Bus Type *</Label>
                                    <Select
                                        value={data.bus_type}
                                        onValueChange={(value) =>
                                            setData("bus_type", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select bus type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="standard">
                                                Standard
                                            </SelectItem>
                                            <SelectItem value="luxury">
                                                Luxury
                                            </SelectItem>
                                            <SelectItem value="sleeper">
                                                Sleeper
                                            </SelectItem>
                                            <SelectItem value="vip">
                                                VIP
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.bus_type && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.bus_type}
                                        </p>
                                    )}
                                </div>

                                {/* Seat Capacity */}
                                <div>
                                    <Label htmlFor="seat_capacity">
                                        Seat Capacity *
                                    </Label>
                                    <Input
                                        id="seat_capacity"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.seat_capacity}
                                        onChange={(e) =>
                                            setData(
                                                "seat_capacity",
                                                parseInt(e.target.value) || 0
                                            )
                                        }
                                        placeholder="e.g., 30"
                                    />
                                    {errors.seat_capacity && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.seat_capacity}
                                        </p>
                                    )}
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData("is_active", checked)
                                        }
                                    />
                                    <Label
                                        htmlFor="is_active"
                                        className="cursor-pointer"
                                    >
                                        Active
                                    </Label>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    placeholder="Enter bus description (optional)"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Details</CardTitle>
                            <CardDescription>
                                Optional information about the bus
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="features">Features</Label>
                                <Textarea
                                    id="features"
                                    value={data.features}
                                    onChange={(e) =>
                                        setData("features", e.target.value)
                                    }
                                    placeholder="e.g., WiFi, AC, USB Charging, Reclining Seats"
                                    rows={3}
                                />
                                {errors.features && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.features}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href="/transportation-owner/buses">
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
                                ? "Update Bus"
                                : "Create Bus"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
