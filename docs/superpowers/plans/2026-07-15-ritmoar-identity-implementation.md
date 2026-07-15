# Ritmoar Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Transformar o fluxo ativo do Dashboard G-Pro na demonstração profissional Ritmoar, preservando todas as funcionalidades e tornando responsáveis, prioridades, prazos e andamento imediatamente legíveis em desktop e mobile.

**Architecture:** Manter o estado local e a composição existentes em `App.tsx`, limitando as mudanças aos componentes ativos, ao modelo de tarefas, aos metadados e aos assets. Acrescentar `owner` ao modelo com normalização retrocompatível de dados no `localStorage`; não importar nem modificar a arquitetura experimental inativa.

**Tech Stack:** React 18, TypeScript 5.9, Vite 6, Tailwind CSS 4, Lucide React, Playwright 1.61.

## Global Constraints

- Nome final: Ritmoar.
- Slogan: “Ritmo claro. Trabalho em movimento.”
- Aparência de SaaS profissional de 2026, limpa e moderna, sem visual retrô.
- Papel quente apenas como base; risco, atraso, sucesso e prioridade devem permanecer inequívocos.
- Não usar identidade de hábitos, música ou Pomodoro.
- Nenhuma regressão em criação, persistência, busca, filtros, mudança de status, exclusão, agenda, relatórios ou preferências.
- Não alterar Firebase, login, contexto de widgets ou componentes experimentais fora do fluxo ativo.
- Contraste WCAG AA, foco visível e controles com área mínima de toque adequada.
- Três commits de implementação: identidade/conteúdo, refinamento visual, documentação/screenshots.

---

## File map

- `src/app/dashboard/task-model.ts`: contrato de tarefa, normalização retrocompatível e conjunto inicial Estúdio Norte.
- `src/app/App.tsx`: shell ativo, textos, navegação, preferências, métricas e estados vazios.
- `src/app/components/NewTaskPanel.tsx`: captura do responsável e linguagem de criação.
- `src/app/components/TaskCard.tsx`: leitura operacional de responsável, prioridade, prazo e ações.
- `src/styles/fonts.css`: pilha tipográfica local e estilos globais mínimos de renderização.
- `index.html`: título, favicon, descrição e metadata social.
- `public/favicon.svg`: símbolo monocromático responsivo da Ritmoar.
- `tests/e2e/task-model.spec.ts`: comportamento do modelo e migração de dados antigos.
- `tests/e2e/dashboard.spec.ts`: identidade, fluxo principal, responsividade, acessibilidade básica e metadata.
- `package.json`, `package-lock.json`: nome e descrição do pacote demonstrativo.
- `README.md`: posicionamento, público, modo demo, recursos e validação.
- `docs/screenshots/ritmoar-desktop.png`, `docs/screenshots/ritmoar-mobile.png`: evidência final real.
- `docs/superpowers/plans/2026-07-15-ritmoar-identity-implementation.md`: plano executado.

---

### Task 1: Proteger o modelo de tarefa e a identidade com testes

**Files:**
- Create: `tests/e2e/task-model.spec.ts`
- Modify: `tests/e2e/dashboard.spec.ts`
- Modify: `src/app/dashboard/task-model.ts`

**Interfaces:**
- Produces: `Task.owner: string`, `normalizeTasks(value: unknown): Task[]` e `createInitialTasks(): Task[]`.
- Consumes: tipos `Task`, `TaskPriority` e `TaskStatus` já existentes.

- [x] **Step 1: escrever os testes falhos do modelo**

Adicionar testes que importem `createInitialTasks` e `normalizeTasks`, exijam que todo item inicial tenha `owner`, que os projetos pertençam ao cenário Estúdio Norte e que tarefas antigas recebam `Equipe Ritmoar` sem perder título, status ou prazo.

```ts
import { expect, test } from "@playwright/test";
import { createInitialTasks, normalizeTasks } from "../../src/app/dashboard/task-model";

test("initial demo tasks form one coherent agency workspace", () => {
  const tasks = createInitialTasks();
  expect(tasks.length).toBeGreaterThanOrEqual(6);
  expect(tasks.every((task) => task.owner.length > 0)).toBe(true);
  expect(tasks.some((task) => task.client === "Casa Mimo")).toBe(true);
  expect(tasks.some((task) => task.client === "Feira da Vila")).toBe(true);
});

test("legacy stored tasks receive a safe owner fallback", () => {
  const tasks = normalizeTasks([{ id: "legacy", title: "Tarefa antiga", client: "Projeto", status: "todo", priority: "media", dueDate: "2026-07-15", estimate: 2 }]);
  expect(tasks).toEqual([expect.objectContaining({ id: "legacy", owner: "Equipe Ritmoar" })]);
});
```

- [x] **Step 2: executar e confirmar RED**

Run: `npx playwright test tests/e2e/task-model.spec.ts`

Expected: FAIL porque `normalizeTasks` e `Task.owner` ainda não existem.

- [x] **Step 3: implementar o contrato mínimo e a normalização**

Adicionar `owner` a `Task`, incluir o campo no conjunto Estúdio Norte e exportar um normalizador que valide arrays e aplique fallback ao campo ausente sem apagar dados válidos.

```ts
export type Task = {
  id: string;
  title: string;
  client: string;
  owner: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimate: number;
};

export function normalizeTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return createInitialTasks();
  return value.filter(isStoredTask).map((task) => ({
    ...task,
    owner: typeof task.owner === "string" && task.owner.trim() ? task.owner : "Equipe Ritmoar",
  }));
}
```

- [x] **Step 4: executar e confirmar GREEN**

Run: `npx playwright test tests/e2e/task-model.spec.ts`

Expected: 2 passed, sem warnings.

- [x] **Step 5: escrever o teste falho da identidade e do formulário**

Atualizar `dashboard.spec.ts` para exigir o título Ritmoar, indicação de demonstração, slogan, campo responsável, ausência de rolagem horizontal e persistência da nova tarefa com responsável.

```ts
await expect(page.getByText("Ritmoar").first()).toBeVisible();
await expect(page.getByText("Demonstração de produto").first()).toBeVisible();
await expect(page.getByText("Ritmo claro. Trabalho em movimento.").first()).toBeVisible();
await page.getByLabel("Responsável").fill("Marina Costa");
await expect(page.getByText("Marina Costa").first()).toBeVisible();
```

- [x] **Step 6: executar e confirmar RED**

Run: `npx playwright test tests/e2e/dashboard.spec.ts --project=chromium`

Expected: FAIL nos seletores de identidade e responsável ainda ausentes.

---

### Task 2: Implementar identidade, conteúdo e metadata

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/components/NewTaskPanel.tsx`
- Modify: `src/app/components/TaskCard.tsx`
- Modify: `index.html`
- Create: `public/favicon.svg`
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `tests/e2e/dashboard.spec.ts`

**Interfaces:**
- Consumes: `Task.owner`, `normalizeTasks()` e `NewTaskDraft` da Task 1.
- Produces: formulário com label `Responsável`, marca Ritmoar e metadata verificável.

- [x] **Step 1: trocar o carregamento para a migração segura**

Em `App.tsx`, substituir o cast direto por `normalizeTasks(JSON.parse(stored))`; manter a chave histórica de armazenamento para não perder dados de usuários existentes.

- [x] **Step 2: acrescentar responsável ao rascunho e à criação**

O estado inicial e o reset usarão `owner: "Marina Costa"`; `addTask()` salvará o valor informado ou `Equipe Ritmoar`.

- [x] **Step 3: atualizar somente os componentes ativos**

Aplicar Ritmoar, Estúdio Norte, slogan, textos operacionais, acentos corretos e estados vazios contextuais. Em `NewTaskPanel`, adicionar um input com `aria-label` derivado do label visível “Responsável”. Em `TaskCard`, exibir o responsável com `UserRound` e manter todas as ações existentes.

- [x] **Step 4: criar favicon e metadata**

Adicionar SVG simples de linhas avançando, `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, `theme-color`, Open Graph e Twitter Card. O título será `Ritmoar — prioridades e trabalho em equipe`.

- [x] **Step 5: atualizar o pacote sem nova dependência**

Alterar nome para `ritmoar-demo` e descrição para `Demonstração de gestão de trabalho e prioridades para pequenas equipes.` em `package.json` e `package-lock.json`.

- [x] **Step 6: executar testes e confirmar GREEN**

Run: `npx playwright test tests/e2e/task-model.spec.ts tests/e2e/dashboard.spec.ts`

Expected: 4 passed (dois testes de modelo e um fluxo em cada viewport), sem warnings.

- [x] **Step 7: verificar qualidade estática**

Run: `npm run typecheck && npm run lint && npm run build`

Expected: três comandos com código 0.

- [x] **Step 8: criar o primeiro commit de implementação**

```powershell
git add src/app/App.tsx src/app/dashboard/task-model.ts src/app/components/NewTaskPanel.tsx src/app/components/TaskCard.tsx index.html public/favicon.svg tests/e2e/dashboard.spec.ts tests/e2e/task-model.spec.ts package.json package-lock.json
git commit -m "feat: establish Ritmoar identity and demo content"
```

---

### Task 3: Refinar a interface operacional

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/components/NewTaskPanel.tsx`
- Modify: `src/app/components/TaskCard.tsx`
- Modify: `src/styles/fonts.css`
- Test: `tests/e2e/dashboard.spec.ts`

**Interfaces:**
- Consumes: identidade e contrato de tarefa da Task 2.
- Produces: layout responsivo Ritmoar sem gradientes decorativos, com estados de alta saliência.

- [x] **Step 1: escrever testes falhos de acessibilidade visual**

Adicionar verificações para foco visível, controles com nome acessível, `main` único, botão de remoção, ausência de overflow e `theme-color`. Validar que prioridade alta, prazo vencido e concluído possuem texto além da cor.

- [x] **Step 2: executar e confirmar RED**

Run: `npx playwright test tests/e2e/dashboard.spec.ts`

Expected: FAIL nas novas garantias ainda não presentes.

- [x] **Step 3: aplicar o sistema visual aprovado**

Usar papel quente apenas no canvas, superfícies claras, grafite, verde operacional, âmbar e terracota; remover brilho, glassmorphism e gradientes. Manter sombras discretas, bordas suaves, espaço em branco e leitura densa sem aperto.

- [x] **Step 4: preservar preferências como função secundária**

Renomear cores e fundos para opções Ritmoar, usar sólidos/padrões CSS locais e rebaixar a personalização na hierarquia sem remover visibilidade, ordem, densidade ou restauração.

- [x] **Step 5: melhorar desktop e mobile**

No desktop, reduzir peso da barra lateral e deixar o trabalho ocupar a maior área. No mobile, manter marca, status demo, navegação e métricas essenciais visíveis; garantir alvos de 44 px e nenhuma rolagem horizontal.

- [x] **Step 6: executar e confirmar GREEN**

Run: `npx playwright test tests/e2e/dashboard.spec.ts`

Expected: 2 passed, sem warnings.

- [x] **Step 7: revisar React e performance**

Confirmar ausência de componentes definidos dentro de componentes, efeitos usados para estado derivado, imports de barrel desnecessários, imagens remotas e novas dependências. Manter inicializadores de `useState` em função para leituras de `localStorage`.

- [x] **Step 8: validar estaticamente e criar o segundo commit**

Run: `npm run typecheck && npm run lint && npm run build && npm test`

Expected: todos com código 0.

```powershell
git add src/app/App.tsx src/app/components/NewTaskPanel.tsx src/app/components/TaskCard.tsx src/styles/fonts.css tests/e2e/dashboard.spec.ts
git commit -m "style: refine Ritmoar operational interface"
```

---

### Task 4: Fazer comparação antes/depois e corrigir regressões objetivas

**Files:**
- Reference: `outputs/tasklyn/01-current-desktop.png`
- Reference: `outputs/tasklyn/02-current-mobile.png`
- Create outside repo: `outputs/ritmoar/after-desktop.png`
- Create outside repo: `outputs/ritmoar/after-mobile.png`
- Modify if required: active files from Tasks 2–3

**Interfaces:**
- Consumes: versão renderizada após o segundo commit.
- Produces: ledger de diferenças e correções antes do commit de documentação.

- [x] **Step 1: iniciar a aplicação e abrir o fluxo alvo**

The flow under test is: `/` -> carregar dados demo -> criar, filtrar e avançar uma tarefa -> confirmar estado renderizado e persistido.

- [x] **Step 2: capturar depois em 1440×900 e 390×844**

Usar o Browser plugin, verificar URL, título, DOM significativo, overlay, console e interação. Salvar evidências fora do repositório.

- [x] **Step 3: comparar lado a lado**

Avaliar primeira dobra, leitura dos títulos, distinção de prioridade/prazo/status, densidade, alvo de toque, navegação, overflow e presença da marca. Registrar qualquer regressão de legibilidade, velocidade ou clareza.

- [x] **Step 4: corrigir apenas regressões objetivas com TDD**

Para cada problema, adicionar primeiro uma asserção Playwright que falhe, aplicar a menor correção e executar o teste até passar. Não acrescentar ornamentos.

- [x] **Step 5: repetir o loop de navegador**

Recarregar a mesma aba, repetir console, DOM, interação e screenshots nos dois viewports.

---

### Task 5: Documentar e atualizar screenshots

**Files:**
- Modify: `README.md`
- Create: `docs/screenshots/ritmoar-desktop.png`
- Create: `docs/screenshots/ritmoar-mobile.png`
- Delete: screenshots antigas somente se deixarem de ser referenciadas
- Modify: `docs/superpowers/plans/2026-07-15-ritmoar-identity-implementation.md`

**Interfaces:**
- Consumes: screenshots aprovadas na comparação da Task 4.
- Produces: documentação final e imagens reais do produto.

- [x] **Step 1: atualizar README**

Documentar Ritmoar, público, proposta, slogan, Estúdio Norte, indicação de demonstração, persistência local, comandos, validações e limitações. Preservar URL histórica correta de clone.

- [x] **Step 2: copiar screenshots finais aprovadas**

Salvar versões reais em `docs/screenshots/ritmoar-desktop.png` e `docs/screenshots/ritmoar-mobile.png`, atualizar referências e remover imagens antigas sem consumidores.

- [x] **Step 3: marcar o plano executado**

Converter os checkboxes concluídos para `[x]` e registrar desvios objetivos, se houver, sem inserir logs extensos.

- [x] **Step 4: validar documentação e assets**

Run: `rg -n -i "Dashboard G-Pro|Organize tarefas, prazos e prioridades|Portfolio LipDev|Plataforma de pedidos" src index.html README.md tests public docs --glob '!docs/superpowers/specs/**' --glob '!docs/superpowers/plans/**'`

Expected: nenhum nome antigo no produto ativo, testes, README ou assets finais.

- [x] **Step 5: criar o terceiro commit**

```powershell
git add README.md docs/screenshots docs/superpowers/plans/2026-07-15-ritmoar-identity-implementation.md docs/superpowers/specs/2026-07-15-ritmoar-product-identity-design.md
git commit -m "docs: document Ritmoar and refresh screenshots"
```

---

### Task 6: Auditoria final e atualização do PR

**Files:**
- No product changes expected.

**Interfaces:**
- Consumes: três commits de implementação completos.
- Produces: branch remota atualizada e relatório verificável.

- [x] **Step 1: instalar do lockfile**

Run: `npm ci`

Expected: código 0, sem alterar arquivos versionados.

- [x] **Step 2: executar a matriz completa**

Run, individualmente e capturando saída completa:

```powershell
npm run typecheck
npm run lint
npm run build
npm test
```

Expected: todos com código 0.

- [x] **Step 3: revisar navegador final**

Usar Browser em 1440×900 e 390×844. Verificar favicon, título, metadata, contraste, textos, estados vazios, criação, busca, filtro, avanço, exclusão, persistência e console sem erros/warnings.

- [x] **Step 4: revisar segurança e escopo**

Run: `git diff --name-only origin/main...HEAD` e busca por `.env`, tokens e padrões de segredo somente nos arquivos alterados. Confirmar que nenhum segredo foi incluído.

- [x] **Step 5: enviar a branch e atualizar o PR existente**

Run: `git push origin feat/portfolio-polish`

Expected: branch remota aponta para o HEAD local; nenhum PR novo é criado.

- [x] **Step 6: coletar auditoria final**

Coletar link do PR, `git status`, `git log -1 --oneline`, hashes dos três commits, arquivos alterados, comandos e screenshots para o relatório em português.

---

## Self-review

- Spec coverage: identidade, dados, metadata, favicon, responsividade, acessibilidade, screenshots, README, comparação e validação estão mapeados.
- Placeholder scan: nenhum TBD, TODO ou passo genérico sem comando/resultado esperado.
- Type consistency: `Task.owner`, `NewTaskDraft`, `normalizeTasks` e seletores de teste são usados de forma consistente.
- Scope: somente o fluxo ativo e seus testes/assets são modificados; arquitetura experimental permanece fora do plano.

## Execution notes

- A comparação lado a lado revelou que o formulário aparecia antes do quadro na primeira dobra. A ordem padrão foi corrigida para priorizar o fluxo de trabalho e protegida por um teste Playwright de posição relativa.
- O Browser validou URL, título, DOM, dados migrados e console. Como a captura integrada via CDP expirou, os arquivos finais foram gerados pelo Chromium do Playwright nas mesmas resoluções obrigatórias.
- A arquitetura experimental inativa permaneceu sem alterações.
