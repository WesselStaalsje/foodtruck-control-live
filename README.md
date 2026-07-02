# Vishandel De Beer Live App

Operationele QR-menu en beheerapp voor een vishandel/foodtruck/cateraar.

Deze repo is bewust **no-build** gemaakt:

- geen `npm install`
- geen React/Vite-build
- werkt direct op Vercel en Netlify
- publieke klantkant + aparte beheeromgeving
- demo-mode via browseropslag
- live-mode via Supabase

## Pagina's

| Pagina | Doel |
|---|---|
| `/` | Publieke klant-app / QR-menu |
| `/admin.html` | Beheerscherm voor menu, prijzen, standplaatsen en aanvragen |

## Wat zit erin?

### Publieke klantkant

- mobiel-first QR-menu
- categorieën en zoekfunctie
- prijzen/dagprijs/uitverkocht-status
- standplaatsen
- WhatsApp-knop
- aanvraagformulier voor schotel, reservering of catering
- PWA manifest voor beginscherm op telefoon

### Beheerkant

- login
- statusmelding aanpassen
- menu-item toevoegen/bewerken/verwijderen
- prijzen aanpassen
- item op uitverkocht zetten
- item verbergen/tonen
- standplaatsen beheren
- aanvragen bekijken
- bedrijfsgegevens aanpassen

## Demo-mode

Standaard staat de app in demo-mode.

Open:

```text
/admin.html
```

Pincode:

```text
2468
```

Alles wordt dan opgeslagen in de browser via `localStorage`. Dat is handig voor testen, maar niet voor echte klantproductie.

## Live maken met Supabase

1. Maak een Supabase-project aan.
2. Open Supabase SQL Editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Maak in Supabase Auth een gebruiker aan voor de beheerder.
6. Zoek in Supabase de `auth.users.id` van die gebruiker.
7. Zoek de `businesses.id` van `vishandel-de-beer`.
8. Voeg de beheerder toe:

```sql
insert into public.admin_profiles (user_id, business_id, role)
values ('AUTH_USER_UUID_HIER', 'BUSINESS_UUID_HIER', 'owner');
```

9. Vul `config.js`:

```js
window.APP_CONFIG = {
  DEFAULT_BUSINESS_SLUG: "vishandel-de-beer",
  DEMO_MODE: false,
  SUPABASE_URL: "https://jouw-project.supabase.co",
  SUPABASE_ANON_KEY: "jouw-anon-key",
  ADMIN_PIN: "2468"
};
```

Daarna gebruikt de app de live database.

## Deploy op Vercel

Instellingen:

```text
Framework Preset: Other
Install Command: echo "Skipping install"
Build Command: echo "No build needed"
Output Directory: .
```

`vercel.json` staat al goed ingesteld.

## Deploy op Netlify

Instellingen:

```text
Build command: echo 'No build needed'
Publish directory: .
```

`netlify.toml` staat al goed ingesteld.

## Bestanden

```text
assets/logo.svg
index.html
admin.html
styles.css
app.js
admin.js
data.js
config.js
config.example.js
manifest.webmanifest
service-worker.js
vercel.json
netlify.toml
supabase/schema.sql
supabase/seed.sql
README.md
```

## Repo-naam

Aanbevolen:

```text
vishandel-de-beer-live
```

Of neutraler:

```text
foodtruck-control-vishandel
```

## Let op

Dit is een voorstel/demo op basis van publiek zichtbare bedrijfsinformatie. Gebruik naam, merk, content en contactgegevens alleen commercieel of openbaar namens dit bedrijf als je daarvoor toestemming hebt.


## Logo / favicon

Het logo en favicon staan als vectorbestand in Git:

- `assets/logo.svg`
- `assets/favicon.svg`

Er wordt dus geen losse foto/png gebruikt als basislogo. `index.html`, `admin.html` en `manifest.webmanifest` verwijzen naar deze SVG-bestanden.
