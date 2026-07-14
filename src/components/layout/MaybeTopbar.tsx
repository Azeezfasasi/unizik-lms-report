"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "./Topbar";

export default function MaybeTopbar() {
  const pathname = usePathname() || "/";
  const shouldShow = !pathname.startsWith("/dashboard");

  if (!shouldShow) return null;

  return <Topbar />;
}
