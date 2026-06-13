"use client";

import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";

type ProgressProps = {
  row: HTMLElement;
  initial: number;
};

const roots = new WeakMap<Element, Root>();

function clamp(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function rowTitle(row: Element) {
  return row.querySelector(".monday-task strong")?.textContent?.trim() ?? "";
}

function rowAssignee(row: Element) {
  const text = row.querySelector(".monday-person span:last-child")?.textContent?.trim();
  return text === "Luca" || !text ? "Luca Hoffmann" : text;
}

function markerProgress(row: Element) {
  const text = row.querySelector(".monday-task small")?.textContent ?? "";
  const match = text.match(/\[progress:(\d{1,3})\]/i);
  if (!match) return null;
  return clamp(Number(match[1]));
}

function cleanMarkers(row: Element) {
  const description = row.querySelector<HTMLElement>(".monday-task small");
  if (!description) return;
  description.textContent = (description.textContent ?? "")
    .replace(/\[progress:\d{1,3}\]/gi, "")
    .replace(/\[visible:(all|private:[^\]]+)\]/gi, "")
    .replace(/\[assignees:[^\]]+\]/gi, "")
    .replace(/\[retention:[^\]]+\]/gi, "")
    .replace(/\[completed_at:[^\]]+\]/gi, "")
    .trim();
}

async function saveProgress(row: Element, progress: number) {
  const title = rowTitle(row);
  if (!title) return;
  const response = await fetch("/api/work-orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      assignee: rowAssignee(row),
      progress: clamp(progress)
    })
  });
  if (!response.ok) throw new Error("Fortschritt konnte nicht gespeichert werden");
}

function colorFor(progress: number) {
  if (progress < 34) return "#ef4444";
  if (progress < 67) return "#f59e0b";
  return "#22c55e";
}

function WorkOrderProgressControl({ row, initial }: ProgressProps) {
  const [progress, setProgress] = useState(clamp(markerProgress(row) ?? initial));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const color = colorFor(progress);

  useEffect(() => {
    row.setAttribute("data-progress", String(progress));
  }, [progress, row]);

  function update(next: number) {
    const value = clamp(next);
    setProgress(value);
    setState("saving");
  }

  async function commit(next: number) {
    const value = clamp(next);
    setProgress(value);
    setState("saving");
    try {
      await saveProgress(row, value);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="progress-box" data-save-state={state}>
      <div className="progress-header">
        <span>Fortschritt</span>
        <strong>{progress}%</strong>
      </div>
      <div className="progress-slider-wrap">
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: color }} />
        </div>
        <input
          className="progress-range"
          type="range"
          min="0"
          max="100"
          step="1"
          value={progress}
          onChange={event => update(Number(event.target.value))}
          onPointerUp={event => commit(Number((event.target as HTMLInputElement).value))}
          onTouchEnd={event => commit(Number((event.target as HTMLInputElement).value))}
          onMouseUp={event => commit(Number((event.target as HTMLInputElement).value))}
          aria-label="Fortschritt"
        />
      </div>
      <div className="progress-save-state">
        {state === "saving" ? "speichert…" : state === "saved" ? "gespeichert" : state === "error" ? "nicht gespeichert" : ""}
      </div>
    </div>
  );
}

function initialFromCell(cell: Element) {
  const width = cell.querySelector<HTMLElement>("span")?.style.width?.replace("%", "");
  return clamp(Number(width || 0));
}

function mountControls() {
  document.querySelectorAll<HTMLElement>(".progress-cell").forEach(cell => {
    const row = cell.closest<HTMLElement>(".monday-row");
    if (!row || roots.has(cell)) return;
    cleanMarkers(row);
    const initial = markerProgress(row) ?? initialFromCell(cell);
    cell.innerHTML = "";
    cell.classList.add("controlled-progress-cell");
    const root = createRoot(cell);
    roots.set(cell, root);
    root.render(<WorkOrderProgressControl row={row} initial={initial} />);
  });
}

export default function WorkOrderProgressControls() {
  useEffect(() => {
    mountControls();
    const observer = new MutationObserver(() => mountControls());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
