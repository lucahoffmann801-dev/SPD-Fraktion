"use client";

import { useEffect, useRef } from "react";

const statuses = ["offen", "in_bearbeitung", "rueckfrage", "wartend", "pruefung", "erledigt"];
const labels: Record<string, string> = { offen: "offen", in_bearbeitung: "in Arbeit", rueckfrage: "Rückfrage", wartend: "wartet", pruefung: "zur Prüfung", erledigt: "erledigt" };
const progressByStatus: Record<string, number> = { offen: 0, in_bearbeitung: 35, rueckfrage: 45, wartend: 50, pruefung: 80, erledigt: 100 };

function title(row: Element) { return row.querySelector(".monday-task strong")?.textContent?.trim() || ""; }
function assignee(row: Element) { return row.querySelector(".monday-person span:last-child")?.textContent?.trim() === "Luca" ? "Luca Hoffmann" : "Luca Hoffmann"; }
function key(row: Element) { return `work-order-state:${title(row)}:${assignee(row)}`; }
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

function saveLocal(row: Element, patch: Record<string, unknown>) {
  try {
    const previous = JSON.parse(localStorage.getItem(key(row)) || "{}");
    localStorage.setItem(key(row), JSON.stringify({ ...previous, ...patch, updatedAt: Date.now() }));
  } catch {}
}

function readLocal(row: Element) {
  try { return JSON.parse(localStorage.getItem(key(row)) || "null"); } catch { return null; }
}

function indicator(row: Element) {
  let el = row.querySelector<HTMLElement>(".save-indicator");
  if (!el) {
    el = document.createElement("div");
    el.className = "save-indicator";
    row.appendChild(el);
  }
  return el;
}

function setSave(row: Element, text: string) {
  indicator(row).textContent = text;
}

function setStatus(row: Element, status: string) {
  const cell = row.querySelector<HTMLElement>(".status-cell");
  if (!cell) return;
  statuses.forEach(item => cell.classList.remove(`status-${item}`));
  cell.classList.add(`status-${status}`);
  cell.textContent = labels[status] || status;
  row.setAttribute("data-status", status);
}

function setProgress(row: Element, value: number) {
  const progress = clamp(value);
  const cell = row.querySelector<HTMLElement>(".progress-cell");
  const fill = cell?.querySelector<HTMLElement>(".progress-track-fill") || cell?.querySelector<HTMLElement>("span");
  const range = cell?.querySelector<HTMLInputElement>("input[type='range']");
  const label = cell?.querySelector<HTMLElement>(".progress-value");
  if (fill) fill.style.width = `${progress}%`;
  if (range) {
    range.value = String(progress);
    range.style.setProperty("--progress", `${progress}%`);
  }
  if (label) label.textContent = `${progress}%`;
  row.setAttribute("data-progress", String(progress));
}

async function saveRemote(row: Element, patch: { status?: string; progress?: number }) {
  const taskTitle = title(row);
  if (!taskTitle) return;
  setSave(row, "speichert…");
  const response = await fetch("/api/work-orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: taskTitle, assignee: assignee(row), ...patch }) });
  setSave(row, response.ok ? "gespeichert" : "lokal gespeichert");
}

function applyLocal(row: Element) {
  const state = readLocal(row);
  if (!state) return;
  if (state.status) setStatus(row, state.status);
  if (typeof state.progress === "number") setProgress(row, state.progress);
  setSave(row, "gespeichert");
}

export default function WorkOrderStateBridge() {
  const activeRow = useRef<Element | null>(null);

  useEffect(() => {
    function enhance() {
      document.querySelectorAll(".monday-row").forEach(row => applyLocal(row));
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const statusCell = target?.closest(".status-cell");
      if (statusCell) activeRow.current = statusCell.closest(".monday-row");

      const option = target?.closest(".native-status-option");
      if (!option || !activeRow.current) return;
      const options = Array.from(document.querySelectorAll(".native-status-option"));
      const index = options.indexOf(option);
      const status = statuses[index] || "offen";
      const progress = progressByStatus[status] ?? 0;
      setStatus(activeRow.current, status);
      setProgress(activeRow.current, progress);
      saveLocal(activeRow.current, { status, progress });
      saveRemote(activeRow.current, { status, progress }).catch(() => setSave(activeRow.current!, "lokal gespeichert"));
    }

    function onInput(event: Event) {
      const target = event.target as HTMLInputElement | null;
      if (!target?.matches(".progress-range")) return;
      const row = target.closest(".monday-row");
      if (!row) return;
      setProgress(row, Number(target.value));
      setSave(row, "ungespeichert");
    }

    function onChange(event: Event) {
      const target = event.target as HTMLInputElement | null;
      if (!target?.matches(".progress-range")) return;
      const row = target.closest(".monday-row");
      if (!row) return;
      const progress = clamp(Number(target.value));
      setProgress(row, progress);
      saveLocal(row, { progress });
      saveRemote(row, { progress }).catch(() => setSave(row, "lokal gespeichert"));
    }

    enhance();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", onClick, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onChange, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("change", onChange, true);
    };
  }, []);

  return null;
}
