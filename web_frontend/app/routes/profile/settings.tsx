import type { Route } from "./+types/settings";
import SettingsPage from "../../pages/profile/settings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings - DerTam" },
    { name: "description", content: "Manage your account settings" },
  ];
}

export default function ProfileSettings() {
  return <SettingsPage />;
}