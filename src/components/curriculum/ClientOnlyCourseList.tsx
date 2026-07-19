"use client";

import CourseList from "@/components/curriculum/CourseList";
import type { CourseItem } from "@/lib/data/portal";

export default function ClientOnlyCourseList({ courses, curriculumId }: { courses: CourseItem[]; curriculumId: string }) {
  return <CourseList courses={courses} curriculumId={curriculumId} />;
}
