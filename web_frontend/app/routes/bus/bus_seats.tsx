import type { Route } from "./+types/bus_seats";
import SeatSelectionPage from "../../pages/bus/bus_seats";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Select Seats - DerTam" },
    { name: "description", content: "Choose your seats" },
  ];
}

export default function BusSeats() {
  return <SeatSelectionPage />;
}