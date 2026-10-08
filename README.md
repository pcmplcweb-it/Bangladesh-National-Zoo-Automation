# Bangladesh National Zoo — Interactive Website

A React website for the Bangladesh National Zoo (Mirpur, Dhaka) with a realistic, photo-based design and a **real map** of the zoo grounds.

## Features

- **Realistic entrance** – a full-screen photo of the zoo's real pillar gate; "প্রবেশ করুন / Enter" moves the camera through the arch (optional synthesised nature sounds).
- **Hero in the style of the reference site** – crossfading real zoo photos with a slow zoom and green colour grade, a transparent header, a live "এখন খোলা / Open now" badge (Asia/Dhaka time), a bold Bangla headline, pill buttons, stats and a phone mockup that shows a **live satellite mini-map** of the zoo.
- **Real zoo map** (Leaflet)
  - Satellite imagery (Esri) or street map (OpenStreetMap), with everything outside the zoo dimmed.
  - The zoo's real boundary, North and South lakes, enclosure outlines and internal roads from OpenStreetMap.
  - 40 places pinned at their real coordinates, with search (English/বাংলা), category filters, info cards, real photos, and Google Maps walking directions for each zone.
  - **Virtual walk** along the real roads (34 stops) where the camera follows the walker, with Google 360° Street View at each stop where available.
  - **Google** mode showing Google Maps' own satellite map and labels.
  - "Where am I?" geolocation for visitors inside the zoo, night mode, ambient sound and full screen.
- **Pages** – Home, Zoo Map, Virtual Tour, Animals (real photos where available), Plan Your Visit (hours, ticket calculator and e-ticket, directions, rules), Facilities, About (with photo and map credits), Contact.
- Responsive for desktop, tablet and mobile.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

## Data & credits

| What | Source | Licence |
|---|---|---|
| Zoo boundary, lakes, roads, enclosures (`src/data/zooGeo.js`) | © OpenStreetMap contributors | ODbL 1.0 |
| Zone coordinates (`src/data/zoo.js`) | Google Maps place labels where Google has one (checked against OSM to within ~10 m at the gate, mosque, tiger and rhino); OSM enclosure data elsewhere | — |
| Photos (`public/images`, `src/data/photos.js`) | Wikimedia Commons contributors | CC BY / CC BY-SA (per photo, listed on the About page) |
| Satellite tiles | Esri World Imagery | Esri terms of use |
| Street tiles | tile.openstreetmap.org | [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/) |

Before high-traffic production use, switch the street tiles to a provider with a key (OSM's public tile server is meant for light use) and review Esri's terms.

## Editing content

- `src/data/zoo.js` – zones (name, Bangla name, coordinates, description, residents), tour order, animals, tickets, feeding times, opening hours.
- `src/data/photos.js` – photo list with author and licence.
- Ticket booking and the contact form are front-end only for now (no backend).

## Management system

A separate staff application (online ticketing with payment, gate entry/exit, live dashboard and reports, animal feeding, attendance and leave) lives in [`zoo-management-app/`](zoo-management-app/README.md). It runs on its own: `cd zoo-management-app && npm install && npm run dev`.
