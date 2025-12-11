import type { Route } from "./+types/rooms";
import AvailableRoomsPage from '~/pages/hotel/available_rooms_page';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Available Rooms - DerTam" },
    { name: "description", content: "Browse available rooms and book your stay" },
  ];
}

export default function Rooms() {
  return <AvailableRoomsPage />;
}
