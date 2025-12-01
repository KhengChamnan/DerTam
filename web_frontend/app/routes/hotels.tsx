import type { Route } from "./+types/hotels";
import HotelListPage from '~/pages/hotal/hotel_list_page';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hotels - DerTam" },
    { name: "description", content: "Browse and book amazing hotels in Cambodia" },
  ];
}

export default function Hotels() {
  return <HotelListPage />;
}
