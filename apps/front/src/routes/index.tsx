import { createRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import type { FrontHarnessView } from "../features/front-harness/model";
import { parseFrontHarnessSearch } from "../features/front-harness/model";
import { rootRoute } from "./root";
import { RoutePending } from "./route-pending";

const FrontHarnessPage = lazy(() =>
  import("../features/front-harness/ui/front-harness-page").then((module) => ({
    default: module.FrontHarnessPage,
  })),
);

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: parseFrontHarnessSearch,
  component: IndexRouteComponent,
});

function IndexRouteComponent() {
  const navigate = useNavigate({ from: indexRoute.fullPath });
  const search = indexRoute.useSearch();

  const handleViewChange = (view: FrontHarnessView) => {
    navigate({
      search: () => (view === "overview" ? { view: "overview" } : { view }),
    });
  };

  return (
    <Suspense fallback={<RoutePending />}>
      <FrontHarnessPage onViewChange={handleViewChange} view={search.view} />
    </Suspense>
  );
}
