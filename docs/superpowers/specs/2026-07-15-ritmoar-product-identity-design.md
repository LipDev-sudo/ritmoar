# Ritmoar — especificação de identidade e conteúdo

## Objetivo

Consolidar o fluxo ativo como uma demonstração coerente do produto fictício Ritmoar para gestão de trabalho de pequenas equipes, freelancers e agências, preservando as funcionalidades atuais e sem alterar a arquitetura experimental que não participa da aplicação em produção.

## Posicionamento aprovado

- **Nome:** Ritmoar
- **Categoria:** gestão de trabalho e prioridades para pequenas equipes
- **Público:** pequenas equipes, freelancers e agências
- **Proposta de valor:** organizar prioridades, responsáveis e andamento do trabalho com clareza, sem excesso de complexidade
- **Personalidade:** direta, humana, organizada e operacional
- **Slogan:** “Ritmo claro. Trabalho em movimento.”
- **Limite semântico:** a identidade não deve remeter a hábitos, música ou Pomodoro. “Ritmo” significa cadência coletiva de execução, visibilidade e entrega.

## Direção verbal

O produto fala em português brasileiro, com frases curtas e verbos de ação. A linguagem deve nomear o trabalho real: prioridade, responsável, prazo, andamento, entrega, bloqueio e equipe. Evitar promessas grandiosas, jargão ágil desnecessário e termos genéricos como “transforme seu negócio”.

Exemplos de voz:

- “Veja o que pede atenção agora.”
- “Prioridades da semana” em vez de “Sprint ativo”, quando a interface não modela sprints de verdade.
- “Não há tarefas nesta etapa.” em estados vazios, com orientação contextual sobre busca e filtros quando aplicável.
- “Avançar tarefa” e “Excluir tarefa” em rótulos acessíveis, em vez de ações ambíguas.
- A demonstração será identificada com clareza, sem sugerir clientes, usuários ou resultados reais.

## Cenário fictício e dados

A demonstração representará uma única pequena agência fictícia chamada **Estúdio Norte**, com uma equipe enxuta trabalhando em projetos consistentes. Os nomes dos projetos serão contextos de trabalho, não marcas concorrentes nem outros projetos do portfólio.

Conjunto inicial previsto:

- Aprovar roteiro da campanha de lançamento — projeto Casa Mimo — responsável Marina Costa.
- Ajustar página de captação — projeto Casa Mimo — responsável Caio Mendes.
- Preparar variações para redes sociais — projeto Feira da Vila — responsável Luiza Ramos.
- Revisar orçamento de produção — projeto Feira da Vila — responsável Marina Costa.
- Consolidar aprendizados da retrospectiva — Operação interna — responsável Caio Mendes.
- Entregar guia visual ao cliente — projeto Casa Mimo — responsável Luiza Ramos.

O modelo de dados atual será estendido apenas se necessário para exibir responsáveis. Criação, busca, filtros, mudança de status, exclusão, preferências e persistência local devem continuar funcionando. Dados antigos salvos pelo usuário não serão apagados sem migração ou fallback seguro.

## Sistema visual

### Paleta

- **Papel:** `#F4F1E8` — fundo principal quente e neutro.
- **Superfície:** `#FFFDF8` — cartões e áreas de trabalho.
- **Grafite:** `#1D2521` — texto principal e contraste estrutural.
- **Verde de operação:** `#2F6B4F` — ação principal, foco e andamento saudável.
- **Âmbar de atenção:** `#C98532` — prazos e atenção moderada.
- **Terracota de risco:** `#B9573F` — atraso e prioridade alta.
- **Sálvia:** `#A8B8A6` — apoio, divisores e estados secundários.

Azul e roxo deixam de ser a assinatura principal. Não haverá gradientes decorativos. Variações de fundo e cor continuarão existindo como preferência funcional, mas serão convertidas em superfícies sólidas ou padrões discretos alinhados à marca.

### Tipografia

Será usada uma pilha de fontes de interface sem dependência externa: `Inter`, `Aptos`, `Segoe UI`, `sans-serif`. A diferenciação virá de hierarquia, peso e espaçamento, não de fontes ornamentais. Títulos usarão peso 700–800; textos e controles, 400–600. Caixa alta ficará restrita a pequenos marcadores operacionais.

### Logotipo e favicon

O logotipo será tipográfico, acompanhado por um símbolo simples: três linhas de trabalho alinhadas que avançam para a direita, formando um “R” abstrato apenas em tamanhos maiores. O desenho deve funcionar em uma cor, em 16 px e sem efeitos tridimensionais. O favicon será um SVG independente com o mesmo princípio, além de referência adequada no HTML.

### Ícones

Manter Lucide para evitar uma nova dependência. Usar traço consistente, tamanho contido e ícones apenas quando ajudam a localizar uma ação. Evitar ícones decorativos, emojis e símbolos musicais, relógios de Pomodoro ou chamas de hábito.

### Imagens

A aplicação não dependerá de fotografias genéricas ou imagens remotas. A direção visual é de produto operacional: superfícies, listas, marcadores, responsáveis e progresso. As imagens de apresentação serão screenshots reais da aplicação nos viewports exigidos.

### Diferenciação

Ritmoar será reconhecível por:

- composição clara e editorial, com fundo quente e cartões brancos;
- barra lateral compacta, priorizando navegação e contexto da equipe;
- marcador linear de fluxo em vez de colunas que imitem cartões do Trello;
- presença visível de responsáveis, prazos e risco em cada tarefa;
- densidade útil e hierarquia operacional, sem brilho, glassmorphism ou fundos de “tecnologia”.

## Estrutura da interface ativa

### Desktop

- Barra lateral com marca, identificação “Demonstração de produto”, navegação e resumo discreto da equipe.
- Controles de personalização preservados, porém visualmente subordinados e com nomenclatura da marca.
- Cabeçalho com contexto da semana, proposta de valor e resumo do que precisa de atenção.
- Painel com criação de tarefa, prioridades, quadro, agenda e leitura operacional.

### Mobile

- Cabeçalho compacto com símbolo e nome Ritmoar sempre visíveis.
- Navegação horizontal acessível e rolável quando necessário.
- Métricas prioritárias antes dos controles secundários.
- Formulários e ações com áreas de toque de pelo menos 44 px.
- Colunas e cartões sem rolagem horizontal obrigatória.

## Metadata e documentação

O HTML deverá incluir:

- título “Ritmoar — prioridades e trabalho em equipe”;
- descrição específica da demonstração;
- favicon SVG;
- Open Graph e Twitter Card básicos, sem inventar métricas ou clientes;
- `theme-color` coerente com a paleta;
- idioma `pt-BR` preservado.

O README apresentará nome, posicionamento, público, recursos demonstráveis, modo demo local, limitações e passos de execução. As capturas desktop e mobile serão refeitas após a validação final.

## Acessibilidade, contraste e qualidade

- Contraste mínimo WCAG AA para texto e controles.
- Estados de foco visíveis e coerentes.
- Rótulos claros para busca, filtros e ações por ícone.
- Estrutura de títulos sem saltos relevantes.
- Estados vazios distinguindo ausência real de tarefas de ausência causada por busca/filtro.
- Respeito a `prefers-reduced-motion`; nenhum movimento decorativo será introduzido.
- Sem erros ou warnings no console.

## Limites de implementação

- Não alterar Firebase, contexto de widgets, login ou componentes experimentais não importados pelo fluxo ativo.
- Não reestruturar rotas, estado global ou arquitetura.
- Não adicionar serviços, analytics, autenticação ou integrações.
- Não inventar clientes reais, depoimentos, receita ou métricas de mercado.
- Não remover funcionalidades atuais de criação, persistência, filtros, status, relatórios, agenda ou preferências.

## Organização dos commits

Após esta especificação, a implementação será separada em:

1. `feat: establish Ritmoar identity and demo content`
2. `style: refine Ritmoar operational interface`
3. `docs: document Ritmoar and refresh screenshots`

Cada etapa será validada no fluxo ativo e o Pull Request existente será atualizado sem merge.

## Critérios de aceite

- Nome antigo ausente do fluxo ativo, metadata, testes e documentação de produto, exceto quando necessário no URL histórico do repositório.
- Marca, textos e dados coerentes em desktop e mobile.
- Favicon, título e metadata verificáveis no navegador.
- Funcionalidades atuais preservadas.
- `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build` e E2E com código de saída 0.
- Playwright revisado em 1440×900 e 390×844, sem erros de console.
- Screenshots reais atualizadas e PR existente publicado com os três commits de implementação.
