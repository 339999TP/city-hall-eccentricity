# City Hall Eccentricity — Claude Code Brief

## What this project is

An interactive web app showing how far city halls, parliaments, and leaders'
residences sit from the centre of their cities — measured five different ways.
The user clicks a bar in a ranked chart; a Leaflet map opens showing the two
locations with a line between them, overlaid on a real dark map.

This project was designed and all data computed in a Claude.ai conversation.
The working HTML prototype is referenced throughout this brief — use it as the
canonical reference for layout, data, and behaviour. Your job is to rebuild it
as a clean React + Vite app and deploy it to GitHub Pages.

---

## GitHub deployment — do this at the end

Repository: `city-hall-eccentricity`  
Owner: **[ASK USER FOR THEIR GITHUB USERNAME]**  
Token: **[USER WILL PROVIDE A FRESH TOKEN — do not use any token from a 
previous conversation; ask the user to generate a new one with `repo` scope]**

### Steps to deploy after the app is working locally

```bash
# 1. Install gh-pages
npm install gh-pages --save-dev

# 2. Add to package.json:
#    "homepage": "https://USERNAME.github.io/city-hall-eccentricity"
#    "predeploy": "npm run build"
#    "deploy": "gh-pages -d dist"

# 3. In vite.config.js set base:
#    base: '/city-hall-eccentricity/'

# 4. Create the GitHub repo via API (Claude Code can do this):
curl -X POST https://api.github.com/user/repos \
  -H "Authorization: token TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"city-hall-eccentricity","description":"How eccentric is your city hall?","private":false}'

# 5. Add remote and deploy:
git init && git add . && git commit -m "Initial commit"
git remote add origin https://USERNAME:TOKEN@github.com/USERNAME/city-hall-eccentricity.git
git push -u origin main
npm run deploy

# 6. Enable GitHub Pages via API:
curl -X POST https://api.github.com/repos/USERNAME/city-hall-eccentricity/pages \
  -H "Authorization: token TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}'
```

Live URL after deploy: `https://USERNAME.github.io/city-hall-eccentricity`

---

## What already exists (do not recompute)

All analysis is done. The data below is final and verified. Do not recalculate
eccentricities, centroid positions, or distances. Just build the UI.

---

## The five modes

Each mode measures distance between two points, normalised by the equivalent
radius of the city's administrative boundary:

```
eccentricity = haversine(point_A, point_B) / sqrt(admin_area_km2 / π)
```

| Tab label | Point A (reference, hollow marker) | Point B (city hall, solid marker) | Cities |
|-----------|-----------------------------------|-----------------------------------|--------|
| Geometric | Geometric boundary centroid | City hall | All |
| Pop-Weighted | Population-weighted centroid | City hall | All |
| Zero Point | Official/symbolic city centre | City hall | All |
| Parliament | Parliament building | City hall | Capitals only |
| Leader's Seat | Head of govt residence | City hall | Capitals only |

**Default tab on load: Pop-Weighted (index 1)**

---

## Explainer strip — REQUIRED

Directly below the title, before the mode tabs, render a horizontal strip of
three info panels. This is a key part of the UI — do not skip it.

```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ WHAT IS ECCENTRICITY?   │ FORMULA                 │ CURRENT MEASURE  ← live │
│ The metric              │ Distance ÷ radius       │ [updates per tab]        │
│ How far the city hall   │ Eccentricity = straight- │ [see copy below]         │
│ sits from the centre,   │ line distance between    │                          │
│ as a fraction of city   │ the two points, divided  │                          │
│ size. 0 = exactly       │ by the equivalent radius │                          │
│ central; 0.5 = halfway  │ of the administrative    │                          │
│ to the edge; 1.0 = at   │ boundary (radius of a    │                          │
│ the boundary.           │ circle with same area).  │                          │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

The third panel ("Current Measure") updates its title and body when the user
switches mode tabs. Use this copy for each mode:

```javascript
const MODE_EXPLAINERS = {
  geo: {
    title: "Geometric centroid",
    body: "The mathematical centre of the administrative boundary polygon — the point that minimises average distance to every point on the border. A clean, objective measure but can be misleading when city boundaries are oddly shaped or include large unpopulated areas."
  },
  pw: {
    title: "Population-weighted centroid",
    body: "The average location of all residents, weighted by how many people live in each district. The most meaningful 'centre' — it represents where the population actually is, not just the geometric middle of the boundary. Computed from official census district data."
  },
  zero: {
    title: "Official zero point",
    body: "The city's official or conventional symbolic centre — typically the km-0 distance marker or the main civic square. Examples: Charing Cross (London), Puerta del Sol (Madrid), Notre-Dame (Paris), Nihonbashi (Tokyo). The most human and historically legible measure of centrality."
  },
  parl: {
    title: "Parliament building",
    body: "How far is the city hall from the national parliament? This measures the separation between municipal and national government within the capital — a proxy for whether civic and state power share the same geography."
  },
  lead: {
    title: "Head of government's residence",
    body: "How far is city hall from where the prime minister or president works? Madrid's Moncloa is 4 km from Cibeles; Seoul's Yongsan office is 4 km from City Hall; London's Downing Street is just 1 km from the old City Hall — and 10 km from the new one."
  }
};
```

Style: three equal-width panels, dark background, thin borders between them,
rounded corners on the outer container. The active panel (third) should be
very subtly highlighted. Small all-caps label above each panel title.

---

## Data sources block — REQUIRED

Below the country colour legend in the chart panel, render a data sources
section. Use this exact copy:

```
DATA SOURCES

Pop-weighted centroids — ONS Census 2021 (UK); INSEE RP 2021 (France);
Zensus 2022 (Germany); Statistik Austria 2023; Statistics Korea 2020;
Tokyo Metropolitan Statistics 2020; US Census 2020; Statistics Canada 2021;
GUS 2021 (Poland); ISTAT 2021 (Italy); INE Padrón 2021 (Spain);
Statbel 2022 (Belgium); Oslo Statistikk 2023; ČSÚ 2021 (Czech Republic);
Rosstat 2021 (Russia)

Geometric centroids — Natural Earth 1:10m Admin-1 boundary polygons
(naturalearthdata.com)

Administrative areas — Official national statistics offices

Building coordinates — OpenStreetMap / Wikidata

Map tiles — © OpenStreetMap contributors, © CARTO
```

Style: very small text, dim colour, same left-indent as the chart bars.

---

## Full city dataset

```javascript
const CITIES = [
  {
    name: "London (new)", country: "UK", isCapital: true, adminAreaKm2: 1572,
    hall:       { lat: 51.5087,  lon:  0.0197,   name: "City Hall, Royal Docks (2022–)" },
    geo:        { lat: 51.4972,  lon: -0.1003,   name: "Geometric centroid" },
    pw:         { lat: 51.50701, lon: -0.11406,  name: "Pop-weighted centroid" },
    zero:       { lat: 51.5074,  lon: -0.1278,   name: "Charing Cross" },
    parliament: { lat: 51.4994,  lon: -0.1247,   name: "Palace of Westminster" },
    leader:     { lat: 51.5034,  lon: -0.1276,   name: "10 Downing Street" },
  },
  {
    name: "London (old)", country: "UK", isCapital: true, adminAreaKm2: 1572,
    hall:       { lat: 51.5054,  lon: -0.0785,   name: "City Hall, More London (2002–2021)" },
    geo:        { lat: 51.4972,  lon: -0.1003,   name: "Geometric centroid" },
    pw:         { lat: 51.50701, lon: -0.11406,  name: "Pop-weighted centroid" },
    zero:       { lat: 51.5074,  lon: -0.1278,   name: "Charing Cross" },
    parliament: { lat: 51.4994,  lon: -0.1247,   name: "Palace of Westminster" },
    leader:     { lat: 51.5034,  lon: -0.1276,   name: "10 Downing Street" },
  },
  {
    name: "Paris", country: "France", isCapital: true, adminAreaKm2: 105,
    hall:       { lat: 48.8559,  lon:  2.3525,   name: "Hôtel de Ville" },
    geo:        { lat: 48.85732, lon:  2.34704,  name: "Geometric centroid" },
    pw:         { lat: 48.86049, lon:  2.34426,  name: "Pop-weighted centroid" },
    zero:       { lat: 48.8530,  lon:  2.3499,   name: "Notre-Dame Km Zéro" },
    parliament: { lat: 48.8634,  lon:  2.3182,   name: "Assemblée Nationale" },
    leader:     { lat: 48.8713,  lon:  2.3166,   name: "Élysée Palace" },
  },
  {
    name: "Berlin", country: "Germany", isCapital: true, adminAreaKm2: 892,
    hall:       { lat: 52.5163,  lon: 13.4083,   name: "Rotes Rathaus" },
    geo:        { lat: 52.50021, lon: 13.40449,  name: "Geometric centroid" },
    pw:         { lat: 52.51056, lon: 13.40339,  name: "Pop-weighted centroid" },
    zero:       { lat: 52.5163,  lon: 13.3777,   name: "Brandenburg Gate" },
    parliament: { lat: 52.5186,  lon: 13.3762,   name: "Bundestag (Reichstag)" },
    leader:     { lat: 52.5207,  lon: 13.3688,   name: "Bundeskanzleramt" },
  },
  {
    name: "Vienna", country: "Austria", isCapital: true, adminAreaKm2: 415,
    hall:       { lat: 48.2107,  lon: 16.3561,   name: "Wiener Rathaus" },
    geo:        { lat: 48.22319, lon: 16.38414,  name: "Geometric centroid" },
    pw:         { lat: 48.20312, lon: 16.36649,  name: "Pop-weighted centroid" },
    zero:       { lat: 48.2082,  lon: 16.3738,   name: "Stephansdom" },
    parliament: { lat: 48.2048,  lon: 16.3571,   name: "Parlament" },
    leader:     { lat: 48.2082,  lon: 16.3581,   name: "Bundeskanzleramt" },
  },
  {
    name: "Brussels", country: "Belgium", isCapital: true, adminAreaKm2: 162,
    hall:       { lat: 50.8467,  lon:  4.3517,   name: "Hôtel de Ville (Grand Place)" },
    geo:        { lat: 50.8367,  lon:  4.37041,  name: "Geometric centroid" },
    pw:         { lat: 50.84279, lon:  4.36113,  name: "Pop-weighted centroid" },
    zero:       { lat: 50.8467,  lon:  4.3525,   name: "Grand Place" },
    parliament: { lat: 50.8473,  lon:  4.3653,   name: "Palais de la Nation" },
    leader:     { lat: 50.8459,  lon:  4.3681,   name: "Wetstraat 16 (Prime Minister)" },
  },
  {
    name: "Oslo", country: "Norway", isCapital: true, adminAreaKm2: 480,
    hall:       { lat: 59.9082,  lon: 10.7306,   name: "Oslo Rådhus" },
    geo:        { lat: 59.96925, lon: 10.65234,  name: "Geometric centroid" },
    pw:         { lat: 59.92074, lon: 10.76887,  name: "Pop-weighted centroid" },
    zero:       { lat: 59.9127,  lon: 10.7461,   name: "Oslo Cathedral" },
    parliament: { lat: 59.9130,  lon: 10.7387,   name: "Stortinget" },
    leader:     { lat: 59.9134,  lon: 10.7395,   name: "Statsministerens kontor" },
  },
  {
    name: "Madrid", country: "Spain", isCapital: true, adminAreaKm2: 604,
    hall:       { lat: 40.4196,  lon: -3.6925,   name: "Palacio de Cibeles" },
    geo:        { lat: 40.42276, lon: -3.67492,  name: "Geometric centroid" },
    pw:         { lat: 40.42318, lon: -3.68334,  name: "Pop-weighted centroid" },
    zero:       { lat: 40.4169,  lon: -3.7035,   name: "Puerta del Sol Km 0" },
    parliament: { lat: 40.4159,  lon: -3.6976,   name: "Congreso de los Diputados" },
    leader:     { lat: 40.4478,  lon: -3.7214,   name: "Palacio de la Moncloa" },
  },
  {
    name: "Barcelona", country: "Spain", isCapital: false, adminAreaKm2: 101,
    hall:       { lat: 41.3833,  lon:  2.1769,   name: "Ajuntament de Barcelona" },
    geo:        { lat: 41.40239, lon:  2.1632,   name: "Geometric centroid" },
    pw:         { lat: 41.40312, lon:  2.16595,  name: "Pop-weighted centroid" },
    zero:       { lat: 41.3870,  lon:  2.1700,   name: "Plaça de Catalunya" },
    parliament: null, leader: null,
  },
  {
    name: "Moscow", country: "Russia", isCapital: true, adminAreaKm2: 2511,
    hall:       { lat: 55.7558,  lon: 37.6176,   name: "Moscow Government (Tverskaya)" },
    geo:        { lat: 55.49923, lon: 37.3626,   name: "Geometric centroid" },
    pw:         { lat: 55.7367,  lon: 37.59139,  name: "Pop-weighted centroid" },
    zero:       { lat: 55.7539,  lon: 37.6208,   name: "Zero Km Marker (Manezhnaya)" },
    parliament: { lat: 55.7554,  lon: 37.6194,   name: "State Duma" },
    leader:     { lat: 55.7520,  lon: 37.6175,   name: "Kremlin" },
  },
  {
    name: "Seoul", country: "South Korea", isCapital: true, adminAreaKm2: 605,
    hall:       { lat: 37.5659,  lon: 126.9780,  name: "Seoul Metropolitan Government" },
    geo:        { lat: 37.53839, lon: 127.0073,  name: "Geometric centroid" },
    pw:         { lat: 37.55349, lon: 126.99136, name: "Pop-weighted centroid" },
    zero:       { lat: 37.5696,  lon: 126.9786,  name: "Gwanghwamun Gate" },
    parliament: { lat: 37.5322,  lon: 126.9130,  name: "National Assembly (Yeouido)" },
    leader:     { lat: 37.5232,  lon: 126.9761,  name: "Yongsan Presidential Office" },
  },
  {
    name: "Tokyo", country: "Japan", isCapital: true, adminAreaKm2: 622,
    hall:       { lat: 35.6894,  lon: 139.6917,  name: "Tokyo Metropolitan Govt (Shinjuku)" },
    geo:        { lat: 35.6942,  lon: 139.74105, name: "Geometric centroid" },
    pw:         { lat: 35.69212, lon: 139.73524, name: "Pop-weighted centroid" },
    zero:       { lat: 35.6812,  lon: 139.7740,  name: "Nihonbashi (Km 0)" },
    parliament: { lat: 35.6760,  lon: 139.7437,  name: "National Diet Building" },
    leader:     { lat: 35.6737,  lon: 139.7420,  name: "Kantei (PM's Residence)" },
  },
  {
    name: "New York", country: "USA", isCapital: false, adminAreaKm2: 783,
    hall:       { lat: 40.7128,  lon: -74.0059,  name: "New York City Hall" },
    geo:        { lat: 40.71714, lon: -73.94614, name: "Geometric centroid" },
    pw:         { lat: 40.72518, lon: -73.90815, name: "Pop-weighted centroid" },
    zero:       { lat: 40.7580,  lon: -73.9855,  name: "Times Square" },
    parliament: null, leader: null,
  },
  {
    name: "Chicago", country: "USA", isCapital: false, adminAreaKm2: 589,
    hall:       { lat: 41.8831,  lon: -87.6320,  name: "Chicago City Hall" },
    geo:        { lat: 41.85752, lon: -87.68022, name: "Geometric centroid" },
    pw:         { lat: 41.86601, lon: -87.68737, name: "Pop-weighted centroid" },
    zero:       { lat: 41.8827,  lon: -87.6279,  name: "State & Madison (0,0)" },
    parliament: null, leader: null,
  },
  {
    name: "Los Angeles", country: "USA", isCapital: false, adminAreaKm2: 1302,
    hall:       { lat: 34.0537,  lon: -118.2428, name: "Los Angeles City Hall" },
    geo:        { lat: 34.01729, lon: -118.32614, name: "Geometric centroid" },
    pw:         { lat: 34.0330,  lon: -118.31727, name: "Pop-weighted centroid" },
    zero:       { lat: 34.0522,  lon: -118.2437, name: "1st & Main (address zero)" },
    parliament: null, leader: null,
  },
  {
    name: "San Francisco", country: "USA", isCapital: false, adminAreaKm2: 121,
    hall:       { lat: 37.7793,  lon: -122.4193, name: "San Francisco City Hall" },
    geo:        { lat: 37.76227, lon: -122.43736, name: "Geometric centroid" },
    pw:         { lat: 37.76194, lon: -122.43729, name: "Pop-weighted centroid" },
    zero:       { lat: 37.7841,  lon: -122.4078, name: "Market & Powell" },
    parliament: null, leader: null,
  },
  {
    name: "Washington DC", country: "USA", isCapital: true, adminAreaKm2: 177,
    hall:       { lat: 38.9072,  lon: -77.0369,  name: "John A. Wilson Building" },
    geo:        { lat: 38.90686, lon: -77.01454, name: "Geometric centroid" },
    pw:         { lat: 38.90686, lon: -77.01436, name: "Pop-weighted centroid" },
    zero:       { lat: 38.8897,  lon: -77.0089,  name: "US Capitol (DC grid zero)" },
    parliament: { lat: 38.8897,  lon: -77.0089,  name: "US Capitol" },
    leader:     { lat: 38.8977,  lon: -77.0366,  name: "White House" },
  },
  {
    name: "Toronto", country: "Canada", isCapital: false, adminAreaKm2: 630,
    hall:       { lat: 43.6532,  lon: -79.3832,  name: "Toronto City Hall" },
    geo:        { lat: 43.70247, lon: -79.38915, name: "Geometric centroid" },
    pw:         { lat: 43.71488, lon: -79.37406, name: "Pop-weighted centroid" },
    zero:       { lat: 43.6561,  lon: -79.3802,  name: "Yonge & Dundas Square" },
    parliament: null, leader: null,
  },
  {
    name: "Hamburg", country: "Germany", isCapital: false, adminAreaKm2: 755,
    hall:       { lat: 53.5503,  lon:  9.9991,   name: "Hamburg Rathaus" },
    geo:        { lat: 53.54417, lon: 10.03044,  name: "Geometric centroid" },
    pw:         { lat: 53.55694, lon: 10.02219,  name: "Pop-weighted centroid" },
    zero:       { lat: 53.5498,  lon:  9.9995,   name: "Rathaus / Binnenalster" },
    parliament: null, leader: null,
  },
  {
    name: "Munich", country: "Germany", isCapital: false, adminAreaKm2: 311,
    hall:       { lat: 48.1374,  lon: 11.5755,   name: "Neues Rathaus" },
    geo:        { lat: 48.13744, lon: 11.56545,  name: "Geometric centroid" },
    pw:         { lat: 48.13795, lon: 11.56466,  name: "Pop-weighted centroid" },
    zero:       { lat: 48.1373,  lon: 11.5754,   name: "Marienplatz" },
    parliament: null, leader: null,
  },
  {
    name: "Amsterdam", country: "Netherlands", isCapital: false, adminAreaKm2: 219,
    hall:       { lat: 52.3728,  lon:  4.8936,   name: "Stadhuis Amsterdam" },
    geo:        { lat: 52.36116, lon:  4.9009,   name: "Geometric centroid" },
    pw:         { lat: 52.36255, lon:  4.89537,  name: "Pop-weighted centroid" },
    zero:       { lat: 52.3731,  lon:  4.8932,   name: "Dam Square" },
    parliament: null, leader: null,
  },
  {
    name: "Zurich", country: "Switzerland", isCapital: false, adminAreaKm2: 88,
    hall:       { lat: 47.3769,  lon:  8.5417,   name: "Stadthaus Zürich" },
    geo:        { lat: 47.38412, lon:  8.53402,  name: "Geometric centroid" },
    pw:         { lat: 47.38875, lon:  8.53010,  name: "Pop-weighted centroid" },
    zero:       { lat: 47.3686,  lon:  8.5392,   name: "Paradeplatz" },
    parliament: null, leader: null,
  },
  {
    name: "Warsaw", country: "Poland", isCapital: true, adminAreaKm2: 517,
    hall:       { lat: 52.2297,  lon: 21.0122,   name: "Warsaw City Hall (Plac Bankowy)" },
    geo:        { lat: 52.22696, lon: 21.02421,  name: "Geometric centroid" },
    pw:         { lat: 52.23031, lon: 21.01757,  name: "Pop-weighted centroid" },
    zero:       { lat: 52.2477,  lon: 21.0122,   name: "Castle Square" },
    parliament: { lat: 52.2208,  lon: 21.0209,   name: "Sejm" },
    leader:     { lat: 52.2232,  lon: 21.0218,   name: "Kancelaria Prezesa Rady Ministrów" },
  },
  {
    name: "Prague", country: "Czech Republic", isCapital: true, adminAreaKm2: 496,
    hall:       { lat: 50.0875,  lon: 14.4213,   name: "New Town Hall (Mariánské náměstí)" },
    geo:        { lat: 50.06399, lon: 14.45296,  name: "Geometric centroid" },
    pw:         { lat: 50.07119, lon: 14.45061,  name: "Pop-weighted centroid" },
    zero:       { lat: 50.0875,  lon: 14.4210,   name: "Old Town Square" },
    parliament: { lat: 50.0882,  lon: 14.4020,   name: "Chamber of Deputies" },
    leader:     { lat: 50.0932,  lon: 14.4051,   name: "Strakova Akademie (PM)" },
  },
  {
    name: "Rome", country: "Italy", isCapital: true, adminAreaKm2: 1285,
    hall:       { lat: 41.8934,  lon: 12.4829,   name: "Palazzo Senatorio (Campidoglio)" },
    geo:        { lat: 41.87777, lon: 12.48482,  name: "Geometric centroid" },
    pw:         { lat: 41.87565, lon: 12.49399,  name: "Pop-weighted centroid" },
    zero:       { lat: 41.8956,  lon: 12.4824,   name: "Piazza Venezia (Km 0)" },
    parliament: { lat: 41.9000,  lon: 12.4794,   name: "Camera dei Deputati" },
    leader:     { lat: 41.9000,  lon: 12.4799,   name: "Palazzo Chigi (PM)" },
  },
];
```

---

## Modes config

```javascript
const MODES = [
  { id:"geo",  label:"Geometric",    desc:"How far is city hall from the geometric centre of the boundary?",
    getA:c=>c.geo,        getB:c=>c.hall, aLabel:"Geometric centroid",    bLabel:"City hall",
    aColor:"#A78BFA", bColor:"#F87171", lineColor:"#8B5CF6", capitalsOnly:false },
  { id:"pw",   label:"Pop-Weighted", desc:"How far is city hall from where people actually live?",
    getA:c=>c.pw,         getB:c=>c.hall, aLabel:"Pop-weighted centroid", bLabel:"City hall",
    aColor:"#34D399", bColor:"#F87171", lineColor:"#10B981", capitalsOnly:false },
  { id:"zero", label:"Zero Point",   desc:"How far is city hall from the city's official or symbolic centre?",
    getA:c=>c.zero,       getB:c=>c.hall, aLabel:"Official zero point",   bLabel:"City hall",
    aColor:"#FCD34D", bColor:"#F87171", lineColor:"#F59E0B", capitalsOnly:false },
  { id:"parl", label:"Parliament",   desc:"How far is city hall from parliament? (capitals only)",
    getA:c=>c.parliament, getB:c=>c.hall, aLabel:"Parliament",            bLabel:"City hall",
    aColor:"#60A5FA", bColor:"#F87171", lineColor:"#3B82F6", capitalsOnly:true },
  { id:"lead", label:"Leader's Seat",desc:"How far is city hall from the head of government's seat? (capitals only)",
    getA:c=>c.leader,     getB:c=>c.hall, aLabel:"Head of govt seat",     bLabel:"City hall",
    aColor:"#FB923C", bColor:"#F87171", lineColor:"#F97316", capitalsOnly:true },
];

// Default on load: index 1 (Pop-Weighted)
let modeIdx = 1;
```

---

## Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Title                                                                    │
│ ┌──────────────────┬──────────────────┬──────────────────┐              │
│ │ What is ecc?     │ Formula          │ Current measure ← live          │
│ └──────────────────┴──────────────────┴──────────────────┘              │
│ [Geometric] [Pop-Weighted●] [Zero Point] [Parliament caps] [Leader caps]│
│ ──────────────────────────────────────────────────────────────────────── │
├──────────────────────┬──┬─────────────────────────────────────────────── │
│ Bar chart (scroll)   │▌ │ Leaflet map (dark tiles)                      │
│                      │  │                                               │
│ ── legend ──         │  │ ◯ Reference point                             │
│ ── data sources ──   │  │ ● City hall                                   │
│                      │  │ --- distance line                             │
└──────────────────────┴──┴───────────────────────────────────────────────┘
│ Footer: methodology note                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

Divider between chart and map is **draggable** left/right (min 260px chart,
min 280px map). Chart panel scrolls independently.

---

## Map specification

### Tile layer

```javascript
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors © <a href="https://carto.com">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
}).addTo(map);
```

Fallback if CartoDB is slow: `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png`

### On city selection

1. Clear all previous layers
2. Add hollow ring marker at A (reference point)
3. Add solid circle marker at B (city hall)
4. Add dashed polyline A→B
5. Add permanent tooltip at midpoint showing `{dist.toFixed(1)} km`
6. `fitBounds([A, B], { padding: [70, 70], maxZoom: 15 })`

### Custom markers — use L.divIcon, NOT default pins

```javascript
// A — hollow ring
L.divIcon({
  html: `<div style="width:22px;height:22px;border-radius:50%;
    border:2.5px solid ${mode.aColor};background:${mode.aColor}22;
    box-shadow:0 0 10px ${mode.aColor}55;"></div>`,
  className: '', iconSize: [22,22], iconAnchor: [11,11]
})

// B — solid dot
L.divIcon({
  html: `<div style="width:22px;height:22px;border-radius:50%;
    background:${mode.bColor};box-shadow:0 0 12px ${mode.bColor}77;
    border:2px solid rgba(255,255,255,0.7);"></div>`,
  className: '', iconSize: [22,22], iconAnchor: [11,11]
})
```

### Popups

```javascript
// A popup
`<b style="color:${mode.aColor}">${mode.aLabel}</b><br/>
 <span style="color:#94a3b8">${A.name}</span>`

// B popup
`<b style="color:${mode.bColor}">${mode.bLabel}</b><br/>
 <span style="color:#94a3b8">${B.name}</span><br/>
 <span style="font-family:monospace;color:#64748b">
   ${dist.toFixed(2)} km · ecc ${ecc.toFixed(3)}</span>`
```

### Leaflet dark UI overrides

```css
.leaflet-popup-content-wrapper {
  background: rgba(10,14,26,0.93) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1) !important;
  border-radius: 8px !important;
  color: #e2e8f0 !important;
  font-family: 'DM Sans', sans-serif !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5) !important;
}
.leaflet-popup-tip { background: rgba(10,14,26,0.93) !important; }
.leaflet-control-zoom a { background: #1e293b !important; color: #94a3b8 !important; border-color: #334155 !important; }
.leaflet-control-attribution { background: rgba(10,14,26,0.75) !important; color: #475569 !important; }
```

---

## Bar chart

- Horizontal bars, sorted descending by eccentricity
- City name right-aligned in 136px label column
- Bar colour = country colour (map below); selected city bar = mode.bColor (#F87171)
- Selected bar is taller (13px vs 9px) and full opacity; others are 60% opacity
- Selected bar shows `ecc · dist km` annotation after the value
- Capitals get a small ★ superscript in non-capitals-only modes
- Panel scrolls independently; chart header "eccentricity →" pinned at top

### Country colours

```javascript
const CC = {
  UK: "#F87171", USA: "#60A5FA", Canada: "#818CF8", Germany: "#34D399",
  France: "#FBBF24", Spain: "#F97316", Austria: "#2DD4BF", Switzerland: "#A78BFA",
  Netherlands: "#FB923C", Belgium: "#FCD34D", Norway: "#38BDF8", Poland: "#C084FC",
  "Czech Republic": "#4ADE80", Italy: "#F472B6", Russia: "#94A3B8",
  "South Korea": "#E879F9", Japan: "#FCA5A5",
};
```

---

## Visual design

**Colours:**
- Page background: `#0A0E1A`
- Panel/card bg: `#0D1117`
- Borders: `rgba(255,255,255,0.06)` (subtle), `rgba(255,255,255,0.05)` (very subtle)
- Text primary: `#F8FAFC`
- Text muted: `#6B7280`
- Text dim: `#374151`
- Text very dim: `#1F2937`

**Typography (Google Fonts):**
- `Syne` 700/800 — title, city name in map header
- `DM Sans` 400/500/600 — all body, labels, buttons
- `DM Mono` 400/500 — eccentricity values, distances, data sources

**Eccentricity formula:**
```javascript
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, r = Math.PI / 180;
  const a = Math.sin((lat2-lat1)*r/2)**2 +
    Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin((lon2-lon1)*r/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
const eqRadius = areakm2 => Math.sqrt(areakm2 / Math.PI);
```

---

## Tech stack

- **React + Vite** — `npm create vite@latest city-hall-eccentricity -- --template react`
- **Leaflet + react-leaflet** — `npm install leaflet react-leaflet`
- **gh-pages** — `npm install gh-pages --save-dev`
- Plain CSS or CSS modules — no Tailwind needed
- No TypeScript, no backend, no auth

---

## What NOT to do

- Do not use MapboxGL, Google Maps, or any API-key tile service
- Do not recompute eccentricities — use the dataset exactly as given
- Do not add a backend
- Do not split into multiple pages/routes
- Do not remove the explainer strip or data sources — they are required

---

## Build order

1. Vite + React scaffold
2. Install leaflet, react-leaflet, gh-pages
3. Create `src/data/cities.js` — CITIES array, MODES config, CC colours, MODE_EXPLAINERS
4. Build bar chart component — sorting, colour, selected state
5. Build explainer strip — three panels, third updates on tab change
6. Build Leaflet map component — dark tiles, custom markers, line, tooltip
7. Wire tab switches → chart re-sort + explainer update + map update
8. Add draggable divider
9. Add data sources block below legend
10. Style to spec, test all 5 modes
11. Configure vite.config.js base path, package.json deploy scripts
12. Create GitHub repo, push, deploy to GitHub Pages

---

## Session goal

Working app at `localhost:5173` with all 5 modes, explainer strip, data sources,
dark Leaflet map with real tiles, draggable panel divider — then deployed live
to GitHub Pages.
