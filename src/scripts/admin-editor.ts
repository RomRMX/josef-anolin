// Client-side editor for /admin. Loads the current SiteContent document,
// renders an editable form for each section, and PUTs the result back.
// Plain DOM — no framework — so it ships tiny and works on a phone.

type Dict = Record<string, any>;

let state: Dict = {};
let savedSnapshot = "";
let writable = true;
let activeSection = "card-hero"; // which section is currently shown (default: Hero/home)

// ---------- tiny DOM helper ----------
type Child = Node | string | null | undefined | false;
function h(tag: string, attrs: Dict = {}, ...children: Child[]): HTMLElement {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = String(v);
    else if (k === "html") node.innerHTML = String(v);
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    } else node.setAttribute(k, String(v));
  }
  for (const c of children) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

const byId = (id: string) => document.getElementById(id)!;

// ---------- dirty tracking ----------
function markDirty() {
  const isDirty = JSON.stringify(state) !== savedSnapshot;
  const status = byId("save-status");
  const btn = byId("save-btn") as HTMLButtonElement;
  status.textContent = isDirty ? "Unsaved changes" : "All changes saved";
  status.dataset.dirty = String(isDirty);
  btn.disabled = !isDirty || !writable;
}

// ---------- field builders ----------
function textField(opts: {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  onInput: (v: string) => void;
}): HTMLElement {
  const input = opts.multiline
    ? (h("textarea", {
        class: "fld-input",
        rows: opts.rows ?? 4,
        placeholder: opts.placeholder ?? "",
      }) as HTMLTextAreaElement)
    : (h("input", {
        class: "fld-input",
        type: "text",
        placeholder: opts.placeholder ?? "",
      }) as HTMLInputElement);
  input.value = opts.value ?? "";
  input.addEventListener("input", () => {
    opts.onInput(input.value);
    markDirty();
  });
  return h(
    "label",
    { class: "fld" },
    h("span", { class: "fld-label" }, opts.label),
    input,
    opts.hint ? h("span", { class: "fld-hint" }, opts.hint) : null,
  );
}

// Row controls: move up, move down, delete.
function rowControls(onUp: () => void, onDown: () => void, onDel: () => void): HTMLElement {
  const mk = (label: string, glyph: string, fn: () => void) =>
    h("button", { type: "button", class: "row-ctl", title: label, "aria-label": label, onclick: fn }, glyph);
  return h(
    "div",
    { class: "row-ctls" },
    mk("Move up", "↑", onUp),
    mk("Move down", "↓", onDown),
    mk("Remove", "✕", onDel),
  );
}

function move<T>(arr: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

function addBtn(label: string, fn: () => void): HTMLElement {
  return h("button", { type: "button", class: "add-btn", onclick: fn }, h("span", {}, "+ "), label);
}

function card(title: string, hint: string | null, ...body: Child[]): HTMLElement {
  return h(
    "section",
    { class: "ed-card", id: `card-${title.toLowerCase().replace(/\s+/g, "-")}` },
    h("div", { class: "ed-card-head" }, h("h2", {}, title), hint ? h("p", { class: "ed-card-hint" }, hint) : null),
    h("div", { class: "ed-card-body" }, ...body),
  );
}

// Show only the selected section (tabbed view) and highlight its nav tab.
function showSection(id: string) {
  activeSection = id;
  document.querySelectorAll<HTMLElement>(".ed-card").forEach((el) => {
    el.hidden = el.id !== id;
  });
  let activeLink: HTMLElement | null = null;
  document.querySelectorAll<HTMLElement>("[data-jump]").forEach((a) => {
    const on = a.dataset.jump === id;
    a.classList.toggle("is-active", on);
    if (on) activeLink = a;
  });
  window.scrollTo({ top: 0 });
  // Keep the active tab in view within the horizontally-scrolling nav.
  activeLink?.scrollIntoView({ block: "nearest", inline: "center" });
}

// ---------- section renderers ----------
function renderAll() {
  const root = byId("editor-sections");
  root.replaceChildren(
    renderHero(),
    renderShows(),
    renderAppearances(),
    renderVideos(),
    renderPics(),
    renderMerch(),
    renderSocials(),
    renderContact(),
  );
  markDirty();
  // Re-apply the active section after a (re)render so only it stays visible.
  showSection(activeSection);
}

function renderHero(): HTMLElement {
  const hero = state.hero;
  return card(
    "Hero",
    "The intro paragraph at the top of the site.",
    textField({
      label: "Bio",
      value: hero.bio,
      multiline: true,
      rows: 6,
      onInput: (v) => (hero.bio = v),
    }),
    textField({
      label: "Follow line",
      value: hero.followLine,
      placeholder: "Follow him at @comedianjoe510.",
      onInput: (v) => (hero.followLine = v),
    }),
  );
}

function renderShows(): HTMLElement {
  const shows: Dict[] = state.shows;
  const list = h("div", { class: "list" });
  const draw = () => {
    list.replaceChildren(
      ...(shows.length
        ? shows.map((s, i) =>
            h(
              "div",
              { class: "list-row" },
              rowControls(
                () => { move(shows, i, -1); draw(); markDirty(); },
                () => { move(shows, i, 1); draw(); markDirty(); },
                () => { shows.splice(i, 1); draw(); markDirty(); },
              ),
              h(
                "div",
                { class: "row-fields row-fields--grid2" },
                textField({ label: "Date", value: s.date, placeholder: "Fri Aug 8, 2026", onInput: (v) => (s.date = v) }),
                textField({ label: "City", value: s.city, placeholder: "Los Angeles, CA", onInput: (v) => (s.city = v) }),
                textField({ label: "Venue", value: s.venue, placeholder: "Hollywood Improv", onInput: (v) => (s.venue = v) }),
                textField({ label: "Address", value: s.address ?? "", placeholder: "8162 Melrose Ave", onInput: (v) => (s.address = v) }),
                textField({ label: "Ticket link", value: s.tickets ?? "", placeholder: "https://…", onInput: (v) => (s.tickets = v) }),
              ),
            ),
          )
        : [h("p", { class: "empty-note" }, 'No shows yet — the site shows "Updates Coming Soon!" until you add one.')]),
    );
  };
  draw();
  return card(
    "Shows",
    "Upcoming tour dates. Add as many as you like; they appear newest-first in the order shown here.",
    list,
    addBtn("Add show", () => {
      shows.push({ date: "", city: "", venue: "", address: "", tickets: "" });
      draw();
      markDirty();
    }),
  );
}

function renderAppearances(): HTMLElement {
  const groups: Dict[] = state.appearances;
  const list = h("div", { class: "list" });
  const draw = () => {
    list.replaceChildren(
      ...groups.map((g, gi) => {
        const items: string[] = g.items;
        const itemsBox = h("div", { class: "subitems" });
        const drawItems = () => {
          itemsBox.replaceChildren(
            ...items.map((it, ii) =>
              h(
                "div",
                { class: "subitem" },
                (() => {
                  const inp = h("input", { class: "fld-input", type: "text", value: it }) as HTMLInputElement;
                  inp.addEventListener("input", () => { items[ii] = inp.value; markDirty(); });
                  return inp;
                })(),
                h("button", { type: "button", class: "row-ctl", title: "Move up", onclick: () => { move(items, ii, -1); drawItems(); markDirty(); } }, "↑"),
                h("button", { type: "button", class: "row-ctl", title: "Move down", onclick: () => { move(items, ii, 1); drawItems(); markDirty(); } }, "↓"),
                h("button", { type: "button", class: "row-ctl", title: "Remove", onclick: () => { items.splice(ii, 1); drawItems(); markDirty(); } }, "✕"),
              ),
            ),
            addBtn("Add line", () => { items.push(""); drawItems(); markDirty(); }),
          );
        };
        drawItems();
        return h(
          "div",
          { class: "list-row list-row--group" },
          rowControls(
            () => { move(groups, gi, -1); draw(); markDirty(); },
            () => { move(groups, gi, 1); draw(); markDirty(); },
            () => { groups.splice(gi, 1); draw(); markDirty(); },
          ),
          h(
            "div",
            { class: "row-fields" },
            textField({ label: "Group heading", value: g.label, placeholder: "Festivals", onInput: (v) => (g.label = v) }),
            h("span", { class: "fld-label" }, "Lines"),
            itemsBox,
          ),
        );
      }),
    );
  };
  draw();
  return card(
    "Appearances",
    "Clubs, festivals, and credits — grouped under headings.",
    list,
    addBtn("Add group", () => { groups.push({ label: "", items: [""] }); draw(); markDirty(); }),
  );
}

function renderVideos(): HTMLElement {
  const videos: Dict[] = state.videos;
  const list = h("div", { class: "list" });
  const draw = () => {
    list.replaceChildren(
      ...(videos.length
        ? videos.map((v, i) =>
            h(
              "div",
              { class: "list-row" },
              v.id ? h("img", { class: "vid-thumb", src: `https://i.ytimg.com/vi/${v.id}/default.jpg`, alt: "" }) : null,
              rowControls(
                () => { move(videos, i, -1); draw(); markDirty(); },
                () => { move(videos, i, 1); draw(); markDirty(); },
                () => { videos.splice(i, 1); draw(); markDirty(); },
              ),
              h(
                "div",
                { class: "row-fields" },
                textField({
                  label: "YouTube video ID",
                  value: v.id,
                  placeholder: "dQw4w9WgXcQ",
                  hint: "From the URL: youtube.com/watch?v=THIS_PART",
                  onInput: (val) => { v.id = extractYouTubeId(val); draw(); },
                }),
                textField({ label: "Title (optional)", value: v.title ?? "", onInput: (val) => (v.title = val) }),
              ),
            ),
          )
        : [h("p", { class: "empty-note" }, "No videos yet.")]),
    );
  };
  draw();
  return card(
    "Videos",
    "YouTube clips shown in the MEDIA section.",
    list,
    addBtn("Add video", () => { videos.push({ id: "", title: "" }); draw(); markDirty(); }),
  );
}

function extractYouTubeId(input: string): string {
  const s = input.trim();
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  return s.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 11);
}

function renderPics(): HTMLElement {
  const pics: Dict[] = state.pics;
  const grid = h("div", { class: "pic-grid" });
  const draw = () => {
    grid.replaceChildren(
      ...pics.map((p, i) =>
        h(
          "div",
          { class: "pic-cell" },
          h("img", { class: "pic-preview", src: p.src, alt: p.alt ?? "", loading: "lazy" }),
          h(
            "div",
            { class: "pic-ctls" },
            h("button", { type: "button", class: "row-ctl", title: "Move left", onclick: () => { move(pics, i, -1); draw(); markDirty(); } }, "←"),
            h("button", { type: "button", class: "row-ctl", title: "Move right", onclick: () => { move(pics, i, 1); draw(); markDirty(); } }, "→"),
            h("button", { type: "button", class: "row-ctl", title: "Remove", onclick: () => { pics.splice(i, 1); draw(); markDirty(); } }, "✕"),
          ),
        ),
      ),
    );
  };
  draw();

  const fileInput = h("input", { type: "file", accept: "image/*", multiple: true, class: "sr-only" }) as HTMLInputElement;
  fileInput.addEventListener("change", async () => {
    const files = Array.from(fileInput.files ?? []);
    fileInput.value = "";
    for (const f of files) {
      const url = await uploadFile(f);
      if (url) { pics.push({ src: url, alt: "" }); draw(); markDirty(); }
    }
  });

  return card(
    "Photos",
    "The gallery grid. Upload from your phone or computer, or add by URL.",
    grid,
    h(
      "div",
      { class: "btn-row" },
      fileInput,
      h("button", { type: "button", class: "add-btn", onclick: () => fileInput.click() }, "⬆ Upload photo(s)"),
      h("button", { type: "button", class: "add-btn add-btn--ghost", onclick: () => {
        const url = prompt("Paste an image URL:");
        if (url) { pics.push({ src: url.trim(), alt: "" }); draw(); markDirty(); }
      } }, "Add by URL"),
    ),
  );
}

async function uploadFile(file: File): Promise<string | null> {
  const toast = byId("toast");
  toast.textContent = `Uploading ${file.name}…`;
  toast.dataset.show = "true";
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
    showToast("Uploaded ✓");
    return data.url as string;
  } catch (err) {
    showToast(err instanceof Error ? err.message : "Upload failed.", true);
    return null;
  }
}

function renderMerch(): HTMLElement {
  const products: Dict[] = state.products;

  // Shop status toggle (placeholder vs. live storefront).
  const statusSel = h("select", { class: "fld-input" }) as HTMLSelectElement;
  for (const [value, label] of [
    ["coming-soon", "Coming soon — show placeholder"],
    ["open", "Open — show the storefront"],
  ]) {
    const opt = h("option", { value }, label) as HTMLOptionElement;
    if (state.shopStatus === value) opt.selected = true;
    statusSel.append(opt);
  }
  statusSel.addEventListener("change", () => {
    state.shopStatus = statusSel.value;
    markDirty();
  });
  const statusField = h(
    "label",
    { class: "fld" },
    h("span", { class: "fld-label" }, "Shop status"),
    statusSel,
    h("span", { class: "fld-hint" }, 'The shop only sells when set to "Open".'),
  );

  // Per-product image: preview + upload + URL.
  const productImage = (p: Dict, redraw: () => void) => {
    const fileInput = h("input", { type: "file", accept: "image/*", class: "sr-only" }) as HTMLInputElement;
    fileInput.addEventListener("change", async () => {
      const f = fileInput.files?.[0];
      fileInput.value = "";
      if (!f) return;
      const url = await uploadFile(f);
      if (url) { p.src = url; redraw(); markDirty(); }
    });
    return h(
      "div",
      { class: "merch-media" },
      h("img", { class: "merch-thumb", src: p.src || "", alt: "" }),
      h(
        "div",
        { class: "btn-row" },
        fileInput,
        h("button", { type: "button", class: "add-btn", onclick: () => fileInput.click() }, "⬆ Image"),
        h("button", { type: "button", class: "add-btn add-btn--ghost", onclick: () => {
          const u = prompt("Paste an image URL:");
          if (u) { p.src = u.trim(); redraw(); markDirty(); }
        } }, "URL"),
      ),
    );
  };

  // Price shown in dollars; stored in cents.
  const priceField = (p: Dict) => {
    const input = h("input", {
      class: "fld-input",
      type: "text",
      inputmode: "decimal",
      placeholder: "30",
    }) as HTMLInputElement;
    input.value = p.price ? String(p.price / 100) : "";
    input.addEventListener("input", () => {
      const dollars = parseFloat(input.value.replace(/[^0-9.]/g, ""));
      p.price = Number.isFinite(dollars) ? Math.round(dollars * 100) : 0;
      markDirty();
    });
    return h(
      "label",
      { class: "fld" },
      h("span", { class: "fld-label" }, "Price (USD)"),
      input,
    );
  };

  const list = h("div", { class: "list" });
  const draw = () => {
    list.replaceChildren(
      ...(products.length
        ? products.map((p, i) =>
            h(
              "div",
              { class: "list-row" },
              rowControls(
                () => { move(products, i, -1); draw(); markDirty(); },
                () => { move(products, i, 1); draw(); markDirty(); },
                () => { products.splice(i, 1); draw(); markDirty(); },
              ),
              h(
                "div",
                { class: "row-fields" },
                productImage(p, draw),
                h(
                  "div",
                  { class: "row-fields--grid2" },
                  textField({ label: "Name", value: p.name, placeholder: "PTing! — Tee", onInput: (v) => (p.name = v) }),
                  priceField(p),
                ),
                textField({ label: "Description", value: p.description ?? "", multiline: true, rows: 3, onInput: (v) => (p.description = v) }),
              ),
            ),
          )
        : [h("p", { class: "empty-note" }, "No products yet.")]),
    );
  };
  draw();

  return card(
    "Merch",
    "Your shop. Set the status, then add products with a photo, price, and description. Prices are charged exactly as set here.",
    statusField,
    list,
    addBtn("Add product", () => {
      products.push({ id: "", src: "", name: "", description: "", price: 3000 });
      draw();
      markDirty();
    }),
  );
}

function renderSocials(): HTMLElement {
  const ICONS = ["youtube", "instagram", "tiktok", "facebook", "threads", "email"];
  const socials: Dict[] = state.socials;
  const list = h("div", { class: "list" });
  const draw = () => {
    list.replaceChildren(
      ...socials.map((s, i) =>
        h(
          "div",
          { class: "list-row" },
          rowControls(
            () => { move(socials, i, -1); draw(); markDirty(); },
            () => { move(socials, i, 1); draw(); markDirty(); },
            () => { socials.splice(i, 1); draw(); markDirty(); },
          ),
          h(
            "div",
            { class: "row-fields row-fields--grid2" },
            textField({ label: "Label", value: s.label, placeholder: "Instagram", onInput: (v) => (s.label = v) }),
            (() => {
              const sel = h("select", { class: "fld-input" }) as HTMLSelectElement;
              for (const ic of ICONS) {
                const opt = h("option", { value: ic }, ic[0].toUpperCase() + ic.slice(1)) as HTMLOptionElement;
                if (ic === s.icon) opt.selected = true;
                sel.append(opt);
              }
              sel.addEventListener("change", () => { s.icon = sel.value; markDirty(); });
              return h("label", { class: "fld" }, h("span", { class: "fld-label" }, "Icon"), sel);
            })(),
            textField({ label: "URL", value: s.href, placeholder: "https://… or mailto:…", onInput: (v) => (s.href = v) }),
          ),
        ),
      ),
    );
  };
  draw();
  return card(
    "Social links",
    "Shown in the hero and the mobile bottom bar.",
    list,
    addBtn("Add link", () => { socials.push({ label: "", href: "", icon: "instagram" }); draw(); markDirty(); }),
  );
}

function renderContact(): HTMLElement {
  const c = state.contact;
  return card(
    "Contact",
    "The HIT ME UP section at the bottom.",
    textField({ label: "Heading", value: c.heading, onInput: (v) => (c.heading = v) }),
    textField({ label: "Intro text", value: c.lede, multiline: true, rows: 2, onInput: (v) => (c.lede = v) }),
    textField({ label: "Email (where messages go without Formspree)", value: c.email, onInput: (v) => (c.email = v) }),
    textField({
      label: "Formspree form ID (optional)",
      value: c.formspreeId,
      placeholder: "xyzabcd",
      hint: "Leave blank to use a mailto: link. With an ID, the form posts to Formspree.",
      onInput: (v) => (c.formspreeId = v),
    }),
  );
}

// ---------- toast ----------
let toastTimer: number | undefined;
function showToast(msg: string, isError = false) {
  const toast = byId("toast");
  toast.textContent = msg;
  toast.dataset.show = "true";
  toast.dataset.error = String(isError);
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.dataset.show = "false"; }, 2600);
}

// ---------- save ----------
async function save() {
  const btn = byId("save-btn") as HTMLButtonElement;
  btn.disabled = true;
  const label = btn.textContent;
  btn.textContent = "Saving…";
  try {
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Save failed.");
    if (data.content) state = data.content; // adopt the server-normalized version
    savedSnapshot = JSON.stringify(state);
    renderAll(); // rebind fields to the adopted state (e.g. server-assigned ids)
    showToast("Saved ✓ — refresh the site to see it live.");
  } catch (err) {
    showToast(err instanceof Error ? err.message : "Save failed.", true);
  } finally {
    btn.textContent = label;
    markDirty();
  }
}

// ---------- boot ----------
async function boot() {
  try {
    const res = await fetch("/api/admin/content");
    const data = await res.json();
    state = data.content;
    writable = data.writable !== false;
    savedSnapshot = JSON.stringify(state);
  } catch {
    byId("editor-sections").textContent = "Couldn't load content. Reload the page.";
    return;
  }

  if (!writable) byId("readonly-banner").hidden = false;

  renderAll();

  byId("save-btn").addEventListener("click", save);

  // Log out → clear cookie, back to login.
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    location.reload();
  });

  // Section tabs — switch which section is visible.
  document.querySelectorAll<HTMLAnchorElement>("[data-jump]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showSection(a.dataset.jump!);
    });
  });

  // Warn before leaving with unsaved edits.
  window.addEventListener("beforeunload", (e) => {
    if (JSON.stringify(state) !== savedSnapshot) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // Cmd/Ctrl+S saves.
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (JSON.stringify(state) !== savedSnapshot && writable) save();
    }
  });
}

// ---------- login (shown when not authenticated) ----------
function wireLogin() {
  const form = document.getElementById("login-form") as HTMLFormElement | null;
  if (!form) return;
  const err = document.getElementById("login-error") as HTMLElement;
  const btn = document.getElementById("login-btn") as HTMLButtonElement;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = "Checking…";
    const password = (document.getElementById("login-password") as HTMLInputElement).value;
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed.");
      }
      location.reload();
    } catch (e2) {
      err.textContent = e2 instanceof Error ? e2.message : "Login failed.";
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = "Log in";
    }
  });
}

// One entry point — the page renders either the editor shell or the login form.
if (document.querySelector("[data-editor]")) {
  boot();
} else {
  wireLogin();
}
