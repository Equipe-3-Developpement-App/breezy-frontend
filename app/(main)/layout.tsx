import React from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}