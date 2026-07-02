# Foodtruck Control Live

Operationele webapp voor foodtrucks en cateraars.

Deze repo is bewust **no-build** gemaakt. Daardoor werkt hij op Vercel, Netlify en elke statische host zonder `npm install`, zonder Vite en zonder build-errors.

## Wat zit erin?

### Publieke QR-menukaart

Bestand: `index.html`

De klant ziet:

- live menu
- prijzen
- categorieën
- allergenen/labels
- uitverkocht-status
- actuele locatie
- openingstijden
- WhatsApp-knop
- cateringaanvraagformulier

### Beheeromgeving

Bestand: `admin.html`

De foodtruck/cateraar kan beheren:

- menu-items toevoegen
- prijzen wijzigen
- item op uitverkocht zetten
- items verbergen/tonen
- categorieën toevoegen
- cateringaanvragen bekijken
- locatie/status/openingstijden wijzigen
- kleuren en basisgegevens aanpassen

De beheeromgeving wordt niet gelinkt op de publieke pagina. Gebruik zelf de directe beheerlink:

```txt
https://jouwdomein.nl/admin.html
```

De publieke QR-code linkt gewoon naar:

```txt
https://jouwdomein.nl/?truck=bites-on-wheels
```

## Bestanden

```txt
assets/logo.svg                  app-icoon/logo
index.html                       publieke QR-menukaart
admin.html                       beheeromgeving
styles.css                       volledige styling
app.js                           publieke app-logica
admin.js                         beheerlogica
config.js                        live/demo configuratie
config.example.js                voorbeeldconfiguratie
manifest.webmanifest             PWA instellingen
service-worker.js                basis offline/cache
vercel.json                      Vercel no-build config
netlify.toml                     Netlify no-build config
supabase/schema.sql              database + RLS policies
supabase/seed.sql                demo-data voor Supabase
README.md                        uitleg
```

## Eerst testen zonder Supabase

Open `index.html` of deploy direct naar Vercel/Netlify.

Standaard staat in `config.js`:

```js
window.FOODTRUCK_CONTROL_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  demoMode: true,
  defaultTruckSlug: "bites-on-wheels",
  adminPath: "admin.html"
};
```

In demo mode werkt de app met browseropslag (`localStorage`).

Open het dashboard:

```txt
/admin.html
```

Klik op:

```txt
Demo-dashboard openen
```

Wijzig menu-items en open daarna de publieke pagina opnieuw. Je ziet de wijzigingen direct zolang je dezelfde browser gebruikt.

## Live operationeel maken met Supabase

### 1. Maak een Supabase project aan

Ga naar Supabase en maak een nieuw project.

### 2. Run het schema

Open Supabase → SQL Editor → plak de inhoud van:

```txt
supabase/schema.sql
```

Run het script.

### 3. Voeg demo-data toe

Open daarna:

```txt
supabase/seed.sql
```

Run het grootste deel van het seed-script. Laat de laatste `business_users`-regel nog uitcommentarieerd totdat je een gebruiker hebt.

### 4. Maak een beheerder aan

Ga naar Supabase → Authentication → Users → Add user.

Maak bijvoorbeeld aan:

```txt
beheer@foodtruck.nl
```

Kopieer daarna het `user_id` van die gebruiker.

### 5. Koppel de beheerder aan de foodtruck

Run in SQL Editor:

```sql
insert into public.business_users (business_id, user_id, role)
select id, 'PLAK_HIER_AUTH_USER_ID'::uuid, 'owner'
from public.businesses
where slug = 'bites-on-wheels';
```

### 6. Vul Supabase gegevens in

Ga naar Supabase → Project Settings → API.

Kopieer:

- Project URL
- anon public key

Pas `config.js` aan:

```js
window.FOODTRUCK_CONTROL_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
  demoMode: false,
  defaultTruckSlug: "bites-on-wheels",
  adminPath: "admin.html"
};
```

Commit/push opnieuw.

## Deployen op Vercel

Deze repo heeft geen build nodig.

Gebruik in Vercel:

```txt
Framework Preset: Other
Install Command: echo "Skipping install"
Build Command: echo "No build needed"
Output Directory: .
```

De `vercel.json` forceert dit ook al.

## Deployen op Netlify

Gebruik:

```txt
Build command: echo 'No build needed'
Publish directory: .
```

De `netlify.toml` staat al klaar.

## Productstructuur voor klanten

Aanbevolen setup:

```txt
Publieke pagina:
https://jouwdomein.nl/?truck=klant-slug

Beheer:
https://jouwdomein.nl/admin.html
```

Bij meerdere foodtrucks maak je per klant een rij in `businesses` met eigen `slug`. De QR-code bevat dan die slug.

Voorbeeld:

```txt
https://jouwdomein.nl/?truck=burger-bus-brabant
https://jouwdomein.nl/?truck=taco-truck-eindhoven
```

## Belangrijk over veiligheid

De publieke Supabase anon key mag in frontend-code staan. De beveiliging komt uit Row Level Security in `supabase/schema.sql`.

De klant kan:

- geen beheerknop zien op de publieke pagina
- geen menu aanpassen zonder login
- geen aanvragen bekijken zonder gekoppelde gebruiker

De beheerlink is niet geheim als enige beveiliging. De echte beveiliging is Supabase Auth + RLS.

## Aanpassen per klant

In de beheeromgeving kun je aanpassen:

- naam
- slug
- tagline
- beschrijving
- WhatsApp nummer
- e-mail
- locatie
- openingstijden
- kleuren
- logo URL
- menu-items
- categorieën

Voor logo's kun je eerst externe afbeeldingslinks gebruiken. Later kun je Supabase Storage toevoegen.

## Volgende verbeteringen

Logische uitbreidingen:

- foto uploaden via Supabase Storage
- meerdere foodtrucks per gebruiker
- QR-code generator
- bestellingen/pre-orders
- export van cateringaanvragen
- e-mailnotificatie bij aanvraag
- Stripe/ Mollie voor abonnementen
- eigen domein per klant

## Verkooppositionering

Niet verkopen als “website”.

Verkoop als:

> Live QR-menu + catering-aanvraagtool voor foodtrucks en cateraars. De ondernemer beheert zelf menu, prijzen, uitverkochte items en locatie zonder technische kennis.

Startaanbod:

```txt
Setup: €299
Beheer/hosting: €19 p/m
```

Of eenvoudiger:

```txt
Eenmalig: €499
```
