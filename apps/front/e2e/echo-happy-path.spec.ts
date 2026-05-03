import { expect, test } from "@playwright/test";

test("Echo 작성, 목록 확인, 상세 진입, 댓글 작성", async ({ page }) => {
  const suffix = Date.now();
  const body = `E2E Echo ${suffix}`;
  const reply = `E2E Reply ${suffix}`;

  await page.goto("/echoes");
  await page.getByLabel("새 Echo 본문").fill(body);
  await page.getByRole("button", { name: "Echo 남기기" }).click();

  const card = page.locator("article", { hasText: body }).first();
  await expect(card).toBeVisible();
  await card.getByRole("link", { name: "상세" }).click();

  await expect(page.getByText(body)).toBeVisible();
  await page.getByLabel("댓글 본문").fill(reply);
  await page.getByRole("button", { name: "댓글 남기기" }).click();

  await expect(page.getByText(reply)).toBeVisible();
});
