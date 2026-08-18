'use client';

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface StudentOption {
  id: string;
  fullName: string;
  matricNumber: string;
}

interface FacultyOption {
  id: string;
  name: string;
}

interface CurriculumOption {
  id: string;
  programName: string;
}

export default function NewReportPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [studentsRes, facultiesRes, curriculumsRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/faculties"),
          fetch("/api/curriculum"),
        ]);

        if (!studentsRes.ok || !facultiesRes.ok || !curriculumsRes.ok) {
          setLoading(false);
          return;
        }

        const studentsData = await studentsRes.json();
        const facultiesData = await facultiesRes.json();
        const curriculumsData = await curriculumsRes.json();

        const studentOptions = studentsData.map((student: { _id: string; fullName: string; matricNumber: string }) => ({
          id: student._id,
          fullName: student.fullName,
          matricNumber: student.matricNumber,
        }));

        const facultyOptions = facultiesData.map((faculty: { _id: string; name: string }) => ({
          id: faculty._id,
          name: faculty.name,
        }));

        const curriculumOptions = curriculumsData.map((curriculum: { _id: string; programName: string }) => ({
          id: curriculum._id,
          programName: curriculum.programName,
        }));

        setStudents(studentOptions);
        setFaculties(facultyOptions);
        setCurriculums(curriculumOptions);

        setStudentId(studentOptions[0]?.id ?? "");
        setFacultyId(facultyOptions[0]?.id ?? "");
        setCurriculumId(curriculumOptions[0]?.id ?? "");
      } catch {
        // ignore fetch failure
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!studentId || !facultyId || !curriculumId) {
      setMessage("Please choose a student, faculty, and curriculum before saving.");
      return;
    }

    setSubmitting(true);
    setMessage("Saving report...");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, facultyId, curriculumId, notes, status }),
      });

      if (response.ok) {
        setMessage("Report saved successfully.");
        router.push("/reports");
        router.refresh();
        return;
      }

      setMessage("Unable to create report right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Reports</p>
        <h2 className="text-2xl font-semibold text-slate-900">Create report</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Student</label>
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {students.length > 0 ? (
                students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} — {student.matricNumber}
                  </option>
                ))
              ) : (
                <option value="">Loading students...</option>
              )}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
            <select value={facultyId} onChange={(event) => setFacultyId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {faculties.length > 0 ? (
                faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))
              ) : (
                <option value="">Loading faculties...</option>
              )}
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Curriculum</label>
            <select value={curriculumId} onChange={(event) => setCurriculumId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {curriculums.length > 0 ? (
                curriculums.map((curriculum) => (
                  <option key={curriculum.id} value={curriculum.id}>
                    {curriculum.programName}
                  </option>
                ))
              ) : (
                <option value="">Loading curricula...</option>
              )}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <button
          type="submit"
          disabled={loading || submitting || !studentId || !facultyId || !curriculumId}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? (
            "Loading options..."
          ) : submitting ? (
            <>
              <Spinner className="h-4 w-4" />
              Saving...
            </>
          ) : (
            "Save report"
          )}
        </button>
      </form>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
