"use client";

import { useEffect } from "react";

type Profile = {
  slug: string;
  full_name: string;
  display_name: string;
  role: string;
  avatar_initials: string;
};

const profileImages: Record<string, string> = {
  "luca-hoffmann": "/profile-images/luca-hoffmann.jpeg.PNG",
  "patrick-schaefer": "/profile-images/IMG_0078.jpeg",
  "janina-eispert": "/profile-images/IMG_0079.jpeg",
  "harald-brandstaedter": "/profile-images/IMG_0080.jpeg",
  "andreas-rahm": "/profile-images/IMG_0081.jpeg",
  "raymond-germany": "/profile-images/IMG_0082.jpeg",
  "michael-krauss": "/profile-images/IMG_0083.jpeg",
  "anna-raab": "/profile-images/IMG_0084.jpeg",
  "heike-spies": "/profile-images/IMG_0085.jpeg",
  "petra-janson-peermann": "/profile-images/IMG_0086.jpeg",
  "moritz-behncke": "/profile-images/IMG_0087.jpeg",
  "joerg-harz": "/profile-images/IMG_0088.jpeg",
  "marcel-schulz": "/profile-images/IMG_0090.jpeg"
};

function activeSlug() {
  return window.localStorage.getItem("fraktion-profile-slug") || "luca-hoffmann";
}

function stripMarkers(value: string) {
  return value
    .replace(/\[visible:(all|private:[^\]]+)\]/gi, "")
    .replace(/\[assignees:[^\]]+\]/gi, "")
    .replace(/\[retention:[^\]]+\]/gi, "")
    .replace(/\[completed_at:[^\]]+\]/gi, "")
    .replace(/\[progress:\d{1,3}\]/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function visibleForCurrentProfile(text: string) {
  const match = text.match(/\[visible:private:([^\]]+)\]/i);
  if (!match) return true;
  const allowed = match[1].split(",").map(item => item.trim());
  return allowed.includes(activeSlug());
}

function cleanExistingTaskCards() {
  document.querySelectorAll<HTMLElement>(".item").forEach(item => {
    const text = item.textContent || "";
    if (text.includes("[visible:")) {
      item.style.display = visibleForCurrentProfile(text) ? "" : "none";
    }
    item.querySelectorAll<HTMLElement>(".small").forEach(line => {
      if (/\[(visible|assignees|retention|completed_at|progress):/i.test(line.textContent || "")) {
        const cleaned = stripMarkers(line.textContent || "");
        line.textContent = cleaned;
        if (!cleaned) line.style.display = "none";
      }
    });
  });
}

function avatar(profile: Profile) {
  const image = profileImages[profile.slug];
  return image
    ? `<span class="assign-avatar"><img src="${image}" alt="" /></span>`
    : `<span class="assign-avatar assign-avatar-fallback">${profile.avatar_initials}</span>`;
}

function enhanceForm(form: HTMLFormElement, profiles: Profile[]) {
  if (form.dataset.assignmentStable === "true") return;
  form.dataset.assignmentStable = "true";

  const selected = new Set<string>([activeSlug()]);
  const assigneeInput = form.querySelector<HTMLInputElement>('input[name="assignee"]');
  const caseSelect = form.querySelector<HTMLSelectElement>('select[name="case_id"]');
  assigneeInput?.classList.add("hidden-original-assignee");
  caseSelect?.classList.add("hidden-case-select");

  const panel = document.createElement("div");
  panel.className = "assignment-panel wide";
  panel.innerHTML = `
    <div class="assignment-panel-head">
      <strong>Verantwortlich</strong>
      <button type="button" class="assign-all">Alle auswählen</button>
    </div>
    <div class="assignment-people"></div>
    <div class="visibility-panel">
      <strong>Sichtbar für</strong>
      <label><input type="radio" name="task_visibility_bridge" value="all" checked /> alle Profile</label>
      <label><input type="radio" name="task_visibility_bridge" value="private" /> nur betreffende Profile</label>
    </div>
    <div class="retention-panel">
      <strong>Nach Erledigung</strong>
      <select class="select" name="task_retention_bridge">
        <option value="keep">behalten / nachvollziehbar</option>
        <option value="days:30">30 Tage behalten</option>
        <option value="days:90">90 Tage behalten</option>
        <option value="archive">archivieren</option>
        <option value="delete">direkt löschen</option>
      </select>
    </div>
  `;

  const people = panel.querySelector<HTMLElement>(".assignment-people")!;
  function sync() {
    people.querySelectorAll<HTMLButtonElement>("button[data-slug]").forEach(button => button.classList.toggle("selected", selected.has(button.dataset.slug || "")));
    if (assigneeInput) assigneeInput.value = profiles.filter(profile => selected.has(profile.slug)).map(profile => profile.full_name).join(", ");
  }

  profiles.forEach(profile => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.slug = profile.slug;
    button.className = "assign-person";
    button.innerHTML = `${avatar(profile)}<span>${profile.display_name}</span>`;
    button.addEventListener("click", () => {
      if (selected.has(profile.slug)) selected.delete(profile.slug);
      else selected.add(profile.slug);
      if (selected.size === 0) selected.add(profile.slug);
      sync();
    });
    people.appendChild(button);
  });

  panel.querySelector<HTMLButtonElement>(".assign-all")?.addEventListener("click", () => {
    selected.clear();
    profiles.forEach(profile => selected.add(profile.slug));
    panel.querySelector<HTMLInputElement>('input[value="all"]')!.checked = true;
    sync();
  });

  form.querySelector('input[name="title"]')?.insertAdjacentElement("afterend", panel);
  sync();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(form);
    const selectedProfiles = profiles.filter(profile => selected.has(profile.slug));
    const visibility = panel.querySelector<HTMLInputElement>('input[name="task_visibility_bridge"]:checked')?.value || "all";
    const retention = panel.querySelector<HTMLSelectElement>('select[name="task_retention_bridge"]')?.value || "keep";
    const visibleMarker = visibility === "private" ? `[visible:private:${selectedProfiles.map(profile => profile.slug).join(",")}]` : "[visible:all]";
    const assigneeMarker = `[assignees:${selectedProfiles.map(profile => profile.full_name).join(", ")}]`;
    const retentionMarker = `[retention:${retention}]`;
    const description = [String(formData.get("description") || "").trim(), visibleMarker, assigneeMarker, retentionMarker].filter(Boolean).join("\n");

    const response = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: "tasks",
        payload: {
          title: formData.get("title"),
          description,
          assignee: selectedProfiles.map(profile => profile.full_name).join(", "),
          due_date: formData.get("due_date") || null,
          status: "offen",
          priority: formData.get("priority") || "normal",
          event_id: null,
          case_id: null
        }
      })
    });

    if (!response.ok) return;
    window.location.reload();
  }, { capture: true });
}

export default function TaskAssignmentBridgeStable() {
  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    async function run() {
      tries += 1;
      const forms = Array.from(document.querySelectorAll<HTMLFormElement>("form.task-form"));
      if (!forms.length && tries < 30 && !cancelled) {
        window.setTimeout(run, 350);
        return;
      }
      if (cancelled) return;
      try {
        const response = await fetch("/api/data", { cache: "no-store" });
        const data = await response.json();
        const profiles: Profile[] = data.profiles || [];
        forms.forEach(form => enhanceForm(form, profiles));
        cleanExistingTaskCards();
      } catch {
        cleanExistingTaskCards();
      }
    }

    run();
    const onFocus = () => cleanExistingTaskCards();
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, []);

  return null;
}
