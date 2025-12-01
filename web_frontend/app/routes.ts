import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("trip_plan", "routes/trip_plan.tsx"),
  route("/place/:id", "routes/place.tsx"),
  route("/hotels", "routes/hotels.tsx"),
  route("/hotel/:id", "routes/hotel.tsx"),
  route("/hotel/:id/rooms", "routes/rooms.tsx"),
  route("/hotel/:id/room/:roomId", "routes/room.tsx"),
  route("/restaurant/:id", "routes/restaurant.tsx"),
] satisfies RouteConfig;