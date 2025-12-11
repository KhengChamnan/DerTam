import type { Route } from "./+types/budget";
import BudgetPage from "../pages/budget/budget";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Budget - DerTam" },
    { name: "description", content: "Manage your trip budget and expenses" },
  ];
}

export default function Budget({ params }: Route.ComponentProps) {
  return <BudgetPage tripId={params.tripId} />;
}