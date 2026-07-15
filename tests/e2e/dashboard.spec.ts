import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`${viewport.name}: dashboard remains usable`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await expect(
      page.getByRole("heading", { name: "Organize tarefas, prazos e prioridades." }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nova tarefa" })).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

    await page.getByPlaceholder("Ex: Revisar proposta comercial").fill("Validar nova tarefa");
    await page.getByPlaceholder("Ex: Portfolio").fill("Demonstracao local");
    await page.getByRole("button", { name: "Adicionar tarefa" }).click();
    await expect(page.getByText("Validar nova tarefa").first()).toBeVisible();

    await page.reload();
    await expect(page.getByText("Validar nova tarefa").first()).toBeVisible();

    await page.keyboard.press("Tab");
    const focusIsVisible = await page.evaluate(() => {
      const active = document.activeElement;
      return active instanceof HTMLElement && active.matches(":focus-visible");
    });
    expect(focusIsVisible).toBe(true);
  });
}
