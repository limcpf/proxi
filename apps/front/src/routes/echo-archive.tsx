import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { parseEchoListSearch } from "../features/echo/model";
import { rootRoute } from "./root";
import { RoutePending } from "./route-pending";

const EchoArchivePage = lazy(() =>
  import("../features/echo/ui/echo-archive-page").then((module) => ({
    default: module.EchoArchivePage,
  })),
);

export const echoArchiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/echoes/archive",
  validateSearch: parseEchoListSearch,
  component: EchoArchiveRouteComponent,
});

function EchoArchiveRouteComponent() {
  const navigate = echoArchiveRoute.useNavigate();
  const search = echoArchiveRoute.useSearch();

  return (
    <Suspense fallback={<RoutePending />}>
      <EchoArchivePage
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
