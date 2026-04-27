import { createRoute } from "@tanstack/react-router";
import { EchoFeedPage } from "../features/echo/ui/echo-feed-page";
import { rootRoute } from "./root";

export const echoesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/echoes",
  component: EchoFeedPage,
});
