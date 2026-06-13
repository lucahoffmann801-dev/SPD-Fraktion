"use client";

import { useEffect, useState } from "react";

type StatusSheet = {
  dropdown: HTMLElement;
  options: string[];
};

export default function MobileStatusBridge() {
  const [sheet, setSheet] = useState<StatusSheet | null>(null);

  useEffect(() => {
    function handleStatusTap(event: MouseEvent) {
      if (window.innerWidth > 860) return;

      const target = event.target as HTMLElement | null;
      const statusCell = target?.closest(".status-cell");
      if (!statusCell) return;

      const dropdown = statusCell.closest(".status-dropdown") as HTMLElement | null;
      if (!dropdown) return;

      const buttons = Array.from(dropdown.querySelectorAll<HTMLButtonElement>(".status-menu button"));
      if (!buttons.length) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (dropdown instanceof HTMLDetailsElement) {
        dropdown.open = false;
      }

      setSheet({
        dropdown,
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
    const button = sheet?.dropdown.querySelectorAll<HTMLButtonElement>(".status-menu button")[index];
    button?.click();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(8);
    }
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
