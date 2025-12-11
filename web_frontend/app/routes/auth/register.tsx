import type { Route } from "./+types/register";
import RegisterPage from "../../pages/auth/register";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - DerTam" },
    { name: "description", content: "Create a new account" },
  ];
}

export default function Register() {
  return <RegisterPage />;
}