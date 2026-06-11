"use client";

import { LogOut } from "lucide-react";
import { RomanticButton } from "@/components/ui/RomanticButton";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <RomanticButton variant="ghost" className="px-3" onClick={logout}>
      <LogOut className="h-4 w-4" />
    </RomanticButton>
  );
}
