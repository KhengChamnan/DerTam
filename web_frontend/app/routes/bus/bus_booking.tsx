import type { Route } from "./+types/bus_booking";
import BusBookingPage from "../../pages/bus/bus_booking";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bus Booking - DerTam" },
    { name: "description", content: "Book bus tickets for your journey" },
  ];
}

export default function BusBooking() {
  return <BusBookingPage />;
}