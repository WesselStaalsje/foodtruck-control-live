


function normalizeDayName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function locationIsActive(location) {
  const value = location?.active;
  return value === true || value === 1 || value === "true" || value === "1";
}

function getDayIndex(dayLabel) {
  const day = normalizeDayName(dayLabel);
  const days = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  return days.findIndex((name) => day.includes(name));
}

function parseTimeWindow(timeLabel) {
  const text = String(timeLabel || "");
  const matches = text.match(/\d{1,2}[:.]\d{2}|\d{1,2}/g) || [];

  if (!matches.length) {
    return { start: 0, end: 24 * 60 - 1 };
  }

  const toMinutes = (raw) => {
    const cleaned = String(raw).replace(".", ":");
    const [h, m = "0"] = cleaned.split(":");
    const hours = Number(h);
    const minutes = Number(m);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return (hours * 60) + minutes;
  };

  const start = toMinutes(matches[0]);
  const end = matches[1] ? toMinutes(matches[1]) : (24 * 60 - 1);

  if (start === null) return { start: 0, end: 24 * 60 - 1 };
  return { start, end: end === null ? 24 * 60 - 1 : end };
}

function getTodayActiveLocations(locations = [], date = new Date()) {
  const todayIndex = date.getDay();

  return (locations || [])
    .filter(locationIsActive)
    .map((location, index) => ({
      ...location,
      _index: index,
      _dayIndex: getDayIndex(location.day_label),
      _timeWindow: parseTimeWindow(location.time_label),
    }))
    .filter((location) => location._dayIndex === todayIndex)
    .sort((a, b) => a._timeWindow.start - b._timeWindow.start || a._index - b._index);
}

function buildMapsUrl(location) {
  if (!location) return "#locaties";
  if (location.map_url) return location.map_url;
  const query = [location.place, location.address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function createTodayMapCard(location) {
  const day = location.day_label || "Vandaag";
  const place = location.place || "Standplaats";
  const address = location.address || "Locatie nog niet ingevuld";
  const time = location.time_label || "Tijden volgen";

  const link = document.createElement("a");
  link.className = "today-map-card";
  link.href = buildMapsUrl(location);
  link.target = "_blank";
  link.rel = "noreferrer";
  link.setAttribute("aria-label", `Open ${place} in Google Maps`);

  link.innerHTML = `
    <div class="map-preview" aria-hidden="true">
      <span class="map-road road-a"></span>
      <span class="map-road road-b"></span>
      <span class="map-pin">⌖</span>
    </div>
    <div class="map-copy">
      <strong>${escapeHtml(place)}</strong>
      <span>${escapeHtml(address)}</span>
      <small>${escapeHtml(day)} · ${escapeHtml(time)}</small>
    </div>
  `;

  return link;
}

function renderTodayHeroLocation(state) {
  const locations = getTodayActiveLocations(state.locations || []);
  const listEl = document.querySelector("#today-map-list");
  const currentLocation = document.querySelector("#current-location");
  const currentStatus = document.querySelector("#current-status");

  if (!listEl) return;

  listEl.innerHTML = "";

  if (!locations.length) {
    if (currentStatus) currentStatus.textContent = "Vandaag geen actieve standplaats";
    const empty = document.createElement("a");
    empty.className = "today-map-card inactive";
    empty.href = "#locaties";
    empty.innerHTML = `
      <div class="map-preview muted-map" aria-hidden="true">
        <span class="map-road road-a"></span>
        <span class="map-road road-b"></span>
        <span class="map-pin">×</span>
      </div>
      <div class="map-copy">
        <strong>Vandaag geen kraamlocatie</strong>
        <span>Bekijk de weekplanning hieronder of neem contact op.</span>
        <small>Geen actieve locatie voor vandaag</small>
      </div>
    `;
    listEl.appendChild(empty);
    if (currentLocation) currentLocation.textContent = "De hero toont alleen actieve locaties van vandaag.";
    return;
  }

  if (currentStatus) {
    currentStatus.textContent = locations.length === 1
      ? "Vandaag hier te vinden"
      : `Vandaag op ${locations.length} plekken te vinden`;
  }

  locations.forEach((location) => {
    listEl.appendChild(createTodayMapCard(location));
  });

  if (currentLocation) {
    currentLocation.textContent = locations.length === 1
      ? "Tik op het kaartje om de route direct in Google Maps te openen."
      : "Tik op een locatie om die route direct in Google Maps te openen.";
  }
}



(async function () {
  const store = window.FISH_APP;
  const els = {
    name: document.getElementById("business-name"),
    desc: document.getElementById("business-description"),
    status: document.getElementById("current-status"),
    statusNote: document.getElementById("current-location"),
    call: document.getElementById("call-link"),
    whatsapp: document.getElementById("whatsapp-link"),
    footerName: document.getElementById("footer-name"),
    footerContact: document.getElementById("footer-contact"),
    footerWhatsapp: document.getElementById("footer-whatsapp"),
    tabs: document.getElementById("category-tabs"),
    list: document.getElementById("menu-list"),
    locations: document.getElementById("locations-list"),
    search: document.getElementById("menu-search"),
    requestForm: document.getElementById("request-form"),
    requestFeedback: document.getElementById("request-feedback"),
    whatsappRequest: document.getElementById("send-whatsapp")
  };

  let state = null;
  let activeCategory = "all";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
  }

  function renderBusiness() {
    const b = state.business;
    document.title = `${b.name} | Live menu`;
    els.name.textContent = b.name;
    els.desc.textContent = b.description;
    els.status.textContent = b.status_label || "Live menu actief";
    els.statusNote.textContent = b.status_note || "Bekijk het actuele aanbod en de standplaatsen.";
    els.call.href = `tel:${b.phone}`;
    const baseMessage = `Hallo ${b.name}, ik heb een vraag over het assortiment.`;
    const whatsappUrl = store.waUrl(b.whatsapp || b.phone, baseMessage);
    els.whatsapp.href = whatsappUrl;
    els.footerWhatsapp.href = whatsappUrl;
    els.footerName.textContent = b.name;
    els.footerContact.textContent = `${b.address || ""} · ${b.phone || ""} · ${b.email || ""}`;
  }

  function categoryName(id) {
    return state.categories.find(c => c.id === id)?.name || "Overig";
  }

  function renderTabs() {
    const categories = [...state.categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const buttons = [{ id: "all", name: "Alles" }, ...categories];
    els.tabs.innerHTML = buttons.map(cat => `
      <button class="pill ${activeCategory === cat.id ? "active" : ""}" type="button" data-category="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</button>
    `).join("");
    els.tabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderTabs();
      renderTodayHeroLocation(state);
  renderMenu();
    }));
  }

  function renderMenu() {
    const query = els.search.value.trim().toLowerCase();
    const items = [...state.menuItems]
      .filter(item => item.active !== false)
      .filter(item => activeCategory === "all" || item.category_id === activeCategory)
      .filter(item => !query || [item.name, item.description, categoryName(item.category_id), (item.tags || []).join(" ")].join(" ").toLowerCase().includes(query))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    if (!items.length) {
      els.list.innerHTML = `<div class="empty-state">Geen producten gevonden. Probeer een andere zoekterm of categorie.</div>`;
      return;
    }

    els.list.innerHTML = items.map(item => {
      const tags = Array.isArray(item.tags) ? item.tags : String(item.tags || "").split(",").map(tag => tag.trim()).filter(Boolean);
      return `
        <article class="menu-item ${item.highlighted ? "featured" : ""} ${item.available === false ? "soldout" : ""}">
          <div class="menu-head">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <small class="muted">${escapeHtml(categoryName(item.category_id))}</small>
            </div>
            <strong class="price">${escapeHtml(item.available === false ? "Uitverkocht" : item.price_label || "Dagprijs")}</strong>
          </div>
          <p>${escapeHtml(item.description || "")}</p>
          <div class="tag-row">
            ${item.highlighted ? `<span class="tag orange">aanrader</span>` : ""}
            ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  function renderLocations() {
    const locations = [...state.locations].filter(loc => loc.active !== false).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    if (!locations.length) {
      els.locations.innerHTML = `<div class="empty-state">Er zijn nog geen standplaatsen ingevuld.</div>`;
      return;
    }
    els.locations.innerHTML = locations.map(loc => `
      <article class="location-card">
        <div class="location-day">${escapeHtml(loc.day_label)}</div>
        <div>
          <h3>${escapeHtml(loc.place)}</h3>
          <p>${escapeHtml(loc.address || "")}</p>
          ${loc.map_url ? `<p><a href="${escapeHtml(loc.map_url)}" target="_blank" rel="noreferrer">Open in Google Maps</a></p>` : ""}
        </div>
        <div class="location-time">${escapeHtml(loc.time_label || "")}</div>
      </article>
    `).join("");
  }

  function requestPayload() {
    const form = new FormData(els.requestForm);
    return Object.fromEntries(form.entries());
  }

  function requestMessage(payload) {
    return [
      `Nieuwe aanvraag via ${state.business.name}`,
      `Type: ${payload.request_type || "-"}`,
      `Naam: ${payload.name || "-"}`,
      `Telefoon: ${payload.phone || "-"}`,
      `E-mail: ${payload.email || "-"}`,
      `Datum: ${payload.event_date || "-"}`,
      `Aantal personen: ${payload.people || "-"}`,
      `Bericht: ${payload.notes || "-"}`
    ].join("\n");
  }

  async function submitRequest(event) {
    event.preventDefault();
    const payload = requestPayload();
    try {
      await store.submitRequest(payload);
      els.requestFeedback.textContent = "Aanvraag opgeslagen. Bedankt, we nemen contact op.";
      els.requestForm.reset();
    } catch (error) {
      els.requestFeedback.textContent = `Opslaan lukte niet: ${error.message}`;
    }
  }

  function openWhatsAppRequest() {
    const payload = requestPayload();
    window.open(store.waUrl(state.business.whatsapp || state.business.phone, requestMessage(payload)), "_blank", "noopener,noreferrer");
  }

  async function init() {
    try {
      state = await store.loadState();
      renderBusiness();
      renderTabs();
      renderMenu();
      renderLocations();
      els.search.addEventListener("input", renderMenu);
      els.requestForm.addEventListener("submit", submitRequest);
      els.whatsappRequest.addEventListener("click", openWhatsAppRequest);
      if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => null);
    } catch (error) {
      document.body.innerHTML = `<main class="section" style="max-width:760px;margin:0 auto;padding:40px 18px"><div class="empty-state"><strong>App kon niet laden.</strong><br>${escapeHtml(error.message)}</div></main>`;
    }
  }

  init();
})();
