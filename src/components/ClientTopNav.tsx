"use client";

import { usePathname } from "next/navigation";
import TopNav from "@/components/TopNav";

export default function ClientTopNav() {
  const pathname = usePathname();

  console.log("Current Path:", pathname); // ✅ Debugging log

  // ✅ Hide TopNav on any page under `/auth`
  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  return <TopNav />;
}
