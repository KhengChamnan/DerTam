import type { Route } from "./+types/profile";
import ProfilePage from "../../pages/profile/profile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile - DerTam" },
    { name: "description", content: "User profile page" },
  ];
}

export default function Profile() {
  return <ProfilePage />;
}