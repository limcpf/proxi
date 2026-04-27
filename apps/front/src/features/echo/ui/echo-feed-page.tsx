import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createEcho, listEchoes } from "../api/echo.api";
import { newEchoDraftKey } from "../lib/draft-storage";
import { echoQueryKeys, toEchoFeedItemViewModel } from "../model";
import { EchoCard } from "./echo-card";
import { EchoComposer } from "./echo-composer";

const publishedListKey = echoQueryKeys.list({
  status: "published",
});

export function EchoFeedPage() {
  const queryClient = useQueryClient();
  const listQuery = useInfiniteQuery({
    queryKey: publishedListKey,
    queryFn: ({ pageParam }) =>
      listEchoes({
        cursor: pageParam,
        status: "published",
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const createMutation = useMutation({
    mutationFn: (body: string) => createEcho({ body }),
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

  return (
    <main className="page-shell echo-page">
      <section className="hero-shell grid gap-5">
        <p className="kicker">Echo</p>
        <div className="grid gap-3">
          <h1 className="hero-title">생각을 짧게 울리고, 다시 이어받는 공간</h1>
          <p className="hero-copy">
            첫 버전의 Echo 는 개인 피드형 글입니다. 작성한 Echo 는 곧바로 피드에
            쌓이고, 상세에서 댓글과 수정 흐름으로 이어집니다.
          </p>
        </div>
        <EchoComposer
          disabled={createMutation.isPending}
          draftKey={newEchoDraftKey}
          mode="create"
          onSubmit={(body) => createMutation.mutateAsync(body)}
        />
        {createMutation.isError ? (
          <p className="status-note">{errorMessage}</p>
        ) : null}
      </section>

      <section className="surface-panel grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="kicker">Feed</p>
            <h2 className="section-heading">최근 Echo</h2>
          </div>
          <span className="muted-copy">{items.length}개 표시 중</span>
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
          <button
            className="echo-load-more"
            disabled={listQuery.isFetchingNextPage}
            onClick={() => void listQuery.fetchNextPage()}
            type="button"
          >
            {listQuery.isFetchingNextPage
              ? "메아리를 더 불러오는 중이에요."
              : "더 불러오기"}
          </button>
        ) : null}
      </section>
    </main>
  );
}
