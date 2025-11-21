import type { Route } from "./+types/trip_plan";
import TripPlanningPage from "../pages/trip/trip_plan";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Plan Your Trip - DerTam" },
    { name: "description", content: "Create your perfect Cambodia itinerary" },
  ];
}

export default function TripPlan() {
  return <TripPlanningPage />;
}