import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    Bus,
    CreditCard,
    Hash,
} from "lucide-react";

interface SeatBooking {
    id: number;
    passenger_name: string;
    passenger_email?: string;
    passenger_phone?: string;
    price: number;
    booking_status: "pending" | "confirmed" | "cancelled" | "completed";
    payment_status: "pending" | "paid" | "failed";
    created_at: string;
    schedule: {
        id: number;
        departure_time: string;
        arrival_time: string;
        price: number;
        status: string;
        route: {
            id: number;
            origin: string;
            destination: string;
        };
        bus: {
            id: number;
            bus_name: string;
            bus_plate: string;
            transportation: {
                id: number;
                place?: {
                    placeID: number;
                    name: string;
                };
            };
        };
    };
    seat: {
        id: number;
        seat_number: string;
    };
}

interface ViewBookingDialogProps {
    booking: SeatBooking | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ViewBookingDialog({
    booking,
    open,
    onOpenChange,
}: ViewBookingDialogProps) {
    if (!booking) return null;

    const getBookingStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            pending: { variant: "secondary", label: "Pending" },
            confirmed: { variant: "default", label: "Confirmed" },
            cancelled: { variant: "destructive", label: "Cancelled" },
            completed: { variant: "default", label: "Completed" },
        };
        const config = variants[status] || {
            variant: "secondary",
            label: status,
        };
        return (
            <Badge variant={config.variant} className="capitalize">
                {config.label}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            pending: { variant: "secondary", label: "Pending" },
            paid: { variant: "default", label: "Paid" },
            failed: { variant: "destructive", label: "Failed" },
        };
        const config = variants[status] || {
            variant: "secondary",
            label: status,
        };
        return (
            <Badge variant={config.variant} className="capitalize">
                {config.label}
            </Badge>
        );
    };

    const formatDateTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>
                        Complete information about this bus booking
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Booking Status Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Booking Status
                            </p>
                            {getBookingStatusBadge(booking.booking_status)}
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-sm text-muted-foreground">
                                Payment Status
                            </p>
                            {getPaymentStatusBadge(booking.payment_status)}
                        </div>
                    </div>

                    <Separator />

                    {/* Passenger Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            Passenger Information
                        </h3>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Name
                                    </p>
                                    <p className="font-medium">
                                        {booking.passenger_name || "N/A"}
                                    </p>
                                </div>
                            </div>
                            {booking.passenger_email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Email
                                        </p>
                                        <p className="font-medium">
                                            {booking.passenger_email}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {booking.passenger_phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Phone
                                        </p>
                                        <p className="font-medium">
                                            {booking.passenger_phone}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Trip Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            Trip Information
                        </h3>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Route
                                    </p>
                                    <p className="font-medium">
                                        {booking.schedule.route.origin} →{" "}
                                        {booking.schedule.route.destination}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Bus className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Bus
                                    </p>
                                    <p className="font-medium">
                                        {booking.schedule.bus.bus_name} (
                                        {booking.schedule.bus.bus_plate})
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Seat Number
                                    </p>
                                    <p className="font-medium">
                                        {booking.seat.seat_number}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Schedule Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            Schedule Information
                        </h3>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Departure
                                    </p>
                                    <p className="font-medium">
                                        {formatDateTime(
                                            booking.schedule.departure_time
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Arrival (Estimated)
                                    </p>
                                    <p className="font-medium">
                                        {formatDateTime(
                                            booking.schedule.arrival_time
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Payment Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            Payment Information
                        </h3>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Price
                                    </p>
                                    <p className="font-medium text-lg">
                                        $
                                        {typeof booking.price === "number"
                                            ? booking.price.toFixed(2)
                                            : parseFloat(
                                                  String(booking.price)
                                              ).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Booked On
                                    </p>
                                    <p className="font-medium">
                                        {formatDateTime(booking.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
