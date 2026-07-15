# UNIZIK Postgraduate LMS Report Portal

A role-based reporting portal for UNIZIK postgraduate operations. This app is built with Next.js 16, React 19, NextAuth, Tailwind CSS, and MongoDB.

## Project overview

The portal supports:
- secure login and registration flows
- role-based access for admins, faculty officers, examiners, and students
- faculty, department, curriculum, and student management
- examiner reports, compliance tracking, and report exports
- dashboard overview with quick actions and status summaries

## Table of Contents

1. [Getting started](#getting-started)
2. [App structure](#app-structure)
3. [Authentication and access control](#authentication-and-access-control)
4. [Core workflows](#core-workflows)
5. [How to add new pages](#how-to-add-new-pages)
6. [How to add a new API route](#how-to-add-a-new-api-route)
7. [How to add or update a model](#how-to-add-or-update-a-model)
8. [Environment variables](#environment-variables)
9. [Production notes](#production-notes)
10. [Useful files and components](#useful-files-and-components)

## Getting started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000` in the browser.

### Build for production

```bash
npm run build
npm run start
```

## App structure

The app uses the Next.js App Router with nested layouts.

### Key folders

- `src/app/` - main application routes and layouts.
  - `layout.tsx` - root layout and metadata.
  - `manifest.ts` - web manifest for icons and PWA metadata.
  - `(auth)/` - authentication pages and layout.
  - `(dashboard)/` - authenticated dashboard pages and layout.
  - `api/` - server API endpoints.
- `src/components/` - reusable UI components.
  - `auth/` - login, register, forgot, reset page components.
  - `layout/` - sidebar, topbar, dashboard header.
  - `shared/` - export buttons, offline banner, stepper nav.
- `src/lib/` - shared utilities.
  - `db/connectDB.ts` - MongoDB connection helper.
  - `auth.ts` - next-auth type augmentations and config export.
  - `data/portal.ts` - shared data loaders and query helpers.
- `src/models/` - Mongoose schemas for domain entities.

### Route organization

- Public auth pages:
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/reset-password/[token]`
- Dashboard pages:
  - `/dashboard`
  - `/dashboard/faculty-departments`
  - `/dashboard/curriculum`
  - `/dashboard/examiner-report`
  - `/dashboard/student-reports`
  - `/dashboard/reports`
  - `/dashboard/students`
  - `/dashboard/users`
  - `/dashboard/settings/profile`

## Authentication and access control

### NextAuth setup

Authentication is configured in:
- `src/app/api/auth/[...nextauth]/options.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/auth.ts`

The app uses the `credentials` provider with email and password.

The session strategy is JWT-based.

### Middleware protection

`src/middleware.ts` protects private routes using `next-auth/jwt`.

Public routes:
- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/api/auth`
- `/api/faculties`

Private routes are protected by role and session checks.

### Role-based navigation

The sidebar uses `src/components/layout/navLinks.ts` and `src/components/layout/Sidebar.tsx` to render links based on user role.

Role permissions are encoded in the sidebar and in middleware.

## Core workflows

### Login flow

1. User opens `/login`
2. `LoginCard` calls `signIn("credentials")`
3. On success, user is redirected to `/dashboard`
4. If the session is missing, middleware redirects back to `/login`

### Registration flow

- Register through `/register`
- After sign-up, pending or verification flows appear under `/register/pending`

### Dashboard

- `/dashboard` shows summary cards and quick actions
- Data is loaded server-side via `src/lib/data/portal.ts`

### Faculty / department management

- `/dashboard/faculty-departments` manages faculties and departments
- Create and edit pages are nested under the route tree

### Curriculum management

- `/dashboard/curriculum` lists curricula
- New and edit curriculum pages exist under `/dashboard/curriculum/new` and `.../[curriculumId]/edit`

### Examiner reports

- `/dashboard/examiner-report` lists reports
- Each report has view/edit pages and assignment sub-pages

## How to add new pages

### Add a public page

1. Create the file under `src/app/(auth)/`.
2. Export a default page component.
3. Add shared UI components from `src/components/auth` if needed.

Example:

```tsx
// src/app/(auth)/help/page.tsx
export default function HelpPage() {
  return <div>Help content</div>;
}
```

### Add a dashboard page

1. Create the file under `src/app/(dashboard)/dashboard/`.
2. Export the default page component.
3. Use `Link` or nav link config to expose the page.

Example:

```tsx
// src/app/(dashboard)/dashboard/reports/new/page.tsx
export default function NewReportPage() {
  return <div>Create a report</div>;
}
```

### Add page route params

Use a folder name with brackets for dynamic route segments:
- `src/app/(dashboard)/dashboard/students/[studentId]/page.tsx`

Then access params via the page component props.

## How to add a new API route

1. Create a route file under `src/app/api/`.
2. Export the appropriate HTTP method handler: `GET`, `POST`, `PATCH`, `DELETE`.
3. Use `NextResponse` for responses.

Example:

```ts
// src/app/api/example/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "OK" });
}
```

For auth-protected API routes, rely on the middleware and/or `getToken` with the same secret.

## How to add or update a model

### Add a new Mongoose schema

1. Add a new file in `src/models/`.
2. Export the schema and model.
3. Use it in API routes and `src/lib/data/portal.ts`.

Example:

```ts
// src/models/Example.ts
import mongoose from "mongoose";

const ExampleSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Example = mongoose.models.Example || mongoose.model("Example", ExampleSchema);
export default Example;
```

### Use the model in server code

```ts
import { connectDB } from "@/lib/db/connectDB";
import Example from "@/models/Example";

await connectDB();
const items = await Example.find({}).lean();
```

## Environment variables

The app requires these environment variables:

- `MONGODB_URI` or `MONGO_URI` — MongoDB connection string
- `NEXTAUTH_SECRET` or `AUTH_SECRET` — next-auth/JWT secret
- `NEXTAUTH_URL` — production app URL
- `AUTH_SECRET` — optional auth secret alias

If you use email or external services, also configure:
- `BREVO_API_KEY` (if email service is enabled)
- `CLOUDINARY_URL` or Cloudinary config (if image uploads are used)

## Production notes

- Ensure `NEXTAUTH_URL` matches the deployed site origin.
- Ensure `NEXTAUTH_SECRET` is set in production.
- The project uses server-side rendering and app-route APIs, so deploy on a platform that supports Next.js App Router.

## Useful files and components

### Layouts
- `src/app/layout.tsx` — root app layout and global metadata
- `src/app/(auth)/layout.tsx` — auth page layout
- `src/app/(dashboard)/layout.tsx` — dashboard layout with sidebar

### Authentication components
- `src/components/auth/LoginCard.tsx`
- `src/components/auth/RegisterCard.tsx`
- `src/components/auth/ForgotCard.tsx`
- `src/components/auth/ResetCard.tsx`

### Shared UI
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/DashboardHeader.tsx`
- `src/components/layout/MaybeTopbar.tsx`
- `src/components/layout/MaybeDashboardHeader.tsx`
- `src/components/shared/ExportButtons.tsx`
- `src/components/shared/OfflineBanner.tsx`

### Data layer
- `src/lib/db/connectDB.ts` — MongoDB connection caching
- `src/lib/data/portal.ts` — server-side portal data helpers
- `src/app/api/` — API route implementations

### Security and routing
- `src/middleware.ts` — route protection middleware
- `src/app/api/auth/[...nextauth]/options.ts` — NextAuth provider and callbacks

## Adding new navigation or permissions

### Sidebar links
Update `src/components/layout/navLinks.ts`.

### Role gating
Update `linkRoles` in `src/components/layout/Sidebar.tsx` and route checks in `src/middleware.ts`.

## Best practices

- Keep UI logic in client components and server data fetching in app pages or route handlers.
- Use `await connectDB()` inside server code before any Mongoose query.
- Do not expose secrets in client code.
- Keep reusable UI in `src/components/` and route-specific page logic in `src/app/`.
- Add or update tests and run `npm run lint` after making changes.

## Troubleshooting

### Sign-in issues in production
- Confirm `NEXTAUTH_URL` is configured correctly.
- Confirm `NEXTAUTH_SECRET` or `AUTH_SECRET` is set.
- Confirm the credentials provider is returning a user object from `authorize`.

### Favicon or static asset issues
- Put icon assets in `public/`
- For custom favicons, update `src/app/layout.tsx` and `src/app/manifest.ts`
- Clear browser cache after changes

## Contact

For questions about this codebase, ask the team lead responsible for UNIZIK LMS or consult the architecture docs in the repository.
