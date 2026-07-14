'use client';

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface FacultyOption {
  id: string;
  name: string;
}

interface DepartmentOption {
  id: string;
  name: string;
  facultyId: string;
}

interface CurriculumOption {
  id: string;
  programName: string;
  departmentId: string;
}

export default function NewStudentPage() {
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [programLevel, setProgramLevel] = useState("");
  const [message, setMessage] = useState("");
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [facultiesResponse, departmentsResponse, curriculumsResponse] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/departments"),
          fetch("/api/curriculum"),
        ]);

        if (!facultiesResponse.ok || !departmentsResponse.ok || !curriculumsResponse.ok) {
          return;
        }

        const facultiesData = await facultiesResponse.json();
        const departmentsData = await departmentsResponse.json();
        const curriculumsData = await curriculumsResponse.json();

        const facultyOptions: FacultyOption[] = facultiesData.map((faculty: { _id: string; name: string }) => ({
          id: faculty._id,
          name: faculty.name,
        }));

        const departmentOptions: DepartmentOption[] = departmentsData.map((department: { _id: string; name: string; facultyId: string }) => ({
          id: department._id,
          name: department.name,
          facultyId: department.facultyId,
        }));

        const curriculumOptions: CurriculumOption[] = curriculumsData.map((curriculum: { _id: string; programName: string; departmentId: string }) => ({
          id: curriculum._id,
          programName: curriculum.programName,
          departmentId: curriculum.departmentId,
        }));

        setFaculties(facultyOptions);
        setDepartments(departmentOptions);
        setCurriculums(curriculumOptions);

        const defaultFacultyId = facultyOptions[0]?.id ?? "";
        const defaultDepartmentId = departmentOptions.filter((department) => department.facultyId === defaultFacultyId)[0]?.id ?? "";
        const defaultCurriculumId = curriculumOptions.filter((curriculum) => curriculum.departmentId === defaultDepartmentId)[0]?.id ?? "";

        setFacultyId(defaultFacultyId);
        setDepartmentId(defaultDepartmentId);
        setCurriculumId(defaultCurriculumId);
      } catch {
        // ignore fetch failure; user can still enter values manually if needed
      }
    }

    loadOptions();
  }, []);

  function handleFacultyChange(value: string) {
    const nextDepartmentId = departments.filter((department) => department.facultyId === value)[0]?.id ?? "";
    const nextCurriculumId = curriculums.filter((curriculum) => curriculum.departmentId === nextDepartmentId)[0]?.id ?? "";

    setFacultyId(value);
    setDepartmentId(nextDepartmentId);
    setCurriculumId(nextCurriculumId);
  }

  function handleDepartmentChange(value: string) {
    const nextCurriculumId = curriculums.filter((curriculum) => curriculum.departmentId === value)[0]?.id ?? "";

    setDepartmentId(value);
    setCurriculumId(nextCurriculumId);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Creating student...");

    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricNumber, fullName, email, facultyId, departmentId, curriculumId, programLevel }),
    });

    if (response.ok) {
      setMessage("Student created successfully.");
      router.push("/students");
      router.refresh();
      return;
    }

    setMessage("Unable to create student right now.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Student</p>
        <h2 className="text-2xl font-semibold text-slate-900">Add new student</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Matric number</label>
            <input value={matricNumber} onChange={(event) => setMatricNumber(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="2026/001" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Ada Okafor" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="ada.okafor@example.com" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
            <select value={facultyId} onChange={(event) => handleFacultyChange(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
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
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
            <select value={departmentId} onChange={(event) => handleDepartmentChange(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {departments.filter((department) => department.facultyId === facultyId).length > 0 ? (
                departments
                  .filter((department) => department.facultyId === facultyId)
                  .map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))
              ) : (
                <option value="">No departments available</option>
              )}
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Curriculum</label>
            <select value={curriculumId} onChange={(event) => setCurriculumId(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              {curriculums.filter((curriculum) => curriculum.departmentId === departmentId).length > 0 ? (
                curriculums
                  .filter((curriculum) => curriculum.departmentId === departmentId)
                  .map((curriculum) => (
                    <option key={curriculum.id} value={curriculum.id}>
                      {curriculum.programName}
                    </option>
                  ))
              ) : (
                <option value="">No curricula available</option>
              )}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Program level</label>
            <input value={programLevel} onChange={(event) => setProgramLevel(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="MSc" />
          </div>
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Create student</button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
