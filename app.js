/* soldout-sort-fix-v1 */
/* final-polish-v2 */
/* polished-final-v1 */
/* day-override-final-v1 */
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
    todayMapList: document.getElementById("today-map-list"),
    search: document.getElementById("menu-search"),
    requestForm: document.getElementById("request-form"),
    requestFeedback: document.getElementById("request-feedback"),
    whatsappRequest: document.getElementById("send-whatsapp")
  };

  let state = null;
  let activeCategory = "all";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;"
    }[char]));
  }


  function itemIsSoldOut(item) {
    const value = item?.available;
    return value === false || value === 0 || value === "false" || value === "0";
  }

  function sortMenuItemsForCustomer(a, b) {
    const aSoldOut = itemIsSoldOut(a) ? 1 : 0;
    const bSoldOut = itemIsSoldOut(b) ? 1 : 0;

    return (
      aSoldOut - bSoldOut ||
      (a.display_order || 0) - (b.display_order || 0) ||
      String(a.name || "").localeCompare(String(b.name || ""), "nl-NL")
    );
  }


  function normalizeDayName(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function getActiveDayName() {
    const params = new URLSearchParams(window.location.search);
    const override = params.get("dag") || params.get("day");

    if (override) {
      return normalizeDayName(override);
    }

    return normalizeDayName(
      new Intl.DateTimeFormat("nl-NL", {
        weekday: "long",
        timeZone: "Europe/Amsterdam"
      }).format(new Date())
    );
  }

  function getDayIndex(dayLabel) {
    const day = normalizeDayName(dayLabel);
    const days = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
    return days.findIndex(name => day.includes(name));
  }


  function currentAmsterdamDayIndex() {
    const dayName = normalizeDayName(
      new Intl.DateTimeFormat("nl-NL", {
        weekday: "long",
        timeZone: "Europe/Amsterdam"
      }).format(new Date())
    );

    const days = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
    return Math.max(0, days.findIndex(day => day === dayName));
  }

  function daysAheadFromToday(dayLabel) {
    const dayIndex = getDayIndex(dayLabel);
    if (dayIndex < 0) return 99;

    const todayIndex = currentAmsterdamDayIndex();
    return (dayIndex - todayIndex + 7) % 7;
  }


  function isActive(value) {
    return value === true || value === 1 || value === "true" || value === "1";
  }

  function locationIsActive(location) {
    return isActive(location?.active);
  }

  function parseStartMinutes(timeLabel) {
    const text = String(timeLabel || "");
    const match = text.match(/\d{1,2}[:.]\d{2}|\d{1,2}/);
    if (!match) return 9999;

    const [hoursRaw, minutesRaw = "0"] = match[0].replace(".", ":").split(":");
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 9999;
    return hours * 60 + minutes;
  }

  function mapsUrl(location) {
    if (location?.map_url) return location.map_url;
    const query = [location?.place, location?.address].filter(Boolean).join(" ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function todayLocations() {
    const activeDayName = getActiveDayName();

    return [...(state.locations || [])]
      .filter(locationIsActive)
      .map((location, index) => ({
        ...location,
        _index: index,
        _dayName: normalizeDayName(location.day_label),
        _startMinutes: parseStartMinutes(location.time_label)
      }))
      .filter(location => location._dayName.includes(activeDayName))
      .sort((a, b) => a._startMinutes - b._startMinutes || (a.display_order || 0) - (b.display_order || 0) || a._index - b._index);
  }

  function renderHeroLocations() {
    if (!els.todayMapList) return;

    const locations = todayLocations();
    els.todayMapList.innerHTML = "";

    if (!locations.length) {
      els.status.textContent = "Vandaag geen actieve standplaats";
      els.statusNote.textContent = "Voor vandaag is er geen standplaats bekend.";
      els.todayMapList.innerHTML = `
        <a class="today-map-card inactive" href="#locaties">
          <div class="map-preview muted-map" aria-hidden="true">
            <span class="map-road road-a"></span>
            <span class="map-road road-b"></span>
            <span class="map-pin">×</span>
          </div>
          <div class="map-copy">
            <strong>Vandaag geen standplaats bekend</strong>
            <span>Bekijk de weekplanning hieronder of neem contact op.</span>
            <small>Geen locatie voor vandaag</small>
          </div>
        </a>
      `;
      return;
    }

    els.status.textContent = locations.length === 1
      ? "Vandaag op locatie"
      : `Vandaag op ${locations.length} locaties`;

    els.statusNote.textContent = locations.length === 1
      ? "Tik op het kaartje om direct de route te openen."
      : "Tik op een locatie om direct de route te openen.";

    els.todayMapList.innerHTML = locations.map(location => `
      <a class="today-map-card" href="${escapeHtml(mapsUrl(location))}" target="_blank" rel="noreferrer">
        <div class="map-preview" aria-hidden="true">
          <span class="map-road road-a"></span>
          <span class="map-road road-b"></span>
          <span class="map-pin">⌖</span>
        </div>
        <div class="map-copy">
          <strong>${escapeHtml(location.place || "Standplaats")}</strong>
          <span>${escapeHtml(location.address || "Adres volgt")}</span>
          <small>${escapeHtml(location.day_label || "Vandaag")} · ${escapeHtml(location.time_label || "Tijden volgen")}</small>
        </div>
      </a>
    `).join("");
  }

  function renderBusiness() {
    const b = state.business;
    document.title = `${b.name} | Live menu`;

    els.name.textContent = b.name;
    els.desc.textContent = b.description;

    els.call.href = `tel:${b.phone}`;
    const baseMessage = `Hallo ${b.name}, ik heb een vraag over het actuele assortiment.`;
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
    const categories = [...state.categories].sort(sortMenuItemsForCustomer);
    const buttons = [{ id: "all", name: "Alles" }, ...categories];

    els.tabs.innerHTML = buttons.map(cat => `
      <button class="pill ${activeCategory === cat.id ? "active" : ""}" type="button" data-category="${escapeHtml(cat.id)}">
        ${escapeHtml(cat.name)}
      </button>
    `).join("");

    els.tabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderTabs();
      renderMenu();
    }));
  }

  function renderMenu() {
    const query = els.search.value.trim().toLowerCase();

    const items = [...state.menuItems]
      .filter(item => item.active !== false)
      .filter(item => activeCategory === "all" || item.category_id === activeCategory)
      .filter(item => !query || [item.name, item.description, categoryName(item.category_id), (item.tags || []).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query))
      .sort(sortMenuItemsForCustomer);

    if (!items.length) {
      els.list.innerHTML = `<div class="empty-state">Geen producten gevonden. Probeer een andere zoekterm of kies een andere categorie.</div>`;
      return;
    }

    els.list.innerHTML = items.map(item => {
      const tags = Array.isArray(item.tags)
        ? item.tags
        : String(item.tags || "").split(",").map(tag => tag.trim()).filter(Boolean);

      return `
        <article class="menu-item ${item.highlighted ? "featured" : ""} ${itemIsSoldOut(item) ? "soldout" : ""}">
          <div class="menu-head">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <small class="muted">${escapeHtml(categoryName(item.category_id))}</small>
            </div>
            <strong class="price">${escapeHtml(itemIsSoldOut(item) ? "Uitverkocht" : item.price_label || "Dagprijs")}</strong>
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
    const locations = [...state.locations]
      .filter(locationIsActive)
      .sort((a, b) =>
        daysAheadFromToday(a.day_label) - daysAheadFromToday(b.day_label) ||
        parseStartMinutes(a.time_label) - parseStartMinutes(b.time_label) ||
        (a.display_order || 0) - (b.display_order || 0)
      );

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
          <p><a href="${escapeHtml(mapsUrl(loc))}" target="_blank" rel="noreferrer">Open in Google Maps</a></p>
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
    ].join("\\n");
  }

  async function submitRequest(event) {
    event.preventDefault();
    const payload = requestPayload();

    try {
      await store.submitRequest(payload);
      els.requestFeedback.textContent = "Aanvraag ontvangen. Bedankt, we nemen contact op.";
      els.requestForm.reset();
    } catch (error) {
      els.requestFeedback.textContent = `Versturen lukte niet: ${error.message}`;
    }
  }

  function openWhatsAppRequest() {
    const payload = requestPayload();
    window.open(store.waUrl(state.business.whatsapp || state.business.phone, requestMessage(payload)), "_blank", "noopener,noreferrer");
  }

  async function init() {
    try {
      state = await store.loadState();
      window.__DEBEER_LAST_STATE = state;

      renderBusiness();
      renderHeroLocations();
      renderTabs();
      renderMenu();
      renderLocations();

      els.search.addEventListener("input", renderMenu);
      els.requestForm.addEventListener("submit", submitRequest);
      els.whatsappRequest.addEventListener("click", openWhatsAppRequest);
    } catch (error) {
      document.body.innerHTML = `<main class="section" style="max-width:760px;margin:0 auto;padding:40px 18px">
        <div class="empty-state"><strong>App kon niet laden.</strong><br>${escapeHtml(error.message)}</div>
      </main>`;
    }
  }

  init();
})();
