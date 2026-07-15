# UNIZIK LMS Portal Onboarding

This document is the team knowledge base for new contributors. It explains the project structure, how the app works, where to add features, and how to maintain the app.

## 1. Project Overview

The UNIZIK LMS Portal is a Next.js 16 application with the App Router, React 19, NextAuth, Tailwind CSS, and MongoDB.

It supports:
- secure login and registration
- role-based access control for ADMIN, FACULTY_OFFICER, EXAMINER, and STUDENT
- faculty, department, curriculum, and student management
- examiner reports and compliance tracking
- report exports and dashboard analytics

## 2. Key Concepts

### App Router and Layouts
- `src/app/layout.tsx` is the root layout for the whole app.
- `src/app/(auth)/layout.tsx` is the guest/auth layout used for login/registration.
- `src/app/(dashboard)/layout.tsx` is the authenticated dashboard layout with sidebar navigation.
- Nested routes under `src/app/` map directly to URL paths.

### Authentication
- Auth is powered by NextAuth and configured in `src/app/api/auth/[...nextauth]/options.ts`.
- Credentials provider authenticates users with email and password.
- Sessions use JWT strategy.
- `src/middleware.ts` protects private routes and enforces role access.

### Data Layer
- `src/lib/db/connectDB.ts` manages the MongoDB connection.
- `src/lib/data/portal.ts` contains shared server-side data helper functions.
- Mongoose models are in `src/models/`.

## 3. Route Structure

### Public auth routes
- `/login` → `src/app/(auth)/login/page.tsx`
- `/register` → `src/app/(auth)/register/page.tsx`
- `/forgot-password` → `src/app/(auth)/forgot-password/page.tsx`
- `/reset-password/[token]` → `src/app/(auth)/reset-password/[token]/page.tsx`

### Dashboard routes
- `/dashboard` → `src/app/(dashboard)/dashboard/page.tsx`
- `/dashboard/faculty-departments`
- `/dashboard/curriculum`
- `/dashboard/examiner-report`
- `/dashboard/student-reports`
- `/dashboard/reports`
- `/dashboard/students`
- `/dashboard/users`
- `/dashboard/settings/profile`

The dashboard pages are under `src/app/(dashboard)/dashboard/`.

## 4. Navigation and Roles

### Sidebar links
- Managed in `src/components/layout/navLinks.ts`.
- Visibility is controlled by `src/components/layout/Sidebar.tsx` and the `linkRoles` map.

### Role-based access
- Middleware checks roles for protected routes.
- Update both `src/middleware.ts` and `src/components/layout/Sidebar.tsx` when changing role access.

## 5. How to Add a New Page

### Public page
1. Create a new file under `src/app/(auth)/`.
2. Export a default React component.
3. If it needs auth-related UI, add a new component under `src/components/auth/`.

Example:
```tsx
// src/app/(auth)/help/page.tsx
export default function HelpPage() {
  return <div>Help content</div>;
}
```

### Dashboard page
1. Create a new file under `src/app/(dashboard)/dashboard/`.
2. Export a default function component.
3. Add a nav link if it should appear in the sidebar.

Example:
```tsx
// src/app/(dashboard)/dashboard/reports/new/page.tsx
export default function NewReportPage() {
  return <div>Create a new report</div>;
}
```

### Dynamic routes
- Use folder names in brackets: `src/app/(dashboard)/dashboard/students/[studentId]/page.tsx`
- Access route params in the page component props.

## 6. How to Add a New API Route

1. Create a new folder under `src/app/api/`.
2. Create `route.ts`.
3. Export the HTTP method handlers needed.

Example:
```ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "OK" });
}
```

### Example protected API pattern
Use `getToken` in API routes if you need the currently authenticated user.

## 7. How to Add or Update a Model

### Add a new Mongoose model
1. Add a file in `src/models/`.
2. Define the schema and model.
3. Export the model.

Example:
```ts
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

## 8. Environment Variables

Required:
- `MONGODB_URI` or `MONGO_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET` or `AUTH_SECRET`

Optional:
- `BREVO_API_KEY` for email sending
- Cloudinary config if uploads are enabled

## 9. Production Notes

- Make sure `NEXTAUTH_URL` matches the deployed app URL exactly.
- `NEXTAUTH_SECRET` must be configured in production.
- Clear browser cache after changing favicons or manifest icons.

## 10. Useful Files and Components

### Auth
- `src/components/auth/LoginCard.tsx`
- `src/components/auth/RegisterCard.tsx`
- `src/components/auth/ForgotCard.tsx`
- `src/components/auth/ResetCard.tsx`

### Layout
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/MaybeDashboardHeader.tsx`
- `src/components/layout/MaybeTopbar.tsx`
- `src/components/layout/DashboardHeader.tsx`

### Data and models
- `src/lib/db/connectDB.ts`
- `src/lib/data/portal.ts`
- `src/models/`

### Routes
- `src/app/api/auth/[...nextauth]/options.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/middleware.ts`

## 11. Best Practices

- Keep reusable UI in `src/components/`.
- Keep route-specific logic in `src/app/` page files.
- Use server-side code for data access and client components for interactive UI.
- Add or update links in `navLinks.ts` when creating new dashboard pages.
- Update middleware and sidebar role maps together when changing access.

## 12. Troubleshooting

### Login redirect issues
- Confirm `NEXTAUTH_URL` is set.
- Confirm `NEXTAUTH_SECRET/AUTH_SECRET` is set.
- Confirm the credentials provider returns a valid user object.

### Favicon issues
- Put the image in `public/`.
- Update `src/app/layout.tsx` and `src/app/manifest.ts`.
- Clear the browser cache.
