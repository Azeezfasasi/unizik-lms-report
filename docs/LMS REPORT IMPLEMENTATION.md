# Implementation Guide: UNIZIK LMS Report Portal
**Aligning your current Next.js codebase (`unizik-lms-report`) with the full 5‑role reporting workflow**

---

## 1. Where you already stand

Reading your `src` tree, you've already scaffolded most of the App Router skeleton:

| Role in spec | Matching folder in your repo | Status |
|---|---|---|
| PG Course Coordinator | `(reports)/pg-course-report/[id]/new`, `api/reports/coordinator/[id]/summary` | Scaffolded, needs field completion |
| LMS Rep | `(reports)/lms-rep-report/[id]/new`, `api/reports/lms-rep/[id]` | Scaffolded, needs field completion |
| Examiner (adjacent role) | `(reports)/examiner-report/...assignments`, `.../compliance` | Built out — reuse pattern |
| Student | `(reports)/student-reports/[facultyId]/new` | Folder exists but has no matching model yet |
| Supervisor | — | **Missing entirely** |
| Director LMS | Generic `(reports)/reports/[reportId]`, `GeneratedReportFile.ts`, `api/export/[format]/(excel|pdf|word)` | Export pipe exists, aggregation view missing |

You also already have infrastructure the spec doesn't ask for but will need: `sw.ts` + `OfflineBanner.tsx` (PWA/offline), `lib/cloudinary`, `lib/email`, `lib/export`, `StepperNav.tsx` (good fit for multi-step report forms), `ExportButtons.tsx`, and role types in `types/auth.ts` / `types/portal.ts`.

**Net takeaway:** you don't need a new architecture. You need (a) two new models + report flows (Student, Supervisor), (b) to finish the fields on the two partially-built flows (LMS Rep, PG Coordinator), and (c) a Director aggregation/print/send layer on top of what's already there.

---

## 2. Data model changes (`src/models`)

Your existing `Report.ts` looks like a shared base. Recommend a **discriminator pattern** so all five report types live in one Mongo collection but keep type-safe shapes — this also makes the Director's "oversee everything" view trivial (one query, one collection).

```ts
// models/Report.ts (base — extend if not already discriminated)
const reportSchema = new Schema({
  reportType: { type: String, enum: ['STUDENT','LMS_REP','SUPERVISOR','COORDINATOR','DIRECTOR'], required: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  faculty: { type: Schema.Types.ObjectId, ref: 'Faculty' },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  status: { type: String, enum: ['DRAFT','SUBMITTED','REVIEWED','ARCHIVED'], default: 'DRAFT' },
  createdAt: { type: Date, default: Date.now },
}, { discriminatorKey: 'reportType', timestamps: true });
```

### New: `models/StudentReport.ts`
```ts
{
  lectureScheduleId: { type: Schema.Types.ObjectId, ref: 'LectureSchedule' },
  lecturerPerformancePct: { type: Number, min: 0, max: 100, required: true },
  assignmentRatingPct: { type: Number, min: 0, max: 100, required: true },
  quizRatingPct: { type: Number, min: 0, max: 100, required: true },
  courses: [{
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    examStatus: { type: String, enum: ['TAKEN', 'PENDING'], required: true } // checkbox in UI
  }],
}
```

### New: `models/SupervisorReport.ts`
```ts
{
  faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  studentResponseToLecturesPct: { type: Number, min: 0, max: 100, required: true },
  studentResponseToAssignmentsPct: { type: Number, min: 0, max: 100, required: true },
  studentResponseToQuizPct: { type: Number, min: 0, max: 100, required: true },
  studentResponseToCourseworkPct: { type: Number, min: 0, max: 100, required: true },
  comments: String,
}
```

### Extend: `models/CourseRepReport.ts` (this is your LMS Rep model)
Add if not already present:
```ts
{
  lecturerLmsUsagePct: { type: Number, min: 0, max: 100, required: true },
  portalReadinessForQuizAndExam: { type: Boolean, required: true }, // or a % if you prefer nuance
  lecturerTrainings: [{
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    trainingRatingPct: { type: Number, min: 0, max: 100 },
  }],
  generalComments: String,
}
```

### Extend: `models/CoordinatorReport.ts`
```ts
{
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  lecturerResponseToClassPct: { type: Number, min: 0, max: 100, required: true },
  misconduct: [{
    lecturer: { type: Schema.Types.ObjectId, ref: 'User' },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    description: String,
  }],
  generalComments: String,
}
```

### New: `models/DirectorReview.ts` (optional but recommended)
Keeps an audit trail of what the Director actually forwarded to the Provost, separate from `GeneratedReportFile.ts` (which sounds like it's your rendered PDF/Word/Excel artifact).
```ts
{
  period: { type: String, required: true }, // e.g. "2026-S1"
  includedReports: [{ type: Schema.Types.ObjectId, ref: 'Report' }],
  generatedFile: { type: Schema.Types.ObjectId, ref: 'GeneratedReportFile' },
  sentToProvostAt: Date,
  sentByEmail: String, // uses lib/email
}
```

---

## 3. Routes to build/finish (`src/app/(dashboard)/dashboard/(reports)`)

```
(reports)/
  student-reports/[facultyId]/new/page.tsx      ← BUILD: rating sliders + exam checkbox grid
  lms-rep-report/[id]/new/page.tsx               ← FINISH: add training dropdown + comments
  supervisor-report/                             ← NEW FOLDER, mirror lms-rep-report pattern
    [departmentId]/new/page.tsx
    page.tsx
  pg-course-report/[id]/new/page.tsx             ← FINISH: add misconduct dropdown + comments
  director/                                      ← NEW FOLDER
    page.tsx           (aggregated dashboard, filters by role/period/faculty)
    [period]/page.tsx  (single-period review + "Generate & Send to Provost" action)
```

Reuse `StepperNav.tsx` for every "new report" form — that's exactly what it's for, and it keeps the five forms visually consistent (Step 1: context → Step 2: ratings → Step 3: comments/review → submit).

**UI component you're missing:** a `PercentageSlider` (or star-based %) shared component under `components/shared/`, since four of the five roles submit `%` ratings. Build once, reuse everywhere:

```tsx
// components/shared/PercentageRating.tsx
export function PercentageRating({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label>{label}</label>
      <input type="range" min={0} max={100} step={5} value={value}
        onChange={(e) => onChange(Number(e.target.value))} />
      <span>{value}%</span>
    </div>
  );
}
```

---

## 4. API routes (`src/app/api/reports`)

You already have `reports/coordinator/[id]/summary` and `reports/lms-rep/[id]`. Add:

```
api/reports/
  students/[id]/route.ts          POST/GET StudentReport
  supervisor/[id]/route.ts        POST/GET SupervisorReport
  director/route.ts               GET aggregated reports by period/role/faculty
  director/generate/route.ts      POST → builds a GeneratedReportFile via lib/export
  director/send/route.ts          POST → emails Provost via lib/email, logs DirectorReview
```

Each POST handler should:
1. Auth-check via `auth.ts` + `types/middleware.ts` (role must match report type — a Student can't POST a Coordinator report).
2. Validate percentages are 0–100 with zod (add a `lib/validation` folder if you don't have one).
3. Set `status: 'SUBMITTED'`, `submittedBy: session.user.id`.
4. Trigger `api/notifications` so the next role up (Coordinator/Director) sees a badge.

---

## 5. Role-based access control

Your `types/auth.ts` and `types/middleware.ts` are the right place to enforce this. Recommended role enum:

```ts
export type Role = 'STUDENT' | 'LMS_REP' | 'SUPERVISOR' | 'COORDINATOR' | 'DIRECTOR' | 'ADMIN';
```

Middleware rule of thumb:
- `STUDENT` → can only POST to `student-reports`, GET own submissions.
- `LMS_REP` → `lms-rep-report`, plus read-only visibility into student report completion rates (useful for their "portal readiness" rating).
- `SUPERVISOR` → `supervisor-report`, filtered to their assigned faculty/department.
- `COORDINATOR` → `pg-course-report`, plus read access to Student + Supervisor + LMS Rep reports for their department (they're rating lecturer response, so they need visibility).
- `DIRECTOR` → read access to everything, exclusive access to `director/*` routes and the "Generate & Send to Provost" action.

Gate this in `(dashboard)/dashboard/layout.tsx` (you already have this file) by redirecting unauthorized roles away from routes they shouldn't see in the sidebar.

---

## 6. Director LMS: aggregation, print, send

This is the one genuinely new piece of UI. Build `director/page.tsx` as a dashboard that:

1. **Queries** `api/reports/director` with filters (period, faculty, report type).
2. **Displays** a summary table/cards — average % per metric, misconduct flags surfaced prominently, LMS Rep comments and Coordinator comments listed underneath.
3. **"Generate Report" button** → calls `director/generate`, which uses your existing `lib/export` + `api/export/[format]/(excel|pdf|word)` to render a `GeneratedReportFile`. You've already built the export plumbing for examiner reports — reuse the same service, just point it at the aggregated dataset instead of a single report.
4. **"Send to Provost" button** → calls `director/send`, which uses `lib/email` to email the generated file as an attachment, and writes a `DirectorReview` record so there's a permanent audit trail of what was sent and when.

Use `ExportButtons.tsx` (already built) here directly — it's the right component for step 3/4.

---

## 7. Offline support (you've already started this — finish it deliberately)

Since students/lecturers may fill these forms on patchy campus wifi, and you already have `sw.ts` + `OfflineBanner.tsx`:

- Cache the **report submission forms** (not just static assets) in the service worker so a Student/LMS Rep can fill a form offline.
- Queue POSTs in IndexedDB and flush via `api/offline` when connectivity returns — check if `api/offline/route.ts` already does this or is just a stub.
- Show `OfflineBanner` specifically when a report has unsent queued submissions, not just on generic network loss, so users know their report is pending, not lost.

---

## 8. Suggested build order

1. `PercentageRating` shared component (unblocks all four rating-based roles).
2. `StudentReport` model + `student-reports/[facultyId]/new` page + API route.
3. `SupervisorReport` model + new `supervisor-report` route + page + API.
4. Finish `CourseRepReport` (LMS Rep) fields + form.
5. Finish `CoordinatorReport` fields + misconduct dropdown + form.
6. RBAC middleware pass across all report routes.
7. Director aggregation dashboard (`director/page.tsx` + `api/reports/director`).
8. Wire `Generate & Send to Provost` using existing export + email libs.
9. Offline queueing pass on the five submission forms.
10. Notifications: submission → next-role badge, using your existing `api/notifications`.

---

## 9. Open questions worth deciding before you build

- Does a Student submit **one report per lecture/course**, or one rolled-up report per semester? This changes whether `student-reports/[facultyId]/new` needs a `courseId` in the URL too.
- Should Supervisors see **individual** student reports or only aggregated averages? (Privacy vs. usefulness tradeoff.)
- For the Coordinator's misconduct flag — does that need to trigger an immediate notification to the Director, or just surface in the next periodic report?

I can also sketch the `StudentReport` submission form as a working React component, or draft the RBAC middleware, if you want to go a level deeper on any one piece — just say which.