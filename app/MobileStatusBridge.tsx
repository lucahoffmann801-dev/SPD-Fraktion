"use client";

import { useEffect, useState } from "react";

type StatusSheet = {
  dropdown: HTMLElement;
  row: HTMLElement;
  title: string;
  assignee: string;
  options: string[];
};

const statusValues = ["offen", "in_bearbeitung", "rueckfrage", "wartend", "pruefung", "erledigt"];
const statusClasses = statusValues.map(status => `status-${status}`);
const fallbackProgressByStatus: Record<string, number> = {
  offen: 0,
  in_bearbeitung: 35,
  rueckfrage: 45,
  wartend: 50,
  pruefung: 80,
  erledigt: 100
};

function rowTitle(row: Element | null) {
  return row?.querySelector(".monday-task strong")?.textContent?.trim() ?? "";
}

function rowAssignee(row: Element | null) {
  const text = row?.querySelector(".monday-person span:last-child")?.textContent?.trim();
  return text === "Luca" || !text ? "Luca Hoffmann" : text;
}

function setProgressVisual(row: Element, progress: number) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const progressCell = row.querySelector<HTMLElement>(".progress-cell");
  const bar = progressCell?.querySelector<HTMLElement>("span");
  const range = progressCell?.querySelector<HTMLInputElement>("input[type='range']");
  const value = progressCell?.querySelector<HTMLElement>(".progress-value");

  if (bar) bar.style.width = `${clamped}%`;
  if (range) {
    range.value = String(clamped);
    range.style.setProperty("--progress", `${clamped}%`);
  }
  if (value) value.textContent = `${clamped}%`;
  row.setAttribute("data-progress", String(clamped));
}

function setStatusVisual(row: Element, status: string, label: string) {
  const cell = row.querySelector<HTMLElement>(".status-cell");
  if (!cell) return;
  statusClasses.forEach(className => cell.classList.remove(className));
  cell.classList.add(`status-${status}`);
  cell.textContent = label;
  row.setAttribute("data-status", status);
}

async function persistWorkOrder(row: Element, payload: { status?: string; progress?: number }) {
  const title = rowTitle(row);
  if (!title) return;

  await fetch("/api/work-orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      assignee: rowAssignee(row),
      ...payload
    })
  });
}

function enhanceProgressSliders() {
  document.querySelectorAll<HTMLElement>(".monday-row").forEach(row => {
    const progressCell = row.querySelector<HTMLElement>(".progress-cell");
    if (!progressCell || progressCell.querySelector("input[type='range']")) return;

    const existingBar = progressCell.querySelector<HTMLElement>("span");
    const existingWidth = existingBar?.style.width?.replace("%", "");
    const status = row.getAttribute("data-status") || row.querySelector<HTMLElement>(".status-cell")?.className.match(/status-([a-z_]+)/)?.[1] || "offen";
    const initial = Number(existingWidth || fallbackProgressByStatus[status] || 0);

    progressCell.classList.add("progress-control");
    progressCell.innerHTML = `
      <span class="progress-track-fill"></span>
      <input class="progress-range" type="range" min="0" max="100" step="1" value="${initial}" aria-label="Fortschritt festlegen" />
      <strong class="progress-value">${initial}%</strong>
    `;

    const range = progressCell.querySelector<HTMLInputElement>(".progress-range");
    if (!range) return;

    setProgressVisual(row, initial);

    range.addEventListener("input", () => {
      setProgressVisual(row, Number(range.value));
    });

    range.addEventListener("change", () => {
      const progress = Number(range.value);
      setProgressVisual(row, progress);
      persistWorkOrder(row, { progress }).catch(() => undefined);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(6);
    });
  });
}

export default function MobileStatusBridge() {
  const [sheet, setSheet] = useState<StatusSheet | null>(null);

  useEffect(() => {
    enhanceProgressSliders();
    const observer = new MutationObserver(() => enhanceProgressSliders());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleStatusTap(event: MouseEvent) {
      if (window.innerWidth > 860) return;

      const target = event.target as HTMLElement | null;
      const statusCell = target?.closest(".status-cell");
      if (!statusCell) return;

      const dropdown = statusCell.closest(".status-dropdown") as HTMLElement | null;
      const row = statusCell.closest(".monday-row") as HTMLElement | null;
      if (!dropdown || !row) return;

      const buttons = Array.from(dropdown.querySelectorAll<HTMLButtonElement>(".status-menu button"));
      if (!buttons.length) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (dropdown instanceof HTMLDetailsElement) dropdown.open = false;

      setSheet({
        dropdown,
        row,
        title: rowTitle(row),
        assignee: rowAssignee(row),
        options: buttons.map(button => button.textContent?.trim()).filter(Boolean) as string[]
      });
    }

    document.addEventListener("click", handleStatusTap, true);
    return () => document.removeEventListener("click", handleStatusTap, true);
  }, []);

  function close() {
    setSheet(null);
  }

  function choose(index: number) {
    if (!sheet) return;
    const status = statusValues[index] ?? "offen";
    const label = sheet.options[index] ?? status;
    const progress = fallbackProgressByStatus[status] ?? 0;

    setStatusVisual(sheet.row, status, label);
    setProgressVisual(sheet.row, progress);
    persistWorkOrder(sheet.row, { status, progress }).catch(() => undefined);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
    close();
  }

  if (!sheet) return null;

  return (
    <div className="native-status-layer" role="dialog" aria-modal="true" aria-label="Status ändern">
      <button className="native-status-backdrop" aria-label="Schließen" onClick={close} />
      <div className="native-status-sheet">
        <div className="native-status-grabber" />
        <div className="native-status-title">Status ändern</div>
        {sheet.options.map((option, index) => (
          <button key={`${option}-${index}`} className="native-status-option" onClick={() => choose(index)}>
            <span className={`native-status-dot status-dot-${index}`} />
            {option}
          </button>
        ))}
        <button className="native-status-cancel" onClick={close}>Abbrechen</button>
      </div>
    </div>
  );
}
