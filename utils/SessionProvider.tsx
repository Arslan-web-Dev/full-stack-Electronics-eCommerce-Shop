"use client";

import { ReactNode } from "react";

export default function SessionProvider({ children, session }: { children: ReactNode; session?: any }) {
  return <>{children}</>;
}