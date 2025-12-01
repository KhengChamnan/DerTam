import type { Route } from "./+types/place";
import PlaceDetailPage from '~/pages/home/place_detail_page';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Place Details - DerTam" },
    { name: "description", content: "Explore amazing places in Cambodia" },
  ];
}

export default function PlaceDetail() {
  return <PlaceDetailPage />;
}