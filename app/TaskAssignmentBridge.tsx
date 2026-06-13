"use client";

import { useEffect } from "react";

type Profile = {
  slug: string;
  full_name: string;
  display_name: string;
  role: string;
  accent?: string | null;
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

function cleanTechnicalMarkersIn(node: Element) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach(textNode => {
    textNode.textContent = (textNode.textContent ?? "")
      .replace(/\[visible:(all|private:[^\]]+)\]/gi, "")
      .replace(/\[assignees:[^\]]+\]/gi, "")
      .replace(/\[progress:\d{1,3}\]/gi, "")
      .trim();
  });
}

function currentProfileSlug() {
  return window.localStorage.getItem("fraktion-profile-slug") ?? "";
}

function applyVisibilityFilter() {
  const slug = currentProfileSlug();
  document.querySelectorAll<HTMLElement>(".item").forEach(item => {
    const rawText = item.textContent ?? "";
    const privateMatch = rawText.match(/\[visible:private:([^\]]+)\]/i);
    if (privateMatch) {
      const allowed = privateMatch[1].split(",").map(value => value.trim()).filter(Boolean);
      item.style.display = allowed.includes(slug) ? "" : "none";
    } else {
      item.style.display = "";
    }
    cleanTechnicalMarkersIn(item);
  });
}

function optionAvatar(profile: Profile) {
  const image = profileImages[profile.slug];
  return image
    ? `<span class="assign-avatar"><img src="${image}" alt="" /></span>`
    : `<span class="assign-avatar assign-avatar-fallback">${profile.avatar_initials}</span>`;
}

function enhanceTaskForm(form: HTMLFormElement, profiles: Profile[]) {
  if (form.dataset.assignmentEnhanced === "true") return;
  form.dataset.assignmentEnhanced = "true";

  const assigneeInput = form.querySelector<HTMLInputElement>('input[name="assignee"]');
  const caseSelect = form.querySelector<HTMLSelectElement>('select[name="case_id"]');
  assigneeInput?.classList.add("hidden-original-assignee");
  caseSelect?.classList.add("hidden-case-select");

  const currentSlug = currentProfileSlug() || "luca-hoffmann";
  const selected = new Set<string>([currentSlug]);

  const panel = document.createElement("div");
  panel.className = "assignment-panel wide";
  panel.innerHTML = `
    <div class="assignment-panel-head">
      <strong>Verantwortlich</strong>
      <button type="button" class="assign-all">Alle</button>
    </div>
    <div class="assignment-people"></div>
    <div class="visibility-panel">
      <strong>Sichtbarkeit</strong>
      <label><input type="radio" name="task_visibility_bridge" value="all" checked /> alle Profile</label>
      <label><input type="radio" name="task_visibility_bridge" value="private" /> nur betreffende Profile</label>
    </div>
  `;

  const people = panel.querySelector(".assignment-people") as HTMLElement;

  function sync() {
    people.querySelectorAll<HTMLButtonElement>("button[data-slug]").forEach(button => {
      button.classList.toggle("selected", selected.has(button.dataset.slug ?? ""));
    });
    if (assigneeInput) {
      assigneeInput.value = profiles
        .filter(profile => selected.has(profile.slug))
        .map(profile => profile.full_name)
        .join(", ");
    }
  }

  profiles.forEach(profile => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.slug = profile.slug;
    button.className = "assign-person";
    button.innerHTML = `${optionAvatar(profile)}<span>${profile.display_name}</span>`;
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
    const allRadio = panel.querySelector<HTMLInputElement>('input[value="all"]');
    if (allRadio) allRadio.checked = true;
    sync();
  });

  const titleInput = form.querySelector('input[name="title"]');
  titleInput?.insertAdjacentElement("afterend", panel);
  sync();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const formData = new FormData(form);
    const selectedProfiles = profiles.filter(profile => selected.has(profile.slug));
    const visibility = panel.querySelector<HTMLInputElement>('input[name="task_visibility_bridge"]:checked')?.value ?? "all";
    const visibleMarker = visibility === "private"
      ? `[visible:private:${selectedProfiles.map(profile => profile.slug).join(",")}]`
      : "[visible:all]";
    const assigneeMarker = `[assignees:${selectedProfiles.map(profile => profile.full_name).join(", ")}]`;
    const description = [String(formData.get("description") ?? "").trim(), visibleMarker, assigneeMarker]
      .filter(Boolean)
      .join("\n");

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
    form.reset();
    selected.clear();
    selected.add(currentProfileSlug() || "luca-hoffmann");
    sync();
    window.location.reload();
  }, true);
}

export default function TaskAssignmentBridge() {
  useEffect(() => {
    let profiles: Profile[] = [];

    async function loadProfiles() {
      const response = await fetch("/api/data", { cache: "no-store" });
      const data = await response.json();
      profiles = data.profiles ?? [];
      enhanceAll();
    }

    function enhanceAll() {
      document.querySelectorAll<HTMLFormElement>("form.task-form").forEach(form => enhanceTaskForm(form, profiles));
      applyVisibilityFilter();
    }

    loadProfiles().catch(() => undefined);
    const observer = new MutationObserver(enhanceAll);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("storage", applyVisibilityFilter);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", applyVisibilityFilter);
    };
  }, []);

  return null;
}
