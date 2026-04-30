import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { rootRoute } from "./root";
import { RoutePending } from "./route-pending";

const EchoDetailPage = lazy(() =>
  import("../features/echo/ui/echo-detail-page").then((module) => ({
    default: module.EchoDetailPage,
  })),
);

export const echoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/echoes/$echoId",
  component: EchoDetailRouteComponent,
});

function EchoDetailRouteComponent() {
  const { echoId } = echoDetailRoute.useParams();

  return (
    <Suspense fallback={<RoutePending />}>
      <EchoDetailPage echoId={echoId} />
    </Suspense>
  );
}
