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

    const primaryNav = page.getByRole("navigation", {
      name: "Navegação principal",
    });
    await expect(primaryNav).toBeVisible();
    await expect(
      primaryNav.getByRole("button", { name: "Painel" }),
    ).toHaveAttribute("aria-current", "page");

    if (viewport.name === "mobile") {
      const navButtons = await primaryNav.getByRole("button").all();
      for (const button of navButtons) {
        const box = await button.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    }

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

test("Ritmoar uses the approved clean operational visual foundation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  const mainBackground = await page.locator("main").evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(mainBackground).toBe("rgb(244, 241, 232)");

  const decorativeGradients = await page.locator("main *").evaluateAll(
    (elements) =>
      elements.filter((element) =>
        getComputedStyle(element).backgroundImage.includes("gradient"),
      ).length,
  );
  expect(decorativeGradients).toBe(0);

  const workflowTop = await page
    .getByRole("heading", { name: "Fluxo de trabalho" })
    .evaluate((element) => element.getBoundingClientRect().top);
  const newTaskTop = await page
    .getByRole("heading", { name: "Nova tarefa" })
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(workflowTop).toBeLessThan(newTaskTop);

  await expect(page.getByText("Vence hoje").first()).toBeVisible();
  await expect(page.getByText("Alta").first()).toBeVisible();
  await expect(page.getByText("Concluído").first()).toBeVisible();
});

test("navigation, filters, status, deletion and preferences keep working", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });

  await navigation.getByRole("button", { name: "Agenda" }).click();
  await expect(page.getByRole("heading", { name: "Agenda por prazo" })).toBeVisible();

  await navigation.getByRole("button", { name: "Relatórios" }).click();
  await expect(page.getByRole("heading", { name: "Relatório da semana" })).toBeVisible();

  await navigation.getByRole("button", { name: "Tarefas" }).click();
  const priority = page.getByRole("combobox", { name: "Filtrar por prioridade" });
  await priority.selectOption("alta");
  await expect(page.getByText("Consolidar aprendizados da retrospectiva")).toHaveCount(0);

  const search = page.getByRole("textbox", {
    name: "Buscar por tarefa, projeto ou responsável",
  });
  await search.fill("Marina Costa");
  await expect(page.getByText("Revisar orçamento de produção")).toBeVisible();
  await expect(page.getByText("Ajustar página de captação")).toHaveCount(0);

  await search.clear();
  await priority.selectOption("todas");
  await page
    .getByRole("button", { name: "Avançar tarefa: Ajustar página de captação" })
    .click();
  const doingColumn = page.locator("div").filter({
    has: page.getByRole("heading", { name: "Em Progresso" }),
  });
  await expect(doingColumn.getByText("Ajustar página de captação")).toBeVisible();

  await page
    .getByRole("button", { name: "Remover tarefa: Ajustar página de captação" })
    .click();
  await expect(page.getByText("Ajustar página de captação")).toHaveCount(0);

  await navigation.getByRole("button", { name: "Painel" }).click();
  await page.getByText("Personalizar painel", { exact: true }).click();
  await page
    .getByRole("button", { name: "Nova tarefa", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Nova tarefa" })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Nova tarefa" })).toHaveCount(0);
});
