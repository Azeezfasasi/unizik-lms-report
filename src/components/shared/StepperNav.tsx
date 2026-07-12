import Link from "next/link";

interface StepperNavProps {
  currentStep: number;
  facultyId: string;
}

const steps = [
  { id: 1, label: "Curriculum", href: (facultyId: string) => `/student-reports/${facultyId}/curriculum` },
  { id: 2, label: "Lectures", href: (facultyId: string) => `/student-reports/${facultyId}/lectures-calendar` },
  { id: 3, label: "Timetable", href: (facultyId: string) => `/student-reports/${facultyId}/exam-timetable` },
  { id: 4, label: "Overview", href: (facultyId: string) => `/student-reports/${facultyId}/general-report` },
  { id: 5, label: "Submit", href: (facultyId: string) => `/student-reports/${facultyId}/submit` },
];

export function StepperNav({ currentStep, facultyId }: StepperNavProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {steps.map((step) => {
        const isActive = step.id === currentStep;
        const isComplete = step.id < currentStep;
        return (
          <Link
            key={step.id}
            href={step.href(facultyId)}
            className={`rounded-full px-3 py-2 text-sm font-medium transition ${
              isActive ? "bg-teal-600 text-white" : isComplete ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {step.id}. {step.label}
          </Link>
        );
      })}
    </div>
  );
}
