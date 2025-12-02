import type { Route } from "./+types/room";
import RoomDetailPage from '~/pages/hotel/room_detail_page';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Room Details - DerTam" },
    { name: "description", content: "View room details and book your stay" },
  ];
}

export default function Room() {
  return <RoomDetailPage />;
}
