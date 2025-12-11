import type { Route } from "./+types/favorites";
import FavoritesPage from "../../pages/profile/favorites";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Favorites - DerTam" },
    { name: "description", content: "Your favorite places and routes" },
  ];
}

export default function ProfileFavorites() {
  return <FavoritesPage />;
}