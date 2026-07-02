(function () {
  const config = window.APP_CONFIG || {};
  const LOCAL_KEY = "marktmenu-live-state-v3-filled";

  const defaultState = {
    business: {
      id: "biz-demo",
      slug: "marktmenu-demo",
      name: "MarktMenu Live",
      subtitle: "Mobiele menukaart voor foodtrucks, marktkramen en cateraars",
      phone: "06 12345678",
      whatsapp: "31612345678",
      email: "demo@marktmenu-live.nl",
      address: "Demo Marktplein 1, 0000 AA Demo",
      description: "Bekijk het actuele aanbod, de standplaatsen van vandaag en vraag eenvoudig een bestelling, reservering of catering aan.",
      status_label: "Demo actief",
      status_note: "Alle producten, prijzen en locaties op deze pagina zijn fictief."
    },
    categories: [
      { id: "cat-populair", name: "Populair", description: "Meest gekozen bij de kraam", display_order: 1 },
      { id: "cat-warm", name: "Warm eten", description: "Vers bereid en direct klaar", display_order: 2 },
      { id: "cat-broodjes", name: "Broodjes & wraps", description: "Voor lunch of onderweg", display_order: 3 },
      { id: "cat-drank", name: "Dranken", description: "Koud en warm drinken", display_order: 4 },
      { id: "cat-catering", name: "Catering & schotels", description: "Voor groepen, borrels en events", display_order: 5 }
    ],
    menuItems: [
      {
        id: "item-001",
        category_id: "cat-populair",
        name: "Loaded fries pulled chicken",
        description: "Verse friet met pulled chicken, frisse slaw, smokey saus en krokante uitjes.",
        price_label: "€ 9,50",
        tags: ["populair", "warm", "lunch"],
        available: true,
        highlighted: true,
        active: true,
        display_order: 1
      },
      {
        id: "item-002",
        category_id: "cat-populair",
        name: "Streetfood burger",
        description: "Sappige burger op brioche met cheddar, sla, tomaat en huisgemaakte burgersaus.",
        price_label: "€ 8,95",
        tags: ["hardloper", "warm"],
        available: true,
        highlighted: true,
        active: true,
        display_order: 2
      },
      {
        id: "item-003",
        category_id: "cat-warm",
        name: "Verse friet met saus",
        description: "Krokant gebakken friet met saus naar keuze.",
        price_label: "Vanaf € 3,75",
        tags: ["vegetarisch mogelijk"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 3
      },
      {
        id: "item-004",
        category_id: "cat-warm",
        name: "Crispy chicken bites",
        description: "Krokante kipstukjes met keuze uit knoflooksaus, chilisaus of BBQ-saus.",
        price_label: "€ 6,95",
        tags: ["warm", "snack"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 4
      },
      {
        id: "item-005",
        category_id: "cat-warm",
        name: "Dagsoep met brood",
        description: "Wisselende huisgemaakte soep, geserveerd met brood en kruidenboter.",
        price_label: "€ 5,50",
        tags: ["dagproduct"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 5
      },
      {
        id: "item-006",
        category_id: "cat-broodjes",
        name: "Broodje warme beenham",
        description: "Zacht broodje met warme beenham, honing-mosterdsaus en rucola.",
        price_label: "€ 6,75",
        tags: ["lunch"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 6
      },
      {
        id: "item-007",
        category_id: "cat-broodjes",
        name: "Wrap gegrilde groenten",
        description: "Wrap met gegrilde groenten, hummus, sla en kruidige yoghurtsaus.",
        price_label: "€ 7,25",
        tags: ["vegetarisch", "fris"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 7
      },
      {
        id: "item-008",
        category_id: "cat-broodjes",
        name: "Broodje gehaktbal",
        description: "Huisgemaakte gehaktbal op een zacht broodje met jus of mosterd.",
        price_label: "€ 5,95",
        tags: ["klassieker"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 8
      },
      {
        id: "item-009",
        category_id: "cat-drank",
        name: "Frisdrank blikje",
        description: "Diverse gekoelde frisdranken. Vraag bij de kraam naar het actuele aanbod.",
        price_label: "€ 2,50",
        tags: ["koud"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 9
      },
      {
        id: "item-010",
        category_id: "cat-drank",
        name: "Verse koffie",
        description: "Warme koffie voor onderweg.",
        price_label: "€ 2,75",
        tags: ["warm"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 10
      },
      {
        id: "item-011",
        category_id: "cat-catering",
        name: "Borrelbox compleet",
        description: "Rijk gevulde borrelbox met warme en koude hapjes. Ideaal voor feestjes of zakelijke lunch.",
        price_label: "Vanaf € 24,95",
        tags: ["vooraf bestellen", "vanaf 4 personen"],
        available: true,
        highlighted: true,
        active: true,
        display_order: 11
      },
      {
        id: "item-012",
        category_id: "cat-catering",
        name: "Lunchpakket bedrijf",
        description: "Lunchpakket met broodje, snack, fruit en drankje. Samenstelling in overleg.",
        price_label: "Vanaf € 11,50 p.p.",
        tags: ["zakelijk", "op aanvraag"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 12
      },
      {
        id: "item-013",
        category_id: "cat-catering",
        name: "Eventpakket foodtruck",
        description: "Voorbeeldpakket voor buurtfeest, open dag of bedrijfsevent. Inclusief planning en assortiment.",
        price_label: "Offerte op aanvraag",
        tags: ["events", "maatwerk"],
        available: true,
        highlighted: false,
        active: true,
        display_order: 13
      },
      {
        id: "item-014",
        category_id: "cat-warm",
        name: "Seizoensspecial",
        description: "Tijdelijk product dat ondernemers zelf eenvoudig aan of uit kunnen zetten.",
        price_label: "Uitverkocht",
        tags: ["tijdelijk", "op = op"],
        available: false,
        highlighted: false,
        active: true,
        display_order: 14
      }
    ],
    locations: [
      {
        id: "loc-ma-1",
        day_label: "Maandag",
        time_label: "11:00 - 14:00",
        place: "Demo Bedrijvenpark",
        address: "Lunchplein 4, Demo",
        map_url: "https://www.google.com/maps/search/?api=1&query=bedrijvenpark",
        active: true,
        display_order: 1
      },
      {
        id: "loc-wo-1",
        day_label: "Woensdag",
        time_label: "09:00 - 13:00",
        place: "Weekmarkt Centrum",
        address: "Marktplein 1, Demo",
        map_url: "https://www.google.com/maps/search/?api=1&query=weekmarkt%20centrum",
        active: true,
        display_order: 2
      },
      {
        id: "loc-do-1",
        day_label: "Donderdag",
        time_label: "10:00 - 18:00",
        place: "Winkelcentrum Noord",
        address: "Winkelhof 12, Demo",
        map_url: "https://www.google.com/maps/search/?api=1&query=winkelcentrum",
        active: true,
        display_order: 3
      },
      {
        id: "loc-vr-1",
        day_label: "Vrijdag",
        time_label: "11:00 - 15:00",
        place: "Station Zuid",
        address: "Stationsplein 2, Demo",
        map_url: "https://www.google.com/maps/search/?api=1&query=station",
        active: true,
        display_order: 4
      },
      {
        id: "loc-vr-2",
        day_label: "Vrijdag",
        time_label: "16:00 - 20:00",
        place: "Havenplein",
        address: "Havenplein 8, Demo",
        map_url: "https://www.google.com/maps/search/?api=1&query=havenplein",
        active: true,
        display_order: 5
      },
      {
        id: "loc-za-1",
        day_label: "Zaterdag",
        time_label: "09:00 - 16:00",
        place: "Grote Weekmarkt",
        address: "Grote Markt 1, Demo",
        map_url: "https://www.google.com/maps/search/?api=1&query=grote%20markt",
        active: true,
        display_order: 6
      }
    ],
    requests: [
      {
        id: "req-demo-1",
        name: "Demo klant",
        phone: "0612345678",
        email: "klant@example.nl",
        request_type: "Catering / feestje",
        event_date: null,
        people: 12,
        notes: "Voorbeeld aanvraag: borrelbox voor zaterdagmiddag.",
        status: "Nieuw",
        created_at: "2026-07-03T10:00:00.000Z"
      }
    ]
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
      const base = clone(defaultState);
      return {
        ...base,
        ...parsed,
        business: { ...base.business, ...(parsed.business || {}) },
        categories: Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : base.categories,
        menuItems: Array.isArray(parsed.menuItems) && parsed.menuItems.length ? parsed.menuItems : base.menuItems,
        locations: Array.isArray(parsed.locations) && parsed.locations.length ? parsed.locations : base.locations,
        requests: Array.isArray(parsed.requests) ? parsed.requests : base.requests
      };
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
