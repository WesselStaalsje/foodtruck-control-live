(async function () {
  const store = window.FISH_APP;
  const els = {
    name: document.getElementById("business-name"),
    desc: document.getElementById("business-description"),
    status: document.getElementById("current-status"),
    statusNote: document.getElementById("current-location"),
    todayPlace: document.getElementById("today-place"),
    todayAddress: document.getElementById("today-address"),
    todayTime: document.getElementById("today-time"),
    todayMapCard: document.getElementById("today-map-card"),
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


  function mapUrlForLocation(location) {
    if (location?.map_url) return location.map_url;
    const query = [location?.place, location?.address, "Nederland"].filter(Boolean).join(" ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function getTodayLocation() {
    const locations = [...(state.locations || [])]
      .filter(location => location.active !== false)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    if (!locations.length) return null;

    const today = new Date().toLocaleDateString("nl-NL", { weekday: "long" }).toLowerCase();
    return locations.find(location => String(location.day_label || "").toLowerCase().includes(today)) || locations[0];
  }

  function renderTodayLocationCard() {
    if (!els.todayMapCard || !els.todayPlace || !els.todayAddress || !els.todayTime) return;
    const location = getTodayLocation();

    if (!location) {
      els.todayPlace.textContent = "Standplaats volgt";
      els.todayAddress.textContent = "Bel of app voor de actuele locatie.";
      els.todayTime.textContent = "Nog niet ingevuld";
      els.todayMapCard.href = "#locaties";
      els.todayMapCard.removeAttribute("target");
      return;
    }

    els.todayPlace.textContent = location.place || "Standplaats";
    els.todayAddress.textContent = location.address || "Adres volgt";
    els.todayTime.textContent = `${location.day_label || "Vandaag"} · ${location.time_label || "Tijden volgen"}`;
    els.todayMapCard.href = mapUrlForLocation(location);
    els.todayMapCard.target = "_blank";
    els.todayMapCard.rel = "noreferrer";
  }

  function renderBusiness() {
    const b = state.business;
    document.title = `${b.name} | Live menu`;
    els.name.textContent = b.name;
    els.desc.textContent = b.description;
    els.status.textContent = b.status_label || "Live menu actief";
    els.statusNote.textContent = b.status_note || "Assortiment en beschikbaarheid kunnen per dag wisselen.";
    renderTodayLocationCard();
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
    els.locations.innerHTML = locations.map(loc => {
      const mapUrl = mapUrlForLocation(loc);
      return `
        <a class="location-card" href="${escapeHtml(mapUrl)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(loc.place)} in Google Maps">
          <div class="location-day">${escapeHtml(loc.day_label)}</div>
          <div>
            <h3>${escapeHtml(loc.place)}</h3>
            <p>${escapeHtml(loc.address || "")}</p>
            <p class="maps-hint">Open in Google Maps</p>
          </div>
          <div class="location-time">${escapeHtml(loc.time_label || "")}</div>
        </a>
      `;
    }).join("");
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
