import type { PortalData } from "./types";

const domain = process.env.EXPO_PUBLIC_DOMAIN;
export const BASE_URL = domain ? `https://${domain}` : "";

async function apiFetch(path: string, options?: RequestInit) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || `API-Fehler: ${response.status}`);
  }
  return json;
}

export async function fetchPortalData(): Promise<PortalData> {
  return apiFetch("/api/data", { cache: "no-store" });
}

export async function loginWithCode(profileSlug: string, code: string) {
  return apiFetch("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({ profileSlug, code }),
  });
}

export async function postRecord(table: string, payload: Record<string, unknown>) {
  return apiFetch("/api/records", {
    method: "POST",
    body: JSON.stringify({ table, payload }),
  });
}

export async function patchRecord(table: string, id: string, payload: Record<string, unknown>) {
  return apiFetch("/api/records", {
    method: "PATCH",
    body: JSON.stringify({ table, id, payload }),
  });
}

export async function patchWorkOrder(title: string, assignee: string, payload: Record<string, unknown>) {
  return apiFetch("/api/work-orders", {
    method: "PATCH",
    body: JSON.stringify({ title, assignee, ...payload }),
  });
}
