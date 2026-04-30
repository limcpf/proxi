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
  }, [searchTerm]);

  return (
    <main className="page-shell echo-page">
      <section className="hero-shell">
        <div className="action-strip">
          <Button asChild size="sm" variant="ghost">
            <a href="/echoes">피드로 돌아가기</a>
          </Button>
        </div>
        <div className="grid gap-2">
          <p className="kicker">Archive</p>
          <h1 className="hero-title">아카이브된 Echo 를 다시 살펴보기</h1>
          <p className="hero-copy">
            피드에서 숨긴 Echo 를 확인하고 필요한 항목은 원래 작성일 위치로
            복구합니다.
          </p>
        </div>
      </section>

      <section className="feed-panel">
        <div className="feed-controls">
          <div className="section-toolbar">
            <div>
              <p className="kicker">Archived Echoes</p>
              <h2 className="section-heading">아카이브 목록</h2>
            </div>
            <span className="muted-copy">{items.length}개 표시 중</span>
          </div>

          <form
            className="action-strip"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchChange?.(searchDraft);
            }}
          >
            <label className="sr-only" htmlFor="echo-archive-search">
              아카이브 검색
            </label>
            <Input
              className="min-w-0 flex-1"
              id="echo-archive-search"
              onChange={(event) => setSearchDraft(event.currentTarget.value)}
              placeholder="아카이브 본문 검색"
              value={searchDraft}
            />
            <Button size="sm" type="submit" variant="secondary">
              검색
            </Button>
            {searchTerm ? (
              <Button
                onClick={() => {
                  setSearchDraft("");
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

        <div className="list-grid">
          {items.map((echo) => (
            <div className="grid gap-2" key={echo.id}>
              <EchoCard echo={echo} />
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
