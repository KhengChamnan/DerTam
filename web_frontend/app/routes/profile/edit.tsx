import type { Route } from "./+types/edit";
import EditProfilePage from "../../pages/profile/edit_profile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Profile - DerTam" },
    { name: "description", content: "Update your profile information" },
  ];
}

export default function ProfileEdit() {
  return <EditProfilePage />;
}