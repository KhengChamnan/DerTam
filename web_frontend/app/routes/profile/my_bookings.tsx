import type { Route } from "./+types/my_bookings";
import MyBookingsPage from "../../pages/profile/my_bookings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Bookings - DerTam" },
    { name: "description", content: "View your bus bookings" },
  ];
}

export default function ProfileBookings() {
  return <MyBookingsPage />;
}