import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { createEcho, listEchoes, uploadAttachmentFile } from "../api/echo.api";
import { newEchoDraftKey } from "../lib/draft-storage";
import { echoQueryKeys, toEchoFeedItemViewModel } from "../model";
import { EchoCard } from "./echo-card";
import { EchoComposer } from "./echo-composer";

interface EchoFeedPageProps {
  onSearchChange?: (q: string) => void;
  searchTerm?: string;
}

export function EchoFeedPage({
  onSearchChange,
  searchTerm = "",
}: EchoFeedPageProps) {
  const queryClient = useQueryClient();
  const [searchDraft, setSearchDraft] = useState(searchTerm);
  const publishedListKey = echoQueryKeys.list({
    q: searchTerm || undefined,
    status: "published",
  });
  const listQuery = useInfiniteQuery({
    queryKey: publishedListKey,
    queryFn: ({ pageParam }) =>
      listEchoes({
        cursor: pageParam,
        q: searchTerm || undefined,
        status: "published",
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const createMutation = useMutation({
    mutationFn: async (input: { body: string; files: File[] }) => {
      const attachments = await Promise.all(
        input.files.map((file) => uploadAttachmentFile(file)),
      );

      return createEcho({
        body: input.body,
        attachmentIds: attachments.map((attachment) => attachment.id),
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["echoes", "list"],
      }),
  });
  const items =
    listQuery.data?.pages
      .flatMap((page) => page.items)
      .map(toEchoFeedItemViewModel) ?? [];
  const errorMessage =
    createMutation.error instanceof Error
      ? createMutation.error.message
      : "메아리가 길을 잃었어요. 잠시 뒤 다시 불러와 주세요.";

  useEffect(() => {
    setSearchDraft(searchTerm);
  }, [searchTerm]);

  return (
    <main className="page-shell echo-page">
      <section className="hero-shell">
        <div className="grid gap-2">
          <p className="kicker">Echo</p>
          <h1 className="hero-title">짧게 쓰고, 다시 이어받는 공간</h1>
          <p className="hero-copy">
            떠오른 생각을 빠르게 남기고, 필요할 때 아카이브와 댓글로 흐름을
            정리합니다.
          </p>
        </div>
      </section>

      <section className="compose-section">
        <div className="compose-panel">
          <div className="compose-heading">
            <div className="compose-title-group">
              <p className="kicker">Compose</p>
              <h2 className="card-heading">무슨 생각을 남길까요?</h2>
              <span className="caption-copy">
                가볍게 쓰고 나중에 다시 보세요.
              </span>
            </div>
          </div>
          <EchoComposer
            disabled={createMutation.isPending}
            draftKey={newEchoDraftKey}
            mode="create"
            onSubmit={(body, files) =>
              createMutation.mutateAsync({ body, files })
            }
          />
        </div>
        {createMutation.isError ? (
          <p className="status-note status-note-danger">{errorMessage}</p>
        ) : null}
      </section>

      <section className="feed-panel">
        <div className="feed-controls">
          <div className="section-toolbar">
            <div>
              <p className="kicker">Feed</p>
              <h2 className="section-heading">최근 Echo</h2>
            </div>
            <div className="action-strip">
              <Button asChild size="sm" variant="ghost">
                <a href="/echoes/archive">아카이브 보기</a>
              </Button>
              <span className="muted-copy">{items.length}개 표시 중</span>
            </div>
          </div>

          <form
            className="action-strip"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchChange?.(searchDraft);
            }}
          >
            <label className="sr-only" htmlFor="echo-search">
              Echo 검색
            </label>
            <Input
              className="min-w-0 flex-1"
              id="echo-search"
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

        {listQuery.isPending ? (
          <p className="status-note">메아리를 불러오는 중이에요.</p>
        ) : null}
        {listQuery.isError ? (
          <p className="status-note">
            메아리가 길을 잃었어요. 잠시 뒤 다시 불러와 주세요.
          </p>
        ) : null}
        {!listQuery.isPending && !listQuery.isError && items.length === 0 ? (
          <p className="status-note">
            아직 울린 메아리가 없어요. 첫 Echo 를 남겨볼까요?
          </p>
        ) : null}

        <div className="list-grid">
          {items.map((echo) => (
            <EchoCard echo={echo} key={echo.id} />
          ))}
        </div>

        {listQuery.hasNextPage ? (
          <Button
            disabled={listQuery.isFetchingNextPage}
            onClick={() => void listQuery.fetchNextPage()}
            type="button"
            variant="secondary"
          >
            {listQuery.isFetchingNextPage
              ? "메아리를 더 불러오는 중이에요."
              : "더 불러오기"}
          </Button>
        ) : null}
      </section>
    </main>
  );
}
