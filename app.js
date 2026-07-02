const config = window.FOODTRUCK_CONTROL_CONFIG || {};
const DEMO_KEY = 'foodtruck-control-demo-db';

const demoData = {
  business: {
    id: 'demo-business',
    slug: 'bites-on-wheels',
    name: 'Bites on Wheels',
    tagline: 'Smash burgers · loaded fries · events',
    description: 'Ambachtelijke streetfood, snel geserveerd en strak gepresenteerd. Live menu, actuele locatie en cateringaanvragen in één QR-pagina.',
    whatsapp: '31612345678',
    email: 'hello@bitesonwheels.nl',
    logo_url: '/assets/logo.svg',
    color_primary: '#ff6b35',
    color_accent: '#2ec4b6',
    location_title: 'Foodtruck Festival Eindhoven',
    location_address: 'Ketelhuisplein, 5617 AE Eindhoven',
    location_maps_url: 'https://maps.google.com/?q=Ketelhuisplein%20Eindhoven',
    open_status: 'Vandaag open',
    status_note: 'Open van 12:00 tot 21:00 · zolang de voorraad strekt.',
    next_event_note: 'Vrijdag staan we op de borrelmarkt. Cateringaanvragen vanaf 40 personen mogelijk.',
    business_hours: 'Ma  gesloten\nDi  gesloten\nWo  12:00 - 20:00\nDo  12:00 - 20:00\nVr  12:00 - 22:00\nZa  12:00 - 22:00\nZo  12:00 - 20:00',
    instagram_url: 'https://instagram.com/'
  },
  categories: [
    { id: 'cat-burgers', business_id: 'demo-business', name: 'Burgers', description: 'Smashed, juicy en snel klaar.', sort_order: 1 },
    { id: 'cat-fries', business_id: 'demo-business', name: 'Loaded fries', description: 'Friet met toppings.', sort_order: 2 },
    { id: 'cat-sides', business_id: 'demo-business', name: 'Sides', description: 'Extra bites voor erbij.', sort_order: 3 },
    { id: 'cat-drinks', business_id: 'demo-business', name: 'Drinks', description: 'Koud en snel.', sort_order: 4 }
  ],
  items: [
    { id: 'item-1', business_id: 'demo-business', category_id: 'cat-burgers', name: 'Classic Smash', description: 'Dubbele smash patty, cheddar, pickles, onion jam en house sauce.', price_cents: 1050, allergens: ['gluten', 'melk', 'ei'], labels: ['hardloper'], is_sold_out: false, is_active: true, is_featured: true, sort_order: 1 },
    { id: 'item-2', business_id: 'demo-business', category_id: 'cat-burgers', name: 'Spicy Seoul Burger', description: 'Gochujang mayo, kimchi slaw, cheddar en crispy onions.', price_cents: 1195, allergens: ['gluten', 'melk', 'sesam'], labels: ['spicy'], is_sold_out: false, is_active: true, is_featured: true, sort_order: 2 },
    { id: 'item-3', business_id: 'demo-business', category_id: 'cat-burgers', name: 'Vega Crunch Burger', description: 'Crispy veggie patty, avocado-lime sauce en frisse slaw.', price_cents: 995, allergens: ['gluten', 'ei'], labels: ['vega'], is_sold_out: false, is_active: true, is_featured: false, sort_order: 3 },
    { id: 'item-4', business_id: 'demo-business', category_id: 'cat-fries', name: 'Loaded BBQ Fries', description: 'Friet, pulled beef, BBQ glaze, cheddar sauce en jalapeño.', price_cents: 895, allergens: ['melk'], labels: ['populair'], is_sold_out: false, is_active: true, is_featured: true, sort_order: 1 },
    { id: 'item-5', business_id: 'demo-business', category_id: 'cat-fries', name: 'Truffle Parmesan Fries', description: 'Friet met truffelmayo, Parmezaan en bieslook.', price_cents: 750, allergens: ['melk', 'ei'], labels: ['vega'], is_sold_out: true, is_active: true, is_featured: false, sort_order: 2 },
    { id: 'item-6', business_id: 'demo-business', category_id: 'cat-sides', name: 'Crispy Chicken Bites', description: 'Knapperige kip met smoky dip.', price_cents: 695, allergens: ['gluten', 'ei'], labels: [], is_sold_out: false, is_active: true, is_featured: false, sort_order: 1 },
    { id: 'item-7', business_id: 'demo-business', category_id: 'cat-drinks', name: 'Homemade Lemonade', description: 'Citroen, munt en bruiswater.', price_cents: 350, allergens: [], labels: ['fris'], is_sold_out: false, is_active: true, is_featured: false, sort_order: 1 }
  ],
  requests: []
};

function getSupabaseClient() {
  const hasConfig = config.supabaseUrl && config.supabaseAnonKey && !config.demoMode;
  if (!hasConfig || !window.supabase) return null;
  return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
}

function loadDemoDb() {
  const saved = localStorage.getItem(DEMO_KEY);
  if (!saved) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(demoData));
    return JSON.parse(JSON.stringify(demoData));
  }
  try { return JSON.parse(saved); } catch { return JSON.parse(JSON.stringify(demoData)); }
}

function saveDemoDb(db) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(db));
}

function money(cents) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format((Number(cents) || 0) / 100);
}

function slugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('truck') || config.defaultTruckSlug || 'bites-on-wheels';
}

function text(value, fallback = '') {
  return value === null || value === undefined || value === '' ? fallback : value;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

async function fetchOperationalData() {
  const supabase = getSupabaseClient();
  const slug = slugFromUrl();
  if (!supabase) {
    const db = loadDemoDb();
    return db;
  }

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (businessError || !business) throw new Error('Deze foodtruck is niet gevonden of niet actief.');

  const [{ data: categories, error: catError }, { data: items, error: itemError }] = await Promise.all([
    supabase.from('menu_categories').select('*').eq('business_id', business.id).order('sort_order'),
    supabase.from('menu_items').select('*').eq('business_id', business.id).eq('is_active', true).order('sort_order')
  ]);

  if (catError) throw catError;
  if (itemError) throw itemError;
  return { business, categories: categories || [], items: items || [], requests: [] };
}

function applyBranding(business) {
  document.documentElement.style.setProperty('--primary', business.color_primary || '#ff6b35');
  document.documentElement.style.setProperty('--accent', business.color_accent || '#2ec4b6');
  document.title = `${business.name} | Live QR-menu`;
}

function renderBusiness(data) {
  const { business, items } = data;
  applyBranding(business);
  const activeItems = items.filter((item) => item.is_active !== false);
  const featured = activeItems.filter((item) => item.is_featured);

  document.getElementById('businessLogo').src = business.logo_url || '/assets/logo.svg';
  document.getElementById('businessName').textContent = business.name;
  document.getElementById('businessTagline').textContent = business.tagline || 'Live QR-menu';
  document.getElementById('businessDescription').textContent = business.description || '';
  document.getElementById('openStatus').textContent = business.open_status || 'Status onbekend';
  document.getElementById('statusNote').textContent = business.status_note || '';
  document.getElementById('locationTitle').textContent = business.location_title || 'Locatie volgt';
  document.getElementById('locationAddress').textContent = business.location_address || '';
  document.getElementById('locationTitleLarge').textContent = business.location_title || 'Actuele locatie';
  document.getElementById('locationAddressLarge').textContent = business.location_address || '';
  document.getElementById('hoursBlock').textContent = business.business_hours || '';
  document.getElementById('nextEventNote').textContent = business.next_event_note || 'Volg onze socials voor actuele updates.';
  document.getElementById('itemCount').textContent = String(activeItems.length);
  document.getElementById('featuredCount').textContent = String(featured.length);
  document.getElementById('footerName').textContent = business.name;

  const mapsUrl = business.location_maps_url || `https://maps.google.com/?q=${encodeURIComponent(business.location_address || '')}`;
  document.getElementById('mapsLink').href = mapsUrl;
  document.getElementById('mapsLinkLarge').href = mapsUrl;

  const whatsappMessage = `Hoi ${business.name}, ik heb een vraag over jullie menu/catering.`;
  const whatsappUrl = business.whatsapp ? `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(whatsappMessage)}` : '#';
  document.getElementById('whatsappHero').href = whatsappUrl;
  document.getElementById('whatsappCatering').href = whatsappUrl;
}

function renderMenu(data, activeCategory = 'all') {
  const tabs = document.getElementById('categoryTabs');
  const grid = document.getElementById('menuGrid');
  const categories = [{ id: 'all', name: 'Alles' }, ...data.categories];
  const items = data.items.filter((item) => item.is_active !== false);

  tabs.innerHTML = categories.map((category) => `
    <button class="category-tab ${category.id === activeCategory ? 'active' : ''}" data-category="${escapeHtml(category.id)}">${escapeHtml(category.name)}</button>
  `).join('');

  tabs.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => renderMenu(data, button.dataset.category));
  });

  const visibleItems = activeCategory === 'all' ? items : items.filter((item) => item.category_id === activeCategory);

  if (!visibleItems.length) {
    grid.innerHTML = '<article class="menu-card"><h3>Niets gevonden</h3><p>Er staan nog geen actieve items in deze categorie.</p></article>';
    return;
  }

  grid.innerHTML = visibleItems.map((item) => {
    const labels = [...(item.labels || []), ...(item.allergens || []).map((allergen) => `allergenen: ${allergen}`)];
    return `
      <article class="menu-card ${item.is_featured ? 'featured' : ''} ${item.is_sold_out ? 'sold-out' : ''}">
        <div class="menu-card-header">
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.description || '')}</p>
          </div>
          <span class="price">${money(item.price_cents)}</span>
        </div>
        <div class="tags">
          ${item.is_sold_out ? '<span class="tag danger">uitverkocht</span>' : ''}
          ${item.is_featured ? '<span class="tag warn">special</span>' : ''}
          ${labels.map((label) => `<span class="tag">${escapeHtml(label)}</span>`).join('')}
        </div>
      </article>
    `;
  }).join('');
}

function buildRequestPayload(form) {
  const fd = new FormData(form);
  return {
    customer_name: text(fd.get('customer_name')),
    phone: text(fd.get('phone')),
    email: text(fd.get('email')),
    event_date: text(fd.get('event_date')),
    location: text(fd.get('location')),
    guest_count: Number(fd.get('guest_count')),
    event_type: text(fd.get('event_type')),
    menu_preference: text(fd.get('menu_preference')),
    message: text(fd.get('message')),
    status: 'new'
  };
}

function requestToWhatsApp(business, payload) {
  const lines = [
    `Nieuwe cateringaanvraag voor ${business.name}`,
    `Naam: ${payload.customer_name}`,
    `Telefoon: ${payload.phone}`,
    `E-mail: ${payload.email || '-'}`,
    `Datum: ${payload.event_date}`,
    `Locatie: ${payload.location}`,
    `Aantal personen: ${payload.guest_count}`,
    `Type event: ${payload.event_type}`,
    `Menuwens: ${payload.menu_preference}`,
    `Opmerking: ${payload.message || '-'}`
  ];
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
}

async function handleCateringSubmit(event, data) {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.getElementById('formFeedback');
  const payload = buildRequestPayload(form);
  const supabase = getSupabaseClient();

  feedback.textContent = 'Aanvraag wordt verstuurd...';

  try {
    if (supabase) {
      const { error } = await supabase.from('catering_requests').insert({ ...payload, business_id: data.business.id });
      if (error) throw error;
      feedback.textContent = 'Aanvraag verstuurd. De foodtruck neemt contact met je op.';
      form.reset();
      return;
    }

    const db = loadDemoDb();
    db.requests.unshift({ id: crypto.randomUUID(), business_id: db.business.id, created_at: new Date().toISOString(), ...payload });
    saveDemoDb(db);
    feedback.textContent = 'Demo-aanvraag opgeslagen. WhatsApp wordt geopend.';
    if (data.business.whatsapp) window.open(requestToWhatsApp(data.business, payload), '_blank', 'noopener,noreferrer');
    form.reset();
  } catch (error) {
    feedback.textContent = `Versturen lukt niet: ${error.message}`;
  }
}

async function initPublicApp() {
  try {
    const data = await fetchOperationalData();
    renderBusiness(data);
    renderMenu(data);
    document.getElementById('cateringForm').addEventListener('submit', (event) => handleCateringSubmit(event, data));
  } catch (error) {
    document.body.innerHTML = `
      <main class="section">
        <article class="notice-card">
          <h1>Deze pagina kon niet worden geladen</h1>
          <p>${escapeHtml(error.message)}</p>
        </article>
      </main>
    `;
  }

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }
}

initPublicApp();
