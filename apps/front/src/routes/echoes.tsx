import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { parseEchoListSearch } from "../features/echo/model";
import { rootRoute } from "./root";
import { RoutePending } from "./route-pending";

const EchoFeedPage = lazy(() =>
  import("../features/echo/ui/echo-feed-page").then((module) => ({
    default: module.EchoFeedPage,
  })),
);

export const echoesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/echoes",
  validateSearch: parseEchoListSearch,
  component: EchoesRouteComponent,
});

function EchoesRouteComponent() {
  const navigate = echoesRoute.useNavigate();
  const search = echoesRoute.useSearch();

  return (
    <Suspense fallback={<RoutePending />}>
      <EchoFeedPage
        onSearchChange={(q) =>
          navigate({
            search: () => (q.trim().length > 0 ? { q: q.trim() } : {}),
          })
        }
        searchTerm={search.q ?? ""}
      />
    </Suspense>
  );
}
