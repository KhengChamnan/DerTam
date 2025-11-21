import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("trip_plan", "routes/trip_plan.tsx"),
] satisfies RouteConfig;