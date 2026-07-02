(function () {
  const config = window.APP_CONFIG || {};
  const LOCAL_KEY = "marktmenu-live-state-v1";

  const defaultState = {
    business: {
      id: "biz-demo",
      slug: "marktmenu-demo",
      name: "MarktMenu Live",
      subtitle: "Live menukaart voor marktkramen, foodtrucks en cateraars",
      phone: "06 12345678",
      whatsapp: "31612345678",
      email: "demo@marktmenu-live.nl",
      address: "Demo locatie",
      description: "Bekijk het actuele aanbod, de standplaatsen van vandaag en vraag eenvoudig een bestelling of reservering aan.",
      status_label: "Demo actief",
      status_note: "Dit is een voorbeeldpagina. Producten, prijzen en standplaatsen zijn fictief."
    },
    categories: [
      { id: "cat-warm", name: "Warme snacks", description: "Direct uit de kraam", display_order: 1 },
      { id: "cat-vers", name: "Vers assortiment", description: "Dagvers aanbod", display_order: 2 },
      { id: "cat-maaltijd", name: "Maaltijden", description: "Voor thuis of onderweg", display_order: 3 },
      { id: "cat-schotels", name: "Schotels & catering", description: "Voor borrel, lunch of feest", display_order: 4 }
    ],
    menuItems: [
      { id: "item-demo-1", category_id: "cat-warm", name: "Warme portie", description: "Populair product uit de kraam. Perfect voor lunch of onderweg.", price_label: "Dagprijs", tags: ["warm", "populair"], available: true, highlighted: true, active: true, display_order: 1 },
      { id: "item-demo-2", category_id: "cat-vers", name: "Dagverse special", description: "Wisselend vers product. Beschikbaarheid kan per dag verschillen.", price_label: "Vraag in de kraam", tags: ["vers", "op = op"], available: true, highlighted: true, active: true, display_order: 2 },
      { id: "item-demo-3", category_id: "cat-maaltijd", name: "Huisgemaakte maaltijd", description: "Kant-en-klaar gerecht om mee te nemen en thuis op te warmen.", price_label: "Vanaf € 8,50", tags: ["maaltijd"], available: true, highlighted: false, active: true, display_order: 3 },
      { id: "item-demo-4", category_id: "cat-vers", name: "Vers product A", description: "Voorbeelditem voor het actuele assortiment.", price_label: "Dagprijs", tags: ["vers"], available: true, highlighted: false, active: true, display_order: 4 },
      { id: "item-demo-5", category_id: "cat-vers", name: "Vers product B", description: "Voorbeelditem dat door de ondernemer zelf aan te passen is.", price_label: "Dagprijs", tags: ["vers"], available: true, highlighted: false, active: true, display_order: 5 },
      { id: "item-demo-6", category_id: "cat-schotels", name: "Luxe borrelschotel", description: "Voorbeeldschotel voor feestjes, lunch of zakelijke bestelling. Vanaf 2 personen.", price_label: "€ 19,50 p.p.", tags: ["vanaf 2 personen", "borrel"], available: true, highlighted: true, active: true, display_order: 6 },
      { id: "item-demo-7", category_id: "cat-schotels", name: "Familiebox", description: "Gemakkelijke box voor thuis of onderweg. Samenstelling is aanpasbaar.", price_label: "Vanaf € 24,95", tags: ["familie", "vooraf bestellen"], available: true, highlighted: false, active: true, display_order: 7 },
      { id: "item-demo-8", category_id: "cat-warm", name: "Seizoensproduct", description: "Voorbeeld van een product dat tijdelijk uitverkocht kan zijn.", price_label: "Uitverkocht", tags: ["tijdelijk"], available: false, highlighted: false, active: true, display_order: 8 }
    ],
    locations: [
      { id: "loc-wo-1", day_label: "Woensdag", time_label: "09:00 - 13:00", place: "Demo Marktplein", address: "Weekmarkt centrum", map_url: "https://www.google.com/maps/search/?api=1&query=Weekmarkt%20centrum", active: true, display_order: 1 },
      { id: "loc-do-1", day_label: "Donderdag", time_label: "10:00 - 18:00", place: "Demo Dorp", address: "Centrum", map_url: "https://www.google.com/maps/search/?api=1&query=Kerk%20centrum", active: true, display_order: 2 },
      { id: "loc-vr-1", day_label: "Vrijdag", time_label: "10:00 - 18:00", place: "Demo Winkelplein", address: "Winkelcentrum", map_url: "https://www.google.com/maps/search/?api=1&query=Winkelcentrum", active: true, display_order: 3 },
      { id: "loc-vr-2", day_label: "Vrijdag", time_label: "15:00 - 19:00", place: "Demo Haven", address: "Havenplein", map_url: "https://www.google.com/maps/search/?api=1&query=Havenplein", active: true, display_order: 4 },
      { id: "loc-za-1", day_label: "Zaterdag", time_label: "09:00 - 16:00", place: "Demo Weekmarkt", address: "Grote markt", map_url: "https://www.google.com/maps/search/?api=1&query=Grote%20Markt", active: true, display_order: 5 }
    ],
    requests: []
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function id(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
  function getSlug() { return new URLSearchParams(location.search).get("truck") || config.DEFAULT_BUSINESS_SLUG || "marktmenu-demo"; }
  function normalizePhone(phone) { return String(phone || "").replace(/[^0-9]/g, "").replace(/^0/, "31"); }
  function waUrl(phone, message) { return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`; }

  function cleanRequest(payload) {
    const copy = { ...payload };
    if (!copy.event_date) copy.event_date = null;
    if (copy.people === "" || copy.people === undefined || copy.people === null) copy.people = null;
    else copy.people = Number(copy.people);
    for (const key of ["name", "phone", "email", "request_type", "notes"]) {
      if (copy[key] === undefined) copy[key] = "";
    }
    return copy;
  }
  function useSupabase() { return !config.DEMO_MODE && config.SUPABASE_URL && config.SUPABASE_ANON_KEY && window.supabase; }
  function client() { return useSupabase() ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY) : null; }

  function localState() {
    try {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (!saved) return clone(defaultState);
      const parsed = JSON.parse(saved);
      return { ...clone(defaultState), ...parsed, business: { ...defaultState.business, ...(parsed.business || {}) } };
    } catch { return clone(defaultState); }
  }
  function saveLocal(state) { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)); return state; }

  async function loadState() {
    if (!useSupabase()) return localState();
    const sb = client();
    const slug = getSlug();
    const { data: business, error: businessError } = await sb.from("businesses").select("*").eq("slug", slug).single();
    if (businessError) throw businessError;
    const [categories, menuItems, locations, requests] = await Promise.all([
      sb.from("menu_categories").select("*").eq("business_id", business.id).order("display_order"),
      sb.from("menu_items").select("*").eq("business_id", business.id).order("display_order"),
      sb.from("locations").select("*").eq("business_id", business.id).order("display_order"),
      sb.from("catering_requests").select("*").eq("business_id", business.id).order("created_at", { ascending: false })
    ]);
    for (const response of [categories, menuItems, locations, requests]) if (response.error) throw response.error;
    return { business, categories: categories.data, menuItems: menuItems.data, locations: locations.data, requests: requests.data };
  }

  async function saveBusiness(businessPatch) {
    if (!useSupabase()) {
      const state = localState();
      state.business = { ...state.business, ...businessPatch };
      return saveLocal(state).business;
    }
    const sb = client();
    const current = await loadState();
    const { data, error } = await sb.from("businesses").update(businessPatch).eq("id", current.business.id).select("*").single();
    if (error) throw error;
    return data;
  }

  async function saveItem(item) {
    if (!useSupabase()) {
      const state = localState();
      const payload = { ...item, id: item.id || id("item"), display_order: Number(item.display_order || state.menuItems.length + 1) };
      const index = state.menuItems.findIndex(row => row.id === payload.id);
      if (index >= 0) state.menuItems[index] = payload; else state.menuItems.push(payload);
      saveLocal(state);
      return payload;
    }
    const sb = client();
    const current = await loadState();
    const payload = { ...item, business_id: current.business.id };
    if (!payload.id) delete payload.id;
    const { data, error } = await sb.from("menu_items").upsert(payload).select("*").single();
    if (error) throw error;
    return data;
  }

  async function deleteItem(itemId) {
    if (!useSupabase()) {
      const state = localState();
      state.menuItems = state.menuItems.filter(item => item.id !== itemId);
      saveLocal(state);
      return;
    }
    const { error } = await client().from("menu_items").delete().eq("id", itemId);
    if (error) throw error;
  }

  async function saveLocation(location) {
    if (!useSupabase()) {
      const state = localState();
      const payload = { ...location, id: location.id || id("loc"), display_order: Number(location.display_order || state.locations.length + 1) };
      const index = state.locations.findIndex(row => row.id === payload.id);
      if (index >= 0) state.locations[index] = payload; else state.locations.push(payload);
      saveLocal(state);
      return payload;
    }
    const sb = client();
    const current = await loadState();
    const payload = { ...location, business_id: current.business.id };
    if (!payload.id) delete payload.id;
    const { data, error } = await sb.from("locations").upsert(payload).select("*").single();
    if (error) throw error;
    return data;
  }

  async function deleteLocation(locationId) {
    if (!useSupabase()) {
      const state = localState();
      state.locations = state.locations.filter(item => item.id !== locationId);
      saveLocal(state);
      return;
    }
    const { error } = await client().from("locations").delete().eq("id", locationId);
    if (error) throw error;
  }

  async function submitRequest(formData) {
    const state = await loadState();
    const payload = { ...cleanRequest(formData), id: id("req"), business_id: state.business.id, status: "nieuw", created_at: new Date().toISOString() };
    if (!useSupabase()) {
      const local = localState();
      local.requests.unshift(payload);
      saveLocal(local);
      return payload;
    }
    const { data, error } = await client().from("catering_requests").insert(payload).select("*").single();
    if (error) throw error;
    return data;
  }

  async function signIn(email, password, pin) {
    if (!useSupabase()) {
      if (String(pin) !== String(config.ADMIN_PIN || "2468")) throw new Error("Pincode klopt niet.");
      sessionStorage.setItem("marktmenu-admin", "1");
      return { demo: true };
    }
    const { data, error } = await client().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  async function signOut() {
    sessionStorage.removeItem("marktmenu-admin");
    if (useSupabase()) await client().auth.signOut();
  }
  async function isSignedIn() {
    if (!useSupabase()) return sessionStorage.getItem("marktmenu-admin") === "1";
    const { data } = await client().auth.getSession();
    return Boolean(data.session);
  }

  window.FISH_APP = {
    defaultState,
    id,
    getSlug,
    loadState,
    saveBusiness,
    saveItem,
    deleteItem,
    saveLocation,
    deleteLocation,
    submitRequest,
    signIn,
    signOut,
    isSignedIn,
    waUrl,
    normalizePhone,
    useSupabase
  };
})();
