import type { Route } from "./+types/bus_booking_confirm";
import BookingConfirmPage from "../../pages/bus/bus_booking_confirm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Confirm Booking - DerTam" },
    { name: "description", content: "Confirm your bus booking" },
  ];
}

export default function BusBookingConfirm() {
  return <BookingConfirmPage />;
}