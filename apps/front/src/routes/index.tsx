import { createRoute, useNavigate } from "@tanstack/react-router";
import type { FrontHarnessView } from "../features/front-harness/model";
import { parseFrontHarnessSearch } from "../features/front-harness/model";
import { FrontHarnessPage } from "../features/front-harness/ui/front-harness-page";
import { rootRoute } from "./root";

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
    <FrontHarnessPage onViewChange={handleViewChange} view={search.view} />
  );
}
