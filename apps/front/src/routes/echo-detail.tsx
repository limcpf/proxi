import { createRoute } from "@tanstack/react-router";
import { EchoDetailPage } from "../features/echo/ui/echo-detail-page";
import { rootRoute } from "./root";

export const echoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/echoes/$echoId",
  component: EchoDetailRouteComponent,
});

function EchoDetailRouteComponent() {
  const { echoId } = echoDetailRoute.useParams();

  return <EchoDetailPage echoId={echoId} />;
}
