import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`${viewport.name}: Ritmoar remains usable and identifiable`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await expect(page).toHaveTitle(
      "Ritmoar — prioridades e trabalho em equipe",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /gestão de trabalho e prioridades/i,
    );
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      "href",
      "/favicon.svg",
    );
    await expect(page.locator("main")).toHaveCount(1);
    const brandRegion = viewport.name === "mobile" ? page.locator("header") : page.locator("aside");
    await expect(brandRegion.getByText("Ritmoar")).toBeVisible();
    await expect(brandRegion.getByText("Demonstração de produto")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Ritmo claro. Trabalho em movimento.",
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nova tarefa" })).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

    await page.getByRole("textbox", { name: "Tarefa", exact: true }).fill("Validar nova tarefa");
    await page.getByRole("textbox", { name: "Cliente ou projeto", exact: true }).fill("Casa Mimo");
    await page.getByRole("textbox", { name: "Responsável", exact: true }).fill("Marina Costa");
    await page.getByRole("button", { name: "Adicionar tarefa" }).click();

    await expect(page.getByText("Validar nova tarefa").first()).toBeVisible();
    await expect(page.getByText("Marina Costa").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Remover tarefa: Validar nova tarefa" }),
    ).toBeVisible();

    await page.reload();
    await expect(page.getByText("Validar nova tarefa").first()).toBeVisible();
    await expect(page.getByText("Marina Costa").first()).toBeVisible();

    await page.keyboard.press("Tab");
    const focusIsVisible = await page.evaluate(() => {
      const active = document.activeElement;
      return active instanceof HTMLElement && active.matches(":focus-visible");
    });
    expect(focusIsVisible).toBe(true);
  });
}
