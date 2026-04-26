import { createRootRoute, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <main className="page-shell">
      <section className="surface-panel">
        <p className="section-heading">요청한 화면을 찾지 못했습니다.</p>
      </section>
    </main>
  ),
});
