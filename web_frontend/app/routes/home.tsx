import type { Route } from "./+types/home";
import HomePage from "../pages/home/homepage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DerTam - Travel Explorer" },
    { name: "description", content: "Let's explore the world!" },
  ];
}

export default function Home() {
  return <HomePage />;
}