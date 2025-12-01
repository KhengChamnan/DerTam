import type { Route } from "./+types/bus_select";
import BusSelectPage from "../../pages/bus/bus_select";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Select Bus - DerTam" },
    { name: "description", content: "Select your bus" },
  ];
}

export default function BusSelect() {
  return <BusSelectPage />;
}