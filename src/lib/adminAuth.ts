/**
 * Admin authentication helpers (client-side only).
 * All functions are safe to call from "use client" components.
 */

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

export function getAdminUser(): { id: number; name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("adminUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function adminLogout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  window.location.href = "/admin/login";
}

export function isAdminLoggedIn(): boolean {
  return Boolean(getAdminToken());
}
