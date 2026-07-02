/* safe-demo-filled-v1 */
(async function () {
  const store = window.FISH_APP;
  const config = window.APP_CONFIG || {};
  const els = {
    loginView: document.getElementById("login-view"),
    adminView: document.getElementById("admin-view"),
    loginForm: document.getElementById("login-form"),
    loginFeedback: document.getElementById("login-feedback"),
    emailLabel: document.getElementById("email-label"),
    passwordLabel: document.getElementById("password-label"),
    pinLabel: document.getElementById("pin-label"),
    logout: document.getElementById("logout"),
    title: document.getElementById("admin-title"),
    nav: document.querySelectorAll(".nav-item"),
    panels: document.querySelectorAll(".admin-panel"),
    feedback: document.getElementById("admin-feedback"),
    metrics: {
      items: document.getElementById("metric-items"),
      soldout: document.getElementById("metric-soldout"),
      requests: document.getElementById("metric-requests")
    },
    statusForm: document.getElementById("status-form"),
    settingsForm: document.getElementById("settings-form"),
    itemForm: document.getElementById("item-form"),
    locationForm: document.getElementById("location-form"),
    itemList: document.getElementById("admin-menu-list"),
    locationList: document.getElementById("admin-locations-list"),
    requestList: document.getElementById("admin-requests-list"),
    newItem: document.getElementById("new-item"),
    cancelItem: document.getElementById("cancel-item"),
    newLocation: document.getElementById("new-location"),
    cancelLocation: document.getElementById("cancel-location"),
    refreshRequests: document.getElementById("refresh-requests")
  };

  let state = null;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
  }
  function toast(message, bad = false) {
    els.feedback.textContent = message;
    els.feedback.style.background = bad ? "#b74040" : "#062033";
    els.feedback.classList.add("show");
    setTimeout(() => els.feedback.classList.remove("show"), 2600);
  }
  function asTags(value) {
    if (Array.isArray(value)) return value;
    return String(value || "").split(",").map(tag => tag.trim()).filter(Boolean);
  }
  function categoryName(id) { return state.categories.find(c => c.id === id)?.name || "Overig"; }
  function formToObject(form) { return Object.fromEntries(new FormData(form).entries()); }
  function field(form, name) { return form.elements[name]; }
  function checked(form, name) { return form.querySelector(`[name="${name}"]`)?.checked || false; }
  function setPanel(name) {
    els.nav.forEach(btn => btn.classList.toggle("active", btn.dataset.panel === name));
    els.panels.forEach(panel => panel.classList.toggle("active", panel.id === `panel-${name}`));
  }

  function fillForms() {
    const b = state.business;
    els.title.textContent = b.name;
    field(els.statusForm, "status_label").value = b.status_label || "";
    field(els.statusForm, "status_note").value = b.status_note || "";
    ["name", "subtitle", "phone", "whatsapp", "email", "address", "description"].forEach(key => {
      if (field(els.settingsForm, key)) field(els.settingsForm, key).value = b[key] || "";
    });
    const categorySelect = field(els.itemForm, "category_id");
    categorySelect.innerHTML = state.categories
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map(cat => `<option value="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</option>`).join("");
  }

  function renderMetrics() {
    els.metrics.items.textContent = String(state.menuItems.length);
    els.metrics.soldout.textContent = String(state.menuItems.filter(item => item.available === false && item.active !== false).length);
    els.metrics.requests.textContent = String(state.requests.filter(req => req.status !== "afgerond").length);
  }

  function renderItems() {
    const items = [...state.menuItems].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    els.itemList.innerHTML = items.map(item => `
      <article class="admin-row">
        <div>
          <h3>${escapeHtml(item.name)} <span class="price">${escapeHtml(item.price_label || "")}</span></h3>
          <p>${escapeHtml(categoryName(item.category_id))} · ${item.available === false ? "Uitverkocht" : "Beschikbaar"} · ${item.active === false ? "Verborgen" : "Zichtbaar"}</p>
          <p>${escapeHtml(item.description || "")}</p>
        </div>
        <div class="row-actions">
          <button class="icon-button" data-edit="${escapeHtml(item.id)}">Bewerken</button>
          <button class="icon-button ${item.available === false ? "good" : ""}" data-toggle="${escapeHtml(item.id)}">${item.available === false ? "Beschikbaar" : "Uitverkocht"}</button>
          <button class="icon-button danger" data-delete="${escapeHtml(item.id)}">Verwijder</button>
        </div>
      </article>
    `).join("") || `<div class="empty-state">Nog geen menu-items.</div>`;

    els.itemList.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => editItem(btn.dataset.edit)));
    els.itemList.querySelectorAll("[data-toggle]").forEach(btn => btn.addEventListener("click", () => toggleItem(btn.dataset.toggle)));
    els.itemList.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => removeItem(btn.dataset.delete)));
  }

  function renderLocations() {
    const locations = [...state.locations].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    els.locationList.innerHTML = locations.map(loc => `
      <article class="admin-row">
        <div>
          <h3>${escapeHtml(loc.day_label)} · ${escapeHtml(loc.place)}</h3>
          <p>${escapeHtml(loc.time_label || "")} · ${escapeHtml(loc.address || "")} · ${loc.active === false ? "Verborgen" : "Zichtbaar"}</p>
        </div>
        <div class="row-actions">
          <button class="icon-button" data-edit-location="${escapeHtml(loc.id)}">Bewerken</button>
          <button class="icon-button danger" data-delete-location="${escapeHtml(loc.id)}">Verwijder</button>
        </div>
      </article>
    `).join("") || `<div class="empty-state">Nog geen standplaatsen.</div>`;

    els.locationList.querySelectorAll("[data-edit-location]").forEach(btn => btn.addEventListener("click", () => editLocation(btn.dataset.editLocation)));
    els.locationList.querySelectorAll("[data-delete-location]").forEach(btn => btn.addEventListener("click", () => removeLocation(btn.dataset.deleteLocation)));
  }

  function renderRequests() {
    const requests = [...state.requests].sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    els.requestList.innerHTML = requests.map(req => `
      <article class="admin-row">
        <div>
          <h3>${escapeHtml(req.name || "Onbekend")} · ${escapeHtml(req.request_type || "Aanvraag")}</h3>
          <p>${escapeHtml(req.phone || "")} · ${escapeHtml(req.email || "")} · ${escapeHtml(req.event_date || "geen datum")}</p>
          <p>${escapeHtml(req.people ? `${req.people} personen · ` : "")}${escapeHtml(req.notes || "")}</p>
        </div>
        <div class="row-actions">
          <a class="icon-button" href="${store.waUrl(state.business.whatsapp || state.business.phone, requestMessage(req))}" target="_blank" rel="noreferrer">WhatsApp</a>
          <span class="tag ${req.status === "afgerond" ? "" : "orange"}">${escapeHtml(req.status || "nieuw")}</span>
        </div>
      </article>
    `).join("") || `<div class="empty-state">Nog geen aanvragen.</div>`;
  }

  function requestMessage(req) {
    return [
      `Aanvraag ${state.business.name}`,
      `Type: ${req.request_type || "-"}`,
      `Naam: ${req.name || "-"}`,
      `Telefoon: ${req.phone || "-"}`,
      `E-mail: ${req.email || "-"}`,
      `Datum: ${req.event_date || "-"}`,
      `Personen: ${req.people || "-"}`,
      `Bericht: ${req.notes || "-"}`
    ].join("\n");
  }

  function renderAll() {
    fillForms();
    renderMetrics();
    renderItems();
    renderLocations();
    renderRequests();
  }

  function editItem(itemId) {
    const item = state.menuItems.find(row => row.id === itemId);
    if (!item) return;
    els.itemForm.classList.remove("hidden");
    field(els.itemForm, "id").value = item.id;
    field(els.itemForm, "name").value = item.name || "";
    field(els.itemForm, "price_label").value = item.price_label || "";
    field(els.itemForm, "category_id").value = item.category_id || state.categories[0]?.id || "";
    field(els.itemForm, "tags").value = asTags(item.tags).join(", ");
    field(els.itemForm, "description").value = item.description || "";
    field(els.itemForm, "available").checked = item.available !== false;
    field(els.itemForm, "highlighted").checked = Boolean(item.highlighted);
    field(els.itemForm, "active").checked = item.active !== false;
    els.itemForm.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  async function toggleItem(itemId) {
    const item = state.menuItems.find(row => row.id === itemId);
    if (!item) return;
    await store.saveItem({ ...item, available: item.available === false });
    await reload("Beschikbaarheid aangepast.");
  }
  async function removeItem(itemId) {
    if (!confirm("Product verwijderen?")) return;
    await store.deleteItem(itemId);
    await reload("Product verwijderd.");
  }
  function editLocation(locationId) {
    const loc = state.locations.find(row => row.id === locationId);
    if (!loc) return;
    els.locationForm.classList.remove("hidden");
    ["id", "day_label", "time_label", "place", "address", "map_url"].forEach(key => { field(els.locationForm, key).value = loc[key] || ""; });
    field(els.locationForm, "active").checked = loc.active !== false;
    els.locationForm.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  async function removeLocation(locationId) {
    if (!confirm("Standplaats verwijderen?")) return;
    await store.deleteLocation(locationId);
    await reload("Standplaats verwijderd.");
  }

  async function reload(message) {
    state = await store.loadState();
    renderAll();
    if (message) toast(message);
  }

  async function initAuth() {
    if (store.useSupabase()) {
      els.emailLabel.classList.remove("hidden");
      els.passwordLabel.classList.remove("hidden");
      els.pinLabel.classList.add("hidden");
    }

    if (await store.isSignedIn()) {
      els.loginView.classList.add("hidden");
      els.adminView.classList.remove("hidden");
      await reload();
    }
  }

  els.loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const data = formToObject(els.loginForm);
    try {
      await store.signIn(data.email, data.password, data.pin);
      els.loginView.classList.add("hidden");
      els.adminView.classList.remove("hidden");
      await reload("Ingelogd.");
    } catch (error) {
      els.loginFeedback.textContent = error.message;
    }
  });

  els.logout.addEventListener("click", async () => {
    await store.signOut();
    location.reload();
  });

  els.nav.forEach(btn => btn.addEventListener("click", () => setPanel(btn.dataset.panel)));

  els.statusForm.addEventListener("submit", async event => {
    event.preventDefault();
    await store.saveBusiness({ status_label: field(els.statusForm, "status_label").value, status_note: field(els.statusForm, "status_note").value });
    await reload("Status opgeslagen.");
  });

  els.settingsForm.addEventListener("submit", async event => {
    event.preventDefault();
    await store.saveBusiness(formToObject(els.settingsForm));
    await reload("Instellingen opgeslagen.");
  });

  els.newItem.addEventListener("click", () => {
    els.itemForm.reset();
    field(els.itemForm, "id").value = "";
    field(els.itemForm, "available").checked = true;
    field(els.itemForm, "active").checked = true;
    els.itemForm.classList.remove("hidden");
  });
  els.cancelItem.addEventListener("click", () => els.itemForm.classList.add("hidden"));
  els.itemForm.addEventListener("submit", async event => {
    event.preventDefault();
    const item = formToObject(els.itemForm);
    item.tags = asTags(item.tags);
    item.available = checked(els.itemForm, "available");
    item.highlighted = checked(els.itemForm, "highlighted");
    item.active = checked(els.itemForm, "active");
    if (!item.id) delete item.id;
    await store.saveItem(item);
    els.itemForm.classList.add("hidden");
    await reload("Product opgeslagen.");
  });

  els.newLocation.addEventListener("click", () => {
    els.locationForm.reset();
    field(els.locationForm, "id").value = "";
    field(els.locationForm, "active").checked = true;
    els.locationForm.classList.remove("hidden");
  });
  els.cancelLocation.addEventListener("click", () => els.locationForm.classList.add("hidden"));
  els.locationForm.addEventListener("submit", async event => {
    event.preventDefault();
    const loc = formToObject(els.locationForm);
    loc.active = checked(els.locationForm, "active");
    if (!loc.id) delete loc.id;
    await store.saveLocation(loc);
    els.locationForm.classList.add("hidden");
    await reload("Standplaats opgeslagen.");
  });

  els.refreshRequests.addEventListener("click", () => reload("Aanvragen ververst."));

  try {
    await initAuth();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => null);
  } catch (error) {
    els.loginFeedback.textContent = error.message;
  }
})();
