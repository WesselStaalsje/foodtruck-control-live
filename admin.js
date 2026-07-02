const config = window.FOODTRUCK_CONTROL_CONFIG || {};
const DEMO_KEY = 'foodtruck-control-demo-db';
let state = { business: null, categories: [], items: [], requests: [], user: null, isDemo: true };

const demoSeed = {
  business: {
    id: 'demo-business', slug: 'bites-on-wheels', name: 'Bites on Wheels', tagline: 'Smash burgers · loaded fries · events',
    description: 'Ambachtelijke streetfood, snel geserveerd en strak gepresenteerd. Live menu, actuele locatie en cateringaanvragen in één QR-pagina.',
    whatsapp: '31612345678', email: 'hello@bitesonwheels.nl', logo_url: '/assets/logo.svg', color_primary: '#ff6b35', color_accent: '#2ec4b6',
    location_title: 'Foodtruck Festival Eindhoven', location_address: 'Ketelhuisplein, 5617 AE Eindhoven', location_maps_url: 'https://maps.google.com/?q=Ketelhuisplein%20Eindhoven',
    open_status: 'Vandaag open', status_note: 'Open van 12:00 tot 21:00 · zolang de voorraad strekt.',
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
    { id: 'item-4', business_id: 'demo-business', category_id: 'cat-fries', name: 'Loaded BBQ Fries', description: 'Friet, pulled beef, BBQ glaze, cheddar sauce en jalapeño.', price_cents: 895, allergens: ['melk'], labels: ['populair'], is_sold_out: false, is_active: true, is_featured: true, sort_order: 1 },
    { id: 'item-7', business_id: 'demo-business', category_id: 'cat-drinks', name: 'Homemade Lemonade', description: 'Citroen, munt en bruiswater.', price_cents: 350, allergens: [], labels: ['fris'], is_sold_out: false, is_active: true, is_featured: false, sort_order: 1 }
  ],
  requests: []
};

function getSupabaseClient() {
  const hasConfig = config.supabaseUrl && config.supabaseAnonKey && !config.demoMode;
  if (!hasConfig || !window.supabase) return null;
  return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
}

function demoDb() {
  const saved = localStorage.getItem(DEMO_KEY);
  if (!saved) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(demoSeed));
    return JSON.parse(JSON.stringify(demoSeed));
  }
  try { return JSON.parse(saved); } catch { return JSON.parse(JSON.stringify(demoSeed)); }
}
function saveDemoDb(db) { localStorage.setItem(DEMO_KEY, JSON.stringify(db)); }
function money(cents) { return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format((Number(cents) || 0) / 100); }
function centsFromInput(value) { return Math.round(Number(String(value).replace(',', '.')) * 100); }
function csv(value) { return String(value || '').split(',').map((item) => item.trim()).filter(Boolean); }
function arr(value) { return Array.isArray(value) ? value : csv(value); }
function esc(value = '') { return String(value).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function byId(id) { return document.getElementById(id); }

async function login(email, password) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    state.isDemo = true;
    await loadAll();
    showAdmin();
    return;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  state.user = data.user;
  state.isDemo = false;
  await loadAll();
  showAdmin();
}

async function logout() {
  const supabase = getSupabaseClient();
  if (supabase) await supabase.auth.signOut();
  state = { business: null, categories: [], items: [], requests: [], user: null, isDemo: true };
  byId('adminContent').classList.add('hidden');
  byId('loginCard').classList.remove('hidden');
}

async function loadAll() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const db = demoDb();
    state = { ...db, user: { id: 'demo-user', email: 'demo@foodtruckcontrol.nl' }, isDemo: true };
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error('Niet ingelogd.');
  state.user = sessionData.session.user;

  const { data: member, error: memberError } = await supabase
    .from('business_users')
    .select('business_id, role, businesses(*)')
    .eq('user_id', state.user.id)
    .limit(1)
    .single();
  if (memberError || !member) throw new Error('Geen foodtruck gekoppeld aan deze gebruiker.');

  const business = member.businesses;
  const [{ data: categories, error: catError }, { data: items, error: itemError }, { data: requests, error: reqError }] = await Promise.all([
    supabase.from('menu_categories').select('*').eq('business_id', business.id).order('sort_order'),
    supabase.from('menu_items').select('*').eq('business_id', business.id).order('sort_order'),
    supabase.from('catering_requests').select('*').eq('business_id', business.id).order('created_at', { ascending: false })
  ]);
  if (catError) throw catError;
  if (itemError) throw itemError;
  if (reqError) throw reqError;
  state = { business, categories: categories || [], items: items || [], requests: requests || [], user: state.user, isDemo: false };
}

async function persist(table, action, payload, id) {
  if (state.isDemo) {
    const db = demoDb();
    if (table === 'businesses') {
      db.business = { ...db.business, ...payload };
    } else {
      const key = table === 'menu_categories' ? 'categories' : table === 'menu_items' ? 'items' : 'requests';
      if (action === 'insert') db[key].push({ id: crypto.randomUUID(), business_id: db.business.id, ...payload });
      if (action === 'update') db[key] = db[key].map((row) => row.id === id ? { ...row, ...payload } : row);
      if (action === 'delete') db[key] = db[key].filter((row) => row.id !== id);
    }
    saveDemoDb(db);
    await loadAll();
    renderAll();
    return;
  }

  const supabase = getSupabaseClient();
  let result;
  if (action === 'insert') result = await supabase.from(table).insert({ ...payload, business_id: state.business.id });
  if (action === 'update') result = await supabase.from(table).update(payload).eq('id', id).eq('business_id', state.business.id);
  if (action === 'delete') result = await supabase.from(table).delete().eq('id', id).eq('business_id', state.business.id);
  if (table === 'businesses') result = await supabase.from('businesses').update(payload).eq('id', state.business.id);
  if (result?.error) throw result.error;
  await loadAll();
  renderAll();
}

function showAdmin() {
  byId('loginCard').classList.add('hidden');
  byId('adminContent').classList.remove('hidden');
  renderAll();
}

function renderAll() {
  if (!state.business) return;
  byId('adminBusinessName').textContent = state.business.name;
  byId('previewLink').href = `/?truck=${state.business.slug}`;
  renderOverview();
  renderMenuManager();
  renderCategories();
  renderRequests();
  renderSettings();
}

function renderOverview() {
  const activeItems = state.items.filter((item) => item.is_active !== false);
  const soldOut = activeItems.filter((item) => item.is_sold_out);
  const openRequests = state.requests.filter((req) => req.status !== 'closed');
  byId('tab-overview').innerHTML = `
    <div class="dashboard-grid">
      <article class="metric-card"><strong>${activeItems.length}</strong><span>Actieve menu-items</span></article>
      <article class="metric-card"><strong>${soldOut.length}</strong><span>Uitverkocht</span></article>
      <article class="metric-card"><strong>${state.categories.length}</strong><span>Categorieën</span></article>
      <article class="metric-card"><strong>${openRequests.length}</strong><span>Open aanvragen</span></article>
    </div>
    <div class="admin-grid">
      <article class="admin-card">
        <h2>Vandaag live</h2>
        <p><strong>Status:</strong> ${esc(state.business.open_status || '-')}</p>
        <p><strong>Notitie:</strong> ${esc(state.business.status_note || '-')}</p>
        <p><strong>Locatie:</strong> ${esc(state.business.location_title || '-')} · ${esc(state.business.location_address || '-')}</p>
      </article>
      <article class="admin-card">
        <h2>Snelle acties</h2>
        <div class="row-actions">
          <button class="small-btn" data-switch-tab="menu">Menu bijwerken</button>
          <button class="small-btn secondary" data-switch-tab="settings">Locatie aanpassen</button>
          <button class="small-btn secondary" data-switch-tab="requests">Aanvragen bekijken</button>
        </div>
      </article>
    </div>
  `;
  byId('tab-overview').querySelectorAll('[data-switch-tab]').forEach((button) => button.addEventListener('click', () => setTab(button.dataset.switchTab)));
}

function categoryOptions(selectedId = '') {
  return state.categories.map((cat) => `<option value="${esc(cat.id)}" ${cat.id === selectedId ? 'selected' : ''}>${esc(cat.name)}</option>`).join('');
}

function renderMenuManager() {
  const panel = byId('tab-menu');
  panel.innerHTML = `
    <div class="admin-grid">
      <article class="admin-card">
        <h2>Menu-items</h2>
        <div class="table-like">
          ${state.items.map((item) => renderItemRow(item)).join('') || '<p>Nog geen menu-items.</p>'}
        </div>
      </article>
      <article class="admin-card">
        <h2>Item toevoegen</h2>
        <form id="itemForm" class="form-stack">
          <label>Naam <input name="name" required placeholder="Bijv. Classic Smash" /></label>
          <label>Beschrijving <textarea name="description" rows="3" placeholder="Korte omschrijving"></textarea></label>
          <div class="inline-grid">
            <label>Prijs (€) <input name="price" type="number" step="0.01" min="0" required placeholder="9.95" /></label>
            <label>Categorie <select name="category_id" required>${categoryOptions()}</select></label>
          </div>
          <div class="inline-grid">
            <label>Labels <input name="labels" placeholder="vega, spicy, hardloper" /></label>
            <label>Allergenen <input name="allergens" placeholder="gluten, melk, ei" /></label>
          </div>
          <div class="switch-row">
            <label><input name="is_featured" type="checkbox" /> Special tonen</label>
            <label><input name="is_sold_out" type="checkbox" /> Uitverkocht</label>
            <label><input name="is_active" type="checkbox" checked /> Actief</label>
          </div>
          <button class="btn primary" type="submit">Item toevoegen</button>
        </form>
      </article>
    </div>
  `;

  panel.querySelector('#itemForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    await persist('menu_items', 'insert', {
      name: fd.get('name'),
      description: fd.get('description'),
      price_cents: centsFromInput(fd.get('price')),
      category_id: fd.get('category_id'),
      labels: csv(fd.get('labels')),
      allergens: csv(fd.get('allergens')),
      is_featured: fd.get('is_featured') === 'on',
      is_sold_out: fd.get('is_sold_out') === 'on',
      is_active: fd.get('is_active') === 'on',
      sort_order: state.items.length + 1
    });
  });

  panel.querySelectorAll('[data-toggle-soldout]').forEach((button) => button.addEventListener('click', async () => {
    const item = state.items.find((x) => x.id === button.dataset.toggleSoldout);
    await persist('menu_items', 'update', { is_sold_out: !item.is_sold_out }, item.id);
  }));
  panel.querySelectorAll('[data-toggle-active]').forEach((button) => button.addEventListener('click', async () => {
    const item = state.items.find((x) => x.id === button.dataset.toggleActive);
    await persist('menu_items', 'update', { is_active: !item.is_active }, item.id);
  }));
  panel.querySelectorAll('[data-delete-item]').forEach((button) => button.addEventListener('click', async () => {
    if (confirm('Menu-item verwijderen?')) await persist('menu_items', 'delete', {}, button.dataset.deleteItem);
  }));
  panel.querySelectorAll('[data-edit-item]').forEach((button) => button.addEventListener('click', () => renderEditItem(button.dataset.editItem)));
}

function renderItemRow(item) {
  const cat = state.categories.find((category) => category.id === item.category_id);
  return `
    <div class="row-card">
      <div class="row-card-head">
        <div>
          <h3>${esc(item.name)} ${item.is_featured ? '· ⭐' : ''}</h3>
          <p>${esc(cat?.name || 'Geen categorie')} · ${money(item.price_cents)} · ${item.is_active ? 'actief' : 'verborgen'} ${item.is_sold_out ? '· uitverkocht' : ''}</p>
        </div>
        <span class="request-status ${item.is_sold_out ? 'new' : ''}">${item.is_sold_out ? 'uitverkocht' : 'beschikbaar'}</span>
      </div>
      <p>${esc(item.description || '')}</p>
      <div class="row-actions">
        <button class="small-btn" data-edit-item="${esc(item.id)}">Bewerken</button>
        <button class="small-btn secondary" data-toggle-soldout="${esc(item.id)}">${item.is_sold_out ? 'Beschikbaar zetten' : 'Uitverkocht zetten'}</button>
        <button class="small-btn secondary" data-toggle-active="${esc(item.id)}">${item.is_active ? 'Verbergen' : 'Tonen'}</button>
        <button class="small-btn danger" data-delete-item="${esc(item.id)}">Verwijderen</button>
      </div>
    </div>
  `;
}

function renderEditItem(id) {
  const item = state.items.find((x) => x.id === id);
  if (!item) return;
  const panel = byId('tab-menu');
  const existing = panel.querySelector('#editItemCard');
  if (existing) existing.remove();
  panel.insertAdjacentHTML('beforeend', `
    <article class="admin-card" id="editItemCard">
      <h2>Item bewerken</h2>
      <form id="editItemForm" class="form-stack">
        <label>Naam <input name="name" required value="${esc(item.name)}" /></label>
        <label>Beschrijving <textarea name="description" rows="3">${esc(item.description || '')}</textarea></label>
        <div class="inline-grid">
          <label>Prijs (€) <input name="price" type="number" step="0.01" min="0" required value="${(item.price_cents / 100).toFixed(2)}" /></label>
          <label>Categorie <select name="category_id" required>${categoryOptions(item.category_id)}</select></label>
        </div>
        <div class="inline-grid">
          <label>Labels <input name="labels" value="${esc(arr(item.labels).join(', '))}" /></label>
          <label>Allergenen <input name="allergens" value="${esc(arr(item.allergens).join(', '))}" /></label>
        </div>
        <div class="switch-row">
          <label><input name="is_featured" type="checkbox" ${item.is_featured ? 'checked' : ''} /> Special tonen</label>
          <label><input name="is_sold_out" type="checkbox" ${item.is_sold_out ? 'checked' : ''} /> Uitverkocht</label>
          <label><input name="is_active" type="checkbox" ${item.is_active ? 'checked' : ''} /> Actief</label>
        </div>
        <div class="form-actions">
          <button class="btn primary" type="submit">Wijzigingen opslaan</button>
          <button class="btn ghost" type="button" id="cancelEdit">Annuleren</button>
        </div>
      </form>
    </article>
  `);
  panel.querySelector('#cancelEdit').addEventListener('click', () => panel.querySelector('#editItemCard').remove());
  panel.querySelector('#editItemForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    await persist('menu_items', 'update', {
      name: fd.get('name'),
      description: fd.get('description'),
      price_cents: centsFromInput(fd.get('price')),
      category_id: fd.get('category_id'),
      labels: csv(fd.get('labels')),
      allergens: csv(fd.get('allergens')),
      is_featured: fd.get('is_featured') === 'on',
      is_sold_out: fd.get('is_sold_out') === 'on',
      is_active: fd.get('is_active') === 'on'
    }, item.id);
  });
  panel.querySelector('#editItemCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCategories() {
  const panel = byId('tab-categories');
  panel.innerHTML = `
    <div class="admin-grid">
      <article class="admin-card">
        <h2>Categorieën</h2>
        <div class="table-like">
          ${state.categories.map((cat) => `
            <div class="row-card">
              <div class="row-card-head"><h3>${esc(cat.name)}</h3><span class="request-status">${cat.sort_order || 0}</span></div>
              <p>${esc(cat.description || '')}</p>
              <div class="row-actions"><button class="small-btn danger" data-delete-category="${esc(cat.id)}">Verwijderen</button></div>
            </div>
          `).join('') || '<p>Nog geen categorieën.</p>'}
        </div>
      </article>
      <article class="admin-card">
        <h2>Categorie toevoegen</h2>
        <form id="categoryForm" class="form-stack">
          <label>Naam <input name="name" required placeholder="Bijv. Burgers" /></label>
          <label>Beschrijving <textarea name="description" rows="3"></textarea></label>
          <label>Volgorde <input name="sort_order" type="number" value="${state.categories.length + 1}" /></label>
          <button class="btn primary" type="submit">Categorie toevoegen</button>
        </form>
      </article>
    </div>
  `;
  panel.querySelector('#categoryForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    await persist('menu_categories', 'insert', { name: fd.get('name'), description: fd.get('description'), sort_order: Number(fd.get('sort_order') || 0) });
  });
  panel.querySelectorAll('[data-delete-category]').forEach((button) => button.addEventListener('click', async () => {
    if (confirm('Categorie verwijderen? Items in deze categorie blijven bestaan, maar hebben geen nette categorie meer.')) await persist('menu_categories', 'delete', {}, button.dataset.deleteCategory);
  }));
}

function renderRequests() {
  const panel = byId('tab-requests');
  panel.innerHTML = `
    <article class="admin-card">
      <h2>Cateringaanvragen</h2>
      <div class="table-like">
        ${state.requests.map((req) => `
          <div class="row-card">
            <div class="row-card-head">
              <div><h3>${esc(req.customer_name || 'Onbekend')}</h3><p>${esc(req.event_type || '-')} · ${esc(req.event_date || '-')} · ${Number(req.guest_count || 0)} personen</p></div>
              <span class="request-status ${req.status === 'new' ? 'new' : req.status === 'closed' ? 'closed' : ''}">${esc(req.status || 'new')}</span>
            </div>
            <p><strong>Telefoon:</strong> ${esc(req.phone || '-')} · <strong>E-mail:</strong> ${esc(req.email || '-')}</p>
            <p><strong>Locatie:</strong> ${esc(req.location || '-')}</p>
            <p>${esc(req.message || '')}</p>
            <div class="row-actions">
              <a class="small-btn" href="https://wa.me/${esc(req.phone || '')}" target="_blank" rel="noreferrer">WhatsApp</a>
              <button class="small-btn secondary" data-status-request="${esc(req.id)}" data-status="contacted">Contact gehad</button>
              <button class="small-btn secondary" data-status-request="${esc(req.id)}" data-status="closed">Afsluiten</button>
            </div>
          </div>
        `).join('') || '<p>Nog geen aanvragen.</p>'}
      </div>
    </article>
  `;
  panel.querySelectorAll('[data-status-request]').forEach((button) => button.addEventListener('click', async () => {
    await persist('catering_requests', 'update', { status: button.dataset.status }, button.dataset.statusRequest);
  }));
}

function renderSettings() {
  const b = state.business;
  const panel = byId('tab-settings');
  panel.innerHTML = `
    <article class="admin-card">
      <h2>Foodtruck instellingen</h2>
      <form id="settingsForm" class="form-stack">
        <div class="inline-grid">
          <label>Naam <input name="name" required value="${esc(b.name)}" /></label>
          <label>Slug <input name="slug" required value="${esc(b.slug)}" /></label>
        </div>
        <label>Tagline <input name="tagline" value="${esc(b.tagline || '')}" /></label>
        <label>Beschrijving <textarea name="description" rows="3">${esc(b.description || '')}</textarea></label>
        <div class="inline-grid">
          <label>WhatsApp nummer <input name="whatsapp" value="${esc(b.whatsapp || '')}" placeholder="31612345678" /></label>
          <label>E-mail <input name="email" type="email" value="${esc(b.email || '')}" /></label>
        </div>
        <div class="inline-grid">
          <label>Locatietitel <input name="location_title" value="${esc(b.location_title || '')}" /></label>
          <label>Adres <input name="location_address" value="${esc(b.location_address || '')}" /></label>
        </div>
        <label>Google Maps link <input name="location_maps_url" value="${esc(b.location_maps_url || '')}" /></label>
        <div class="inline-grid">
          <label>Status <input name="open_status" value="${esc(b.open_status || '')}" placeholder="Vandaag open" /></label>
          <label>Statusnotitie <input name="status_note" value="${esc(b.status_note || '')}" /></label>
        </div>
        <label>Volgend event / mededeling <input name="next_event_note" value="${esc(b.next_event_note || '')}" /></label>
        <label>Openingstijden <textarea name="business_hours" rows="7">${esc(b.business_hours || '')}</textarea></label>
        <div class="inline-grid">
          <label>Primaire kleur <input name="color_primary" type="color" value="${esc(b.color_primary || '#ff6b35')}" /></label>
          <label>Accentkleur <input name="color_accent" type="color" value="${esc(b.color_accent || '#2ec4b6')}" /></label>
        </div>
        <label>Logo URL <input name="logo_url" value="${esc(b.logo_url || '')}" /></label>
        <button class="btn primary" type="submit">Instellingen opslaan</button>
      </form>
    </article>
  `;
  panel.querySelector('#settingsForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    await persist('businesses', 'update', payload, b.id);
  });
}

function setTab(name) {
  document.querySelectorAll('.tab-button').forEach((button) => button.classList.toggle('active', button.dataset.tab === name));
  document.querySelectorAll('.admin-tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${name}`));
}

function bindUi() {
  byId('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    byId('loginFeedback').textContent = 'Inloggen...';
    const fd = new FormData(event.currentTarget);
    try {
      await login(fd.get('email'), fd.get('password'));
      byId('loginFeedback').textContent = '';
    } catch (error) {
      byId('loginFeedback').textContent = error.message;
    }
  });
  byId('demoLoginButton').addEventListener('click', async () => login('demo@foodtruckcontrol.nl', 'demo'));
  byId('logoutButton').addEventListener('click', logout);
  byId('refreshButton').addEventListener('click', async () => { await loadAll(); renderAll(); });
  document.querySelectorAll('.tab-button').forEach((button) => button.addEventListener('click', () => setTab(button.dataset.tab)));
}

async function init() {
  bindUi();
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      state.user = data.session.user;
      state.isDemo = false;
      try { await loadAll(); showAdmin(); } catch (error) { byId('loginFeedback').textContent = error.message; }
    }
  }
}

init();
