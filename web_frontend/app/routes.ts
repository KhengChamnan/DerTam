import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("trip-plan", "routes/trip-plan.tsx"),
] satisfies RouteConfig;