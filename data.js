(function () {
  const config = window.APP_CONFIG || {};
  const LOCAL_KEY = "debeer-live-state-v1";

  const defaultState = {
    business: {
      id: "biz-debeer",
      slug: "vishandel-de-beer",
      name: "Vishandel De Beer",
      subtitle: "Dagverse vis uit de kraam",
      phone: "06 22479902",
      whatsapp: "31622479902",
      email: "vishandeldebeer@live.nl",
      address: "Rogier Monicxlaan 16, 5741ES Beek en Donk",
      description: "Bekijk het actuele assortiment, de standplaatsen en vraag snel een schotel of reservering aan.",
      status_label: "Live menu actief",
      status_note: "Assortiment en beschikbaarheid kunnen per dag wisselen. Bel of app gerust voor zekerheid."
    },
    categories: [
      { id: "cat-gebakken", name: "Gebakken vis", description: "Warm uit de kraam", display_order: 1 },
      { id: "cat-vers", name: "Verse vis", description: "Dagvers assortiment", display_order: 2 },
      { id: "cat-schaal", name: "Schaal & schelp", description: "Garnalen, mosselen en meer", display_order: 3 },
      { id: "cat-gerookt", name: "Gerookt & gestoomd", description: "Ambachtelijk bereid", display_order: 4 },
      { id: "cat-klaar", name: "Kant-en-klaar", description: "Maaltijden en lunch", display_order: 5 },
      { id: "cat-schotels", name: "Schotels", description: "Voor borrel, lunch of feest", display_order: 6 }
    ],
    menuItems: [
      { id: "item-kibbeling", category_id: "cat-gebakken", name: "Kibbeling", description: "Vers gebakken vis, ideaal voor lunch of onderweg.", price_label: "Dagprijs", tags: ["warm", "populair"], available: true, highlighted: true, active: true, display_order: 1 },
      { id: "item-vissoep", category_id: "cat-klaar", name: "Vissoep van Pierre", description: "Rijk gevulde vissoep. Verkrijgbaar in halve en hele liters.", price_label: "Vraag in de kraam", tags: ["bestseller", "kan in de vriezer"], available: true, highlighted: true, active: true, display_order: 2 },
      { id: "item-zalmpotje", category_id: "cat-klaar", name: "Zalmpotje", description: "Tagliatelle met verse spinazie en zalm in hollandaisesaus. Thuis opwarmen in de oven.", price_label: "Vraag in de kraam", tags: ["maaltijd", "oven"], available: true, highlighted: false, active: true, display_order: 3 },
      { id: "item-kabeljauw", category_id: "cat-vers", name: "Kabeljauwfilet", description: "Verse filet uit het standaard assortiment. Beschikbaarheid wisselt per dag.", price_label: "Dagprijs", tags: ["vers"], available: true, highlighted: false, active: true, display_order: 4 },
      { id: "item-zalm", category_id: "cat-vers", name: "Zalmfilet", description: "Dagverse zalmfilet, geschikt voor bakken, grillen of ovengerecht.", price_label: "Dagprijs", tags: ["vers"], available: true, highlighted: false, active: true, display_order: 5 },
      { id: "item-sliptong", category_id: "cat-vers", name: "Sliptong", description: "Vraag aan de kraam of bestel vooraf om zeker te zijn van voorraad.", price_label: "Dagprijs", tags: ["vers", "op = op"], available: true, highlighted: false, active: true, display_order: 6 },
      { id: "item-mosselen", category_id: "cat-schaal", name: "Verse mosselen", description: "Verse en gekookte mosselen. Dagvoorraad kan wisselen.", price_label: "Dagprijs", tags: ["schaal/schelp"], available: true, highlighted: false, active: true, display_order: 7 },
      { id: "item-garnalen", category_id: "cat-schaal", name: "Hollandse garnalen", description: "Hollandse, Noorse en party garnalen beschikbaar afhankelijk van voorraad.", price_label: "Dagprijs", tags: ["garnalen"], available: true, highlighted: false, active: true, display_order: 8 },
      { id: "item-paling", category_id: "cat-gerookt", name: "Gerookte palingfilet", description: "Ambachtelijk gerookt. Per 100 gram verkrijgbaar.", price_label: "Per 100 gram", tags: ["gerookt"], available: true, highlighted: false, active: true, display_order: 9 },
      { id: "item-makreel", category_id: "cat-gerookt", name: "Makreel & makreelfilet", description: "Gerookt of gestoomd, heerlijk voor lunch of tussendoor.", price_label: "Dagprijs", tags: ["gerookt"], available: true, highlighted: false, active: true, display_order: 10 },
      { id: "item-luxe-schotel", category_id: "cat-schotels", name: "Luxe vis-hapjes schotel", description: "Met o.a. gerookte zalmfilet, palingfilet, forelfilet, garnalen, makreel en salade. Vanaf 2 personen.", price_label: "€ 22,50 p.p.", tags: ["vanaf 2 personen", "borrel"], available: true, highlighted: true, active: true, display_order: 11 },
      { id: "item-gourmet", category_id: "cat-schotels", name: "Gourmet schotel", description: "Rijk gevulde schaal met minimaal zeven verschillende vissoorten. Vanaf 2 personen.", price_label: "€ 15,- p.p.", tags: ["gourmet", "vanaf 2 personen"], available: true, highlighted: false, active: true, display_order: 12 },
      { id: "item-zalmsalade", category_id: "cat-schotels", name: "Zalmsalade schotel", description: "Luxe opgemaakte schaal met zalmsalade en visproducten. Vanaf 2 personen.", price_label: "€ 27,50 p.p.", tags: ["feest", "vanaf 2 personen"], available: true, highlighted: false, active: true, display_order: 13 },
      { id: "item-haring", category_id: "cat-schotels", name: "Haring schotel", description: "Minimaal 10 haringen. Heel, gehalveerd of in vieren gesneden, met uitjes.", price_label: "Dagprijs + €5 opmaak", tags: ["min. 10 haringen"], available: true, highlighted: false, active: true, display_order: 14 }
    ],
    locations: [
      { id: "loc-wo-1", day_label: "Woensdag", time_label: "09:00 - 13:00", place: "Beek en Donk", address: "Weekmarkt", map_url: "", active: true, display_order: 1 },
      { id: "loc-wo-2", day_label: "Woensdag", time_label: "15:00 - 18:00", place: "De Mortel", address: "Bij De Sprank", map_url: "", active: true, display_order: 2 },
      { id: "loc-do-1", day_label: "Donderdag", time_label: "10:00 - 18:00", place: "Stiphout", address: "Bij de kerk", map_url: "", active: true, display_order: 3 },
      { id: "loc-do-2", day_label: "Donderdag", time_label: "10:00 - 18:00", place: "Beek en Donk", address: "Piet van Thielplein", map_url: "", active: true, display_order: 4 },
      { id: "loc-vr-1", day_label: "Vrijdag", time_label: "10:00 - 18:00", place: "Beek en Donk", address: "Heuvelplein", map_url: "", active: true, display_order: 5 },
      { id: "loc-vr-2", day_label: "Vrijdag", time_label: "10:00 - 18:00", place: "Lieshout", address: "Jumbo", map_url: "", active: true, display_order: 6 },
      { id: "loc-za-1", day_label: "Zaterdag", time_label: "09:00 - 14:00", place: "Aarle-Rixtel", address: "Bij de kerk", map_url: "", active: true, display_order: 7 },
      { id: "loc-za-2", day_label: "Zaterdag", time_label: "09:00 - 16:00", place: "Stiphout", address: "Bij de kerk", map_url: "", active: true, display_order: 8 },
      { id: "loc-za-3", day_label: "Zaterdag", time_label: "15:15 - 17:30", place: "Beek en Donk", address: "Piet van Thielplein", map_url: "", active: true, display_order: 9 }
    ],
    requests: []
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function id(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
  function getSlug() { return new URLSearchParams(location.search).get("truck") || config.DEFAULT_BUSINESS_SLUG || "vishandel-de-beer"; }
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
      sessionStorage.setItem("debeer-admin", "1");
      return { demo: true };
    }
    const { data, error } = await client().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  async function signOut() {
    sessionStorage.removeItem("debeer-admin");
    if (useSupabase()) await client().auth.signOut();
  }
  async function isSignedIn() {
    if (!useSupabase()) return sessionStorage.getItem("debeer-admin") === "1";
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
