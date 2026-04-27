import { createRouter } from "@tanstack/react-router";
import { echoDetailRoute } from "../routes/echo-detail";
import { echoesRoute } from "../routes/echoes";
import { indexRoute } from "../routes/index";
import { rootRoute } from "../routes/root";

const routeTree = rootRoute.addChildren([
  indexRoute,
  echoesRoute,
  echoDetailRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPendingMs: 150,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
