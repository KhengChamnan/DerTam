import type { Route } from "./+types/restaurant";
import RestaurantDetailPage from '~/pages/restaurant/restaurant_detail_page';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Restaurant Details - DerTam" },
    { name: "description", content: "Explore restaurant menu and details" },
  ];
}

export default function Restaurant() {
  return <RestaurantDetailPage />;
}
