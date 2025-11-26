import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface Property {
    property_id: number;
    place?: {
        placeID: number;
        name: string;
    };
}

interface RoomType {
    room_properties_id: number;
    room_type: string;
    room_description?: string;
    price_per_night: number;
    property?: {
        place?: {
            name: string;
        };
    };
}

interface Room {
    room_id: number;
    room_properties_id: number;
    room_number: string;
    is_available: boolean;
    status: "available" | "occupied" | "maintenance" | "cleaning";
    notes?: string;
    room_property?: RoomType;
}

interface Props {
    property?: Property;
    roomTypes: RoomType[];
    room?: Room | null;
    isEdit: boolean;
}

export default function RoomCreateEdit({
    property,
    roomTypes = [],
    room = null,
    isEdit = false,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/hotel-owner/dashboard",
        },
        {
            title: "Rooms",
            href: "/hotel-owner/rooms",
        },
        {
            title: isEdit ? "Edit Room" : "Create Room",
            href: isEdit
                ? `/hotel-owner/rooms/${room?.room_id}/edit`
                : "/hotel-owner/rooms/create",
        },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        room_properties_id:
            room?.room_properties_id || roomTypes[0]?.room_properties_id || "",
        room_number: room?.room_number || "",
        is_available: room?.is_available ?? true,
        status: room?.status || "available",
        notes: room?.notes || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && room) {
            put(`/hotel-owner/rooms/${room.room_id}`, {
                preserveScroll: true,
            });
        } else {
            post("/hotel-owner/rooms", {
                preserveScroll: true,
            });
        }
    };

    const selectedRoomType = roomTypes.find(
        (rt) => rt.room_properties_id === Number(data.room_properties_id)
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${isEdit ? "Edit" : "Create"} Room`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEdit ? "Edit" : "Create New"} Room
                        </h1>
                        <p className="text-muted-foreground">
                            {property?.place?.name || "Hotel Management"}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/hotel-owner/rooms">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to All Rooms
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Room Type Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="room_properties_id">
                                    Room Type{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={String(data.room_properties_id)}
                                    onValueChange={(value) =>
                                        setData(
                                            "room_properties_id",
                                            Number(value)
                                        )
                                    }
                                >
                                    <SelectTrigger id="room_properties_id">
                                        <SelectValue placeholder="Select a room type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomTypes.map((roomType) => (
                                            <SelectItem
                                                key={
                                                    roomType.room_properties_id
                                                }
                                                value={String(
                                                    roomType.room_properties_id
                                                )}
                                            >
                                                {roomType.room_type} - $
                                                {roomType.price_per_night}/night
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.room_properties_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.room_properties_id}
                                    </p>
                                )}
                                {/* {selectedRoomType && (
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRoomType.room_description ||
                                            "No description"}
                                    </p>
                                )} */}
                            </div>

                            {/* Room Number */}
                            <div className="space-y-2">
                                <Label htmlFor="room_number">
                                    Room Number{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="room_number"
                                    value={data.room_number}
                                    onChange={(e) =>
                                        setData("room_number", e.target.value)
                                    }
                                    placeholder="e.g., 101, 102, A-100"
                                    required
                                />
                                {errors.room_number && (
                                    <p className="text-sm text-red-500">
                                        {errors.room_number}
                                    </p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Status{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value: any) =>
                                        setData("status", value)
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">
                                            Available
                                        </SelectItem>
                                        <SelectItem value="occupied">
                                            Occupied
                                        </SelectItem>
                                        <SelectItem value="maintenance">
                                            Maintenance
                                        </SelectItem>
                                        <SelectItem value="cleaning">
                                            Cleaning
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-red-500">
                                        {errors.status}
                                    </p>
                                )}
                            </div>

                            {/* Available for Booking */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_available">
                                        Available for Booking
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable this to allow guests to book this
                                        room
                                    </p>
                                </div>
                                <Switch
                                    id="is_available"
                                    checked={data.is_available}
                                    onCheckedChange={(checked) =>
                                        setData("is_available", checked)
                                    }
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData("notes", e.target.value)
                                    }
                                    placeholder="Any special notes about this room..."
                                    rows={4}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-500">
                                        {errors.notes}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    {/* Submit Buttons */}
                    <div className="flex gap-2 pt-4 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            disabled={processing}
                        >
                            <Link href="/hotel-owner/rooms">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEdit ? "Update Room" : "Create Room"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
