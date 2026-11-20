# Project structure

This repository uses the Next.js App Router. Its route files stay in `src/app`, where Next.js discovers pages and API endpoints. Keep reusable code in the folders beside it:

```text
src/
  app/                 Pages, layouts, route-specific UI, and API route entrypoints
  frontend/
    components/        Reusable React components
    hooks/              Browser and form hooks
  backend/
    guardian/           Guardian portal and account business logic
    security/           Request security and rate limiting
    services/           Hedera and Dovu service integrations
    db.ts               Database access
    inboxAuth.ts        Inbox authentication
  shared/
    data/               Data used by multiple parts of the app
    guardian/           Shared Guardian types, constants, and permissions
  proxy.ts              Next.js request proxy entrypoint

public/assets/          Images, CSS, and JavaScript served as static assets
scripts/                Local maintenance and asset-fetching scripts
supabase/               Supabase configuration and database assets
legacy/static-site/     Older standalone HTML pages kept for reference
```

Keep Next.js `page.tsx`, `layout.tsx`, and `route.ts` entrypoints under `src/app`. Put their reusable interface pieces in `src/frontend`, server-side logic in `src/backend`, and definitions shared by both in `src/shared`.

The archived HTML pages are not part of the active Next.js app. The active routes are implemented in `src/app`.
