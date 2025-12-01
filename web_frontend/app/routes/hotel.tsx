import type { Route } from "./+types/hotel";
import HotelDetailPage from '~/pages/hotal/hotel_detail_page';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hotel Details - DerTam" },
    { name: "description", content: "Book amazing hotels in Cambodia" },
  ];
}

export default function HotelDetail() {
  return <HotelDetailPage />;
}
