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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Bus as BusIcon, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type BreadcrumbItem } from "@/types";

interface BusProperty {
    id: number;
    bus_type: string;
    seat_capacity: number;
    price_per_seat: number;
}

interface BusData {
    id: number;
    bus_property_id: number;
    bus_name: string;
    bus_plate: string;
    description?: string;
    is_available: boolean;
    status: string;
}

interface Props {
    busProperties: BusProperty[];
    bus?: BusData;
}

export default function BusCreate({ busProperties, bus }: Props) {
    const isEditing = !!bus;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/transportation-owner/dashboard" },
        { title: "Buses", href: "/transportation-owner/buses" },
        { title: isEditing ? "Edit Bus" : "Add Bus", href: "#" },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        bus_property_id: bus?.bus_property_id?.toString() || "",
        bus_name: bus?.bus_name || "",
        bus_plate: bus?.bus_plate || "",
        description: bus?.description || "",
        is_available: bus?.is_available ?? true,
        status: bus?.status || "active",
    });

    const selectedBusProperty = busProperties.find(
        (bp) => bp.id === Number(data.bus_property_id)
    );

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
                    toast.success(
                        "Bus added successfully! Seats created automatically."
                    );
                },
                onError: () => {
                    toast.error("Failed to add bus. Please try again.");
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? "Edit Bus" : "Add New Bus"} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing ? "Edit Bus" : "Add New Bus"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? "Update bus information"
                                : "Add a physical bus to your fleet"}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/transportation-owner/buses">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Buses
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BusIcon className="h-5 w-5" />
                                Bus Information
                            </CardTitle>
                            <CardDescription>
                                Enter basic information about this vehicle
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Bus Type Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="bus_property_id">
                                    Bus Type * (Template)
                                </Label>
                                <Select
                                    value={data.bus_property_id}
                                    onValueChange={(value) =>
                                        setData("bus_property_id", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select bus type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {busProperties.map((busProperty) => (
                                            <SelectItem
                                                key={busProperty.id}
                                                value={busProperty.id.toString()}
                                            >
                                                {busProperty.bus_type} (
                                                {busProperty.seat_capacity}{" "}
                                                seats)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.bus_property_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.bus_property_id}
                                    </p>
                                )}
                            </div>

                            {/* Bus Name */}
                            <div className="space-y-2">
                                <Label htmlFor="bus_name">Bus Name *</Label>
                                <Input
                                    id="bus_name"
                                    value={data.bus_name}
                                    onChange={(e) =>
                                        setData("bus_name", e.target.value)
                                    }
                                    placeholder="e.g., Express 1, VIP Coach A"
                                />
                                {errors.bus_name && (
                                    <p className="text-sm text-red-500">
                                        {errors.bus_name}
                                    </p>
                                )}
                            </div>

                            {/* Bus Plate */}
                            <div className="space-y-2">
                                <Label htmlFor="bus_plate">
                                    License Plate Number *
                                </Label>
                                <Input
                                    id="bus_plate"
                                    value={data.bus_plate}
                                    onChange={(e) =>
                                        setData(
                                            "bus_plate",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="e.g., ABC-123"
                                    className="uppercase"
                                />
                                {errors.bus_plate && (
                                    <p className="text-sm text-red-500">
                                        {errors.bus_plate}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    placeholder="e.g., Newly serviced, excellent condition"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData("status", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="maintenance">
                                            Maintenance
                                        </SelectItem>
                                        <SelectItem value="retired">
                                            Retired
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-red-500">
                                        {errors.status}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing
                                ? isEditing
                                    ? "Updating..."
                                    : "Adding Bus..."
                                : isEditing
                                ? "Update Bus"
                                : "Add Bus"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
