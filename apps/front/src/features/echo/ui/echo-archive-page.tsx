import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { listArchivedEchoes, restoreEcho } from "../api/echo.api";
import { echoQueryKeys, toEchoFeedItemViewModel } from "../model";
import { EchoCard } from "./echo-card";

interface EchoArchivePageProps {
  onSearchChange?: (q: string) => void;
  searchTerm?: string;
}

export function EchoArchivePage({
  onSearchChange,
  searchTerm = "",
}: EchoArchivePageProps) {
  const queryClient = useQueryClient();
  const [searchDraft, setSearchDraft] = useState(searchTerm);
  const [isSearchOpen, setIsSearchOpen] = useState(searchTerm.length > 0);
  const archiveKey = echoQueryKeys.archive({
    q: searchTerm || undefined,
  });
  const archiveQuery = useInfiniteQuery({
    queryKey: archiveKey,
    queryFn: ({ pageParam }) =>
      listArchivedEchoes({
        cursor: pageParam,
        q: searchTerm || undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const restoreMutation = useMutation({
    mutationFn: (echoId: string) => restoreEcho(echoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["echoes", "archive"],
      });
      queryClient.invalidateQueries({
        queryKey: ["echoes", "list"],
      });
    },
  });
  const items =
    archiveQuery.data?.pages
      .flatMap((page) => page.items)
      .map(toEchoFeedItemViewModel) ?? [];

  useEffect(() => {
    setSearchDraft(searchTerm);
    if (searchTerm.length > 0) {
      setIsSearchOpen(true);
    }
  }, [searchTerm]);

  const shouldShowSearch = isSearchOpen || searchTerm.length > 0;

  return (
    <main className="page-shell echo-page echo-feed-page">
      <section className="feed-panel">
        <div className="feed-controls">
          <div className="feed-toolbar">
            <div className="feed-title-row">
              <h1 className="feed-title">아카이브</h1>
              <span className="feed-count">{items.length}개</span>
            </div>
            <div className="feed-toolbar-actions">
              {shouldShowSearch ? null : (
                <Button
                  onClick={() => setIsSearchOpen(true)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  검색
                </Button>
              )}
              <Button asChild size="sm" variant="ghost">
                <a href="/echoes">피드</a>
              </Button>
            </div>
          </div>

          {shouldShowSearch ? (
            <form
              className="feed-search-form action-strip"
              onSubmit={(event) => {
                event.preventDefault();
                onSearchChange?.(searchDraft);
                if (searchDraft.trim().length === 0) {
                  setIsSearchOpen(false);
                }
              }}
            >
              <label className="sr-only" htmlFor="echo-archive-search">
                아카이브 검색
              </label>
              <Input
                className="min-w-0 flex-1"
                id="echo-archive-search"
                onChange={(event) => setSearchDraft(event.currentTarget.value)}
                placeholder="본문 검색"
                value={searchDraft}
              />
              <Button size="sm" type="submit" variant="secondary">
                검색
              </Button>
              {searchTerm ? (
                <Button
                  onClick={() => {
                    setSearchDraft("");
                    setIsSearchOpen(false);
                    onSearchChange?.("");
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  초기화
                </Button>
              ) : null}
            </form>
          ) : null}
        </div>

        {archiveQuery.isPending ? (
          <p className="status-note">메아리를 불러오는 중이에요.</p>
        ) : null}
        {archiveQuery.isError ? (
          <p className="status-note">
            아카이브를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.
          </p>
        ) : null}
        {!archiveQuery.isPending &&
        !archiveQuery.isError &&
        items.length === 0 ? (
          <p className="status-note">아카이브된 Echo 가 없어요.</p>
        ) : null}

        <div className="echo-feed-list list-grid">
          {items.map((echo) => (
            <div className="archive-row" key={echo.id}>
              <EchoCard echo={echo} />
              <div className="archive-row-actions">
                <Button
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreMutation.mutate(echo.id)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  복구
                </Button>
              </div>
            </div>
          ))}
        </div>

        {restoreMutation.isError ? (
          <p className="status-note">
            Echo 를 복구하지 못했어요. 잠시 뒤 다시 시도해 주세요.
          </p>
        ) : null}

        {archiveQuery.hasNextPage ? (
          <Button
            disabled={archiveQuery.isFetchingNextPage}
            onClick={() => void archiveQuery.fetchNextPage()}
            type="button"
            variant="secondary"
          >
            {archiveQuery.isFetchingNextPage
              ? "메아리를 더 불러오는 중이에요."
              : "더 불러오기"}
          </Button>
        ) : null}
      </section>
    </main>
  );
}
