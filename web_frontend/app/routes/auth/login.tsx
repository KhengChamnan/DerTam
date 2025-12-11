import type { Route } from "./+types/login";
import LoginPage from "../../pages/auth/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - DerTam" },
    { name: "description", content: "Login to your account" },
  ];
}

export default function Login() {
  return <LoginPage />;
}