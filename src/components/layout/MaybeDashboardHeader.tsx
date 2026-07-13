"use client";

import { DashboardHeader } from "./DashboardHeader";
import { usePathname } from "next/navigation";
import React from "react";

export default function MaybeDashboardHeader() {
  const pathname = usePathname() || "/";

  const headerPaths = [
    "/dashboard",
    "/faculty-departments",
    "/curriculum",
    "/examiner-report",
    "/student-reports",
    "/reports",
    "/students",
    "/users",
    "/settings",
  ];

  const shouldShow = headerPaths.some((p) => pathname === p || pathname.startsWith(p + "/") );

  if (!shouldShow) return null;

  return <DashboardHeader />;
}
