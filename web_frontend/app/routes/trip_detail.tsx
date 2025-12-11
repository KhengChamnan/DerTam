import type { Route } from "./+types/trip_detail";
import TripDetailPage from "../pages/trip/trip_detail";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trip Details - DerTam" },
    { name: "description", content: "View and manage your trip itinerary" },
  ];
}

export default function TripDetail({ params }: Route.ComponentProps) {
  return <TripDetailPage tripId={params.tripId} />;
}