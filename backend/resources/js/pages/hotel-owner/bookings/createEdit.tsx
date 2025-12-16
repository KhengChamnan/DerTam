import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
    ChevronLeft,
    Save,
    Hotel,
    Calendar,
    DollarSign,
    ArrowLeft,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";
import { toast } from "sonner";

interface BookingItem {
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

interface Props {
    bookingItem: BookingItem;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/hotel-owner/dashboard",
    },
    {
        title: "Bookings",
        href: "/hotel-owner/bookings",
    },
    {
        title: "Edit Booking",
        href: "#",
    },
];

export default function BookingEdit({ bookingItem }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        status: bookingItem.booking.status,
        check_in: bookingItem.hotel_details?.check_in || "",
        check_out: bookingItem.hotel_details?.check_out || "",
        quantity: bookingItem.quantity,
        notes: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/hotel-owner/bookings/${bookingItem.id}`, data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Booking updated successfully");
            },
            onError: (errors) => {
                console.error("Update errors:", errors);
                toast.error("Failed to update booking");
            },
        });
    };

    const calculateNights = () => {
        if (data.check_in && data.check_out) {
            const checkIn = new Date(data.check_in);
            const checkOut = new Date(data.check_out);
            const nights = Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );
            return nights > 0 ? nights : 0;
        }
        return 0;
    };

    const calculateTotal = () => {
        const nights = calculateNights();
        return Number(bookingItem.unit_price) * nights * data.quantity;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Booking #${bookingItem.booking_id}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Booking #{bookingItem.booking_id}
                        </h1>
                        <p className="text-muted-foreground">
                            Update booking details and manage status
                        </p>
                    </div>
                    <Link href="/hotel-owner/bookings">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Bookings
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Left Side */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Booking Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Hotel className="h-5 w-5" />
                                        Booking Information
                                    </CardTitle>
                                    <CardDescription>
                                        View and update guest and property
                                        details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">
                                                Guest Name
                                            </Label>
                                            <Input
                                                value={
                                                    bookingItem.booking.user
                                                        ?.name || "N/A"
                                                }
                                                disabled
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">
                                                Property
                                            </Label>
                                            <Input
                                                value={
                                                    bookingItem.room_property
                                                        .property?.place
                                                        ?.name || "N/A"
                                                }
                                                disabled
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">
                                                Room Type
                                            </Label>
                                            <Input
                                                value={
                                                    bookingItem.room_property
                                                        .room_type
                                                }
                                                disabled
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="quantity">
                                                Number of Rooms *
                                            </Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                min="1"
                                                value={data.quantity}
                                                onChange={(e) =>
                                                    setData(
                                                        "quantity",
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                                className="mt-1"
                                            />
                                            {errors.quantity && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.quantity}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Date & Time */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Check-in & Check-out
                                    </CardTitle>
                                    <CardDescription>
                                        Modify check-in and check-out dates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="check_in">
                                                Check-in Date *
                                            </Label>
                                            <Input
                                                id="check_in"
                                                type="date"
                                                value={data.check_in}
                                                onChange={(e) =>
                                                    setData(
                                                        "check_in",
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1"
                                            />
                                            {errors.check_in && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.check_in}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="check_out">
                                                Check-out Date *
                                            </Label>
                                            <Input
                                                id="check_out"
                                                type="date"
                                                value={data.check_out}
                                                onChange={(e) =>
                                                    setData(
                                                        "check_out",
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1"
                                            />
                                            {errors.check_out && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.check_out}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                Number of Nights
                                            </span>
                                            <span className="font-semibold">
                                                {calculateNights()}{" "}
                                                {calculateNights() === 1
                                                    ? "night"
                                                    : "nights"}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Internal Notes</CardTitle>
                                    <CardDescription>
                                        Add private notes about this booking
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Label htmlFor="notes">
                                        Add notes about this booking (optional)
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData("notes", e.target.value)
                                        }
                                        placeholder="Enter any special requests, notes, or important information..."
                                        rows={4}
                                        className="mt-1"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Right Side */}
                        <div className="space-y-6">
                            {/* Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Booking Status</CardTitle>
                                    <CardDescription>
                                        Update the current booking status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData(
                                                    "status",
                                                    value as
                                                        | "pending"
                                                        | "confirmed"
                                                        | "cancelled"
                                                        | "completed"
                                                )
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value="confirmed">
                                                    Confirmed
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    Completed
                                                </SelectItem>
                                                <SelectItem value="cancelled">
                                                    Cancelled
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Pricing Summary
                                    </CardTitle>
                                    <CardDescription>
                                        Calculated total based on dates and
                                        rooms
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Price per night
                                            </span>
                                            <span className="font-medium">
                                                $
                                                {Number(
                                                    bookingItem.unit_price
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Number of nights
                                            </span>
                                            <span className="font-medium">
                                                {calculateNights()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Number of rooms
                                            </span>
                                            <span className="font-medium">
                                                {data.quantity}
                                            </span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between">
                                            <span className="font-semibold">
                                                Total Amount
                                            </span>
                                            <span className="font-bold text-lg">
                                                ${calculateTotal().toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link href="/hotel-owner/bookings">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? "Saving..." : "Update Booking"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
