import { createRootRoute, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: AppFrame,
  notFoundComponent: () => (
    <main className="page-shell echo-page">
      <section className="surface-panel">
        <p className="section-heading">요청한 화면을 찾지 못했습니다.</p>
      </section>
    </main>
  ),
});

function AppFrame() {
  return (
    <div className="app-frame">
      <header className="app-masthead">
        <div className="app-masthead-inner">
          <a className="app-brand" href="/echoes">
            <span aria-hidden="true" className="app-brand-mark" />
            <span>Proxi Echo</span>
          </a>
          <nav aria-label="주요 화면" className="app-nav">
            <a className="app-nav-link" href="/echoes">
              피드
            </a>
            <a className="app-nav-link" href="/echoes/archive">
              아카이브
            </a>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
