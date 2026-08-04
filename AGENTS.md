# Frontend Agent Instructions

이 파일은 이 프로젝트에서 agent가 작업할 때 읽어야 하는 단일 지침 문서다. 기술 스택, skill 사용 기준, state ownership, UI ownership, 프로젝트 구조 규칙을 모두 여기에 둔다.

상세한 구현 규칙, Incorrect/Correct 예시, 라이브러리별 best practice는 설치된 skill의 `SKILL.md`를 우선 따른다.

## Tech Stack

- Build: Vite
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Routing: TanStack Router
- Server State / API Cache: TanStack Query
- Client UI State: Zustand
- Form: React Hook Form
- Validation: Zod
- Test: Vitest
- Code Quality: ESLint, Prettier
- Package Manager: pnpm

## General Rules

- Use `pnpm` for package commands.
- Use TypeScript strict style.
- Avoid `any` unless there is a clear reason.
- Follow existing project structure and naming conventions before introducing new patterns.
- Do not add new dependencies unless the current stack cannot reasonably solve the problem.
- Handle loading, error, and empty states explicitly.
- Keep accessibility in mind when building UI.
- When a task matches an installed skill, read and follow that skill before implementing.
- Server data and API cache are owned by TanStack Query. Do not copy TanStack Query server data into Zustand.
- Before adding UI markup to a page or large feature file, decide whether it must be a common or feature component. Do not inline reusable controls, repeated patterns, or new UI affordances directly into pages.

## Skill Usage

When a task matches one of the rows below, use the listed skill before implementing.

| Task / Area | Use Tech Stack | Refer to Skill |
| --- | --- | --- |
| Finding relevant skills or deciding which installed skill applies | Agent Skills | `find-skills` |
| React component design, hooks, rendering, memoization, performance, maintainability | React + TypeScript | `vercel-react-best-practices` |
| Component composition, container/presentational split, compound components, reusable UI structure | React | `vercel-composition-patterns` |
| Page/route transitions, shared element transitions, enter/exit/list animations | React View Transitions | `vercel-react-view-transitions` |
| API fetching, query keys, caching, stale time, mutations, invalidation, optimistic updates, infinite queries | TanStack Query | `tanstack-query-best-practices` |
| Routing, route params, search params, navigation, file-based routes, route validation | TanStack Router | `tanstack-router-best-practices` |
| UI primitives, component installation, shadcn registry/preset/components.json patterns | shadcn/ui | `shadcn` |
| Utility-first styling, responsive design, theme variables, variants | Tailwind CSS | `tailwindcss` |
| Advanced layout, CSS Grid/Flexbox composition, sticky layout, responsive grid, container queries, aspect-ratio layout | Tailwind CSS | `tailwindcss-advanced-layouts` |
| UI code review, accessibility checks, UX/design audits, web interface best-practice compliance | Web Interface Guidelines | `web-design-guidelines` |
| Client-only UI state, modal/sidebar/wizard state, selectors, store structure | Zustand | `zustand` |
| Schema validation, API response validation, request payload validation, env validation, form schemas, `z.infer`, `safeParse` | Zod | `zod` |

### How To Explicitly Call Skills

Codex:

```txt
$skill-name
```

Claude Code:

```txt
/skill-name
```

When unsure which skill is relevant, use:

```txt
$find-skills
```

or in Claude Code:

```txt
/find-skills
```

## State Ownership

Use the right tool for the right kind of state.

| State Type | Owner |
| --- | --- |
| Server data from API | TanStack Query |
| API cache | TanStack Query |
| Mutation state | TanStack Query |
| URL-shareable state such as page, sort, filter, tab, keyword | TanStack Router search params |
| Route params | TanStack Router |
| Modal open state | Zustand |
| Sidebar open state | Zustand |
| Wizard step | Zustand |
| Drag/drop UI state | Zustand |
| Form input state | React Hook Form |
| Form validation schema | Zod |

Do not copy TanStack Query server data into Zustand.

## Validation Ownership

Use Zod at application boundaries.

| Validation Target | Tool |
| --- | --- |
| API response | Zod |
| Request payload | Zod |
| Form schema | Zod + React Hook Form |
| Public client env | Zod |
| Route search params | TanStack Router validation, optionally with Zod |

Env rules:

- Do not expose secrets through `VITE_` variables.
- Do not export the entire `import.meta.env` object.
- Allowlist only the public env values the client actually needs.

## UI Ownership

| UI Work | Use |
| --- | --- |
| Base primitives | `src/components/ui` via shadcn/ui |
| App-level reusable components | `src/components/common` |
| Feature-specific components | `src/features/<feature>/components` |
| Layout and responsive styling | Tailwind CSS |
| Complex layout guidance | `tailwindcss-advanced-layouts` |
| Composition guidance | `vercel-composition-patterns` |

Keep shadcn/ui components as primitives. Put product-specific behavior in wrappers or feature components.

## Componentization Rules

Componentization is mandatory, not optional. A page file should compose feature components; it should not become the place where every control, section, table row, drawer body, and interaction is implemented inline.

When adding or changing UI, apply these rules before writing markup:

- If the UI is a reusable app pattern, put it in `src/components/common`.
- If the UI belongs to one domain or screen, put it in `src/features/<feature>/components`.
- If the UI is based on a shadcn/ui primitive, wrap it in a meaningful common or feature component when product-specific styling or behavior is added.
- If a control has a semantic purpose such as refresh, edit, delete, close, status display, section header, table row, drawer content, empty state, or loading state, prefer a named component over inline JSX.
- If the same Tailwind class combination appears more than once, extract a component or a small local constant.
- If adding markup makes a page file longer or mixes data loading, event handling, and detailed rendering, split the rendering into components in the same change.
- If a file is already large, do not add more inline UI to it. Extract first, then implement.

Inline JSX is acceptable only for simple one-off structural layout with no product-specific behavior, no repeated styling pattern, and no reasonable chance of reuse. When unsure, componentize.

Before finishing UI work, check:

- Page files remain mostly composition and state wiring.
- Reusable controls are in `src/components/common`.
- Feature-only UI is in `src/features/<feature>/components`.
- shadcn/ui primitives are not carrying product-specific behavior directly in page files.
- New buttons/icons/sections/tables/drawers are named components unless they are truly trivial.

## Recommended Project Structure

```txt
src/
  app/
    main.tsx
    router.tsx
    providers.tsx
    query-client.ts          # TanStack Query Client 설정

  routes/                    # TanStack Router 라우트 파일들
    __root.tsx
    index.tsx
    users.tsx
    users.index.tsx
    users.$userId.tsx

  features/                  # UI + 도메인 로직 (Presentation Layer)
    auth/
      components/
      hooks/                 # feature 전용 커스텀 훅
      stores/                # feature 전용 Zustand store (UI 상태만)
      index.ts               # public API - 외부에서 이것만 import
    users/
      components/
      hooks/
      stores/
      index.ts

  data-access/               # 서버 통신 전담 레이어
    api/
      client.ts              # base URL, interceptor, 401 처리
      index.ts
    queries/
      auth/
        queries.ts
        mutations.ts
        keys.ts              # auth 도메인 query key factory
      users/
        queries.ts
        mutations.ts
        keys.ts              # users 도메인 query key factory
    schemas/
      auth.ts
      user.ts
      index.ts
    types/
      auth.ts
      user.ts
      common.ts              # ApiResponse<T>, PaginatedResponse<T> 등 공통 타입
      index.ts

  components/
    ui/                      # shadcn/ui 생성 파일 - 직접 수정 금지
    common/                  # 앱 전용 wrapper 컴포넌트

  lib/
    env.ts
    utils.ts
    constants.ts             # 전역 상수만 (route paths, app 설정 등)

  test/
    setup.ts
    render.tsx
    mocks/
      handlers/
        auth.ts
        users.ts
      server.ts              # setupServer()
      browser.ts             # setupWorker()
```
