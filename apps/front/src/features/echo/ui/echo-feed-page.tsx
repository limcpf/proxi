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
  const [isSearchOpen, setIsSearchOpen] = useState(searchTerm.length > 0);
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
    if (searchTerm.length > 0) {
      setIsSearchOpen(true);
    }
  }, [searchTerm]);

  const shouldShowSearch = isSearchOpen || searchTerm.length > 0;

  return (
    <main className="page-shell echo-page echo-feed-page">
      <section aria-label="새 Echo 작성" className="compose-section">
        <div className="compose-panel">
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
          <div className="feed-toolbar">
            <div className="feed-title-row">
              <h1 className="feed-title">최근</h1>
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
                <a href="/echoes/archive">아카이브</a>
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

        <div className="echo-feed-list list-grid">
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
