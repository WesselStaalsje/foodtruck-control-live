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

Deze versie gebruikt exact het door de gebruiker aangeleverde icoonbestand als zichtbaar logo en als browser/favicon-bestand. Bestanden:

- `assets/logo.png`
- `assets/favicon.png`
- `assets/favicon.ico`
- `assets/icon-192.png`
- `assets/icon-512.png`


## Slimme standplaats bovenin

De hero-kaart gebruikt nu slimme standplaatslogica:

- huidige dag + huidige tijd binnen een tijdvak = toon die locatie
- anders eerstvolgende locatie later vandaag
- anders eerstvolgende actieve locatie in de week
- meerdere locaties op dezelfde dag worden op tijd gesorteerd
- klik op het kaartje opent Google Maps


## Fix: standplaats van vandaag

De hero-kaart toont nu alleen nog een actieve standplaats van de huidige dag.

Gedrag:
- verborgen locaties (`active = false`) worden genegeerd;
- locaties van andere dagen worden bovenin niet meer als fallback getoond;
- als er vandaag geen actieve standplaats is, staat er netjes dat er vandaag geen actieve locatie is;
- klik op het kaartje opent Google Maps wanneer er wel een actieve locatie is.

Na deploy: doe op je telefoon/laptop een harde refresh of wis sitegegevens als de oude Stiphout-kaart door cache blijft staan.


## Fix: meerdere actieve standplaatsen vandaag

De hero toont nu alle actieve standplaatsen van de huidige dag, niet meer één willekeurige locatie.

Gedrag:
- locaties met `active = false` worden genegeerd;
- alleen locaties van vandaag worden bovenin getoond;
- meerdere locaties tegelijk of later vandaag verschijnen als losse klikbare kaartjes;
- elk kaartje opent zijn eigen Google Maps-link;
- locaties van andere dagen, zoals Stiphout op zaterdag, verschijnen niet op vrijdag.


## Fix: hero gebruikt huidige tijdvak

De hero toont nu alleen actieve standplaatsen die NU binnen het ingevulde tijdsbestek vallen.

Voorbeeld:
- Vrijdag 08:00–12:00 = zichtbaar tussen 08:00 en 12:00.
- Vrijdag 13:00–17:00 = zichtbaar tussen 13:00 en 17:00.
- Zaterdag Stiphout = niet zichtbaar op vrijdag.
- Verborgen locaties = nooit zichtbaar.
- Meerdere locaties met overlappend tijdvak = tegelijk zichtbaar in de hero.


## Fix: hero toont locaties van vandaag

De hero toont nu alle actieve standplaatsen van de huidige dag, inclusief tijden.

Gedrag:
- vrijdag toont alle actieve vrijdaglocaties;
- zaterdag/Stiphout verschijnt dus niet op vrijdag;
- verborgen locaties worden niet getoond;
- meerdere actieve locaties op dezelfde dag verschijnen tegelijk;
- elk locatiekaartje opent de juiste Google Maps-link.


## Hardfix hero locaties

Deze versie vervangt de hero-card hard door een locatieblok.

De hero toont:
- alle actieve locaties van de huidige dag;
- alle tijden per locatie;
- meerdere locaties tegelijk;
- geen verborgen locaties;
- geen locaties van andere dagen;
- klikbaar naar Google Maps.

De service-worker cache is tijdelijk uitgeschakeld zodat Vercel/browser niet steeds oude bestanden blijft tonen.


## Loadfix hero locaties

Deze versie forceert de hero opnieuw te renderen nadat de app-data is geladen.
Als `state.locations` leeg blijft, doet de hero zelf nog een fallback-query op Supabase naar de tabel `locations`.

Daardoor blijft hij niet meer eindeloos hangen op “Locaties ophalen...”.


## Config exact hersteld

`config.js` is opnieuw gezet met exact de Supabase Project URL en anon public key zoals opgegeven.


## Schone hero-locatieversie

`app.js` is opnieuw schoon opgebouwd. De hero gebruikt nu direct `state.locations` uit `store.loadState()`.

Gedrag:
- alle actieve locaties van vandaag worden bovenin getoond;
- tijden staan erbij;
- meerdere locaties tegelijk worden getoond;
- verborgen locaties worden genegeerd;
- locaties van andere dagen worden genegeerd;
- elk kaartje opent Google Maps;
- geen fallback/duplicate hero-code meer.


## Final fix: dag override + Europe/Amsterdam

De hero gebruikt nu:
- `?dag=zaterdag` of `?day=zaterdag` als testoverride;
- anders de huidige dag in `Europe/Amsterdam`.

Voorbeelden:
- `/` toont de echte Nederlandse dag;
- `/?dag=zaterdag` toont zaterdaglocaties;
- `/?dag=vrijdag` toont vrijdaglocaties.

Als `?dag=zaterdag` nog vrijdag toont, staat deze ZIP niet goed op GitHub/Vercel of de browser laadt oude cache.
