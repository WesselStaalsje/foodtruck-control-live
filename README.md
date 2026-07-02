# MarktMenu Live - Gevulde Safe Demo

Algemene gevulde demo voor foodtrucks, marktkramen en cateraars.

Deze versie:
- bevat fictieve producten, prijzen, categorieën en locaties;
- bevat een fictieve demo-aanvraag;
- gebruikt geen echte bedrijfsnaam;
- gebruikt geen echt bedrijfslogo;
- gebruikt geen echte contactgegevens;
- gebruikt geen echte standplaatsen;
- draait in `DEMO_MODE`;
- haalt geen Supabase-data op;
- gebruikt lokale demo-data in de browser;
- admin login: pincode `2468`.

Belangrijk:
- Deze versie gebruikt lokale browseropslag met key `marktmenu-live-state-v3-filled`.
- Daardoor wordt oude lege demo-data niet opnieuw gebruikt.
- Is de pagina toch leeg? Wis sitegegevens/localStorage of open in incognito.

Controle na deploy:
- `/app.js` begint met `/* safe-demo-filled-v1 */`
- `/styles.css` bevat `safe-demo-filled-v1`
- `/config.js` heeft `DEMO_MODE: true`

Gebruik deze ZIP als veilige pitchdemo.
