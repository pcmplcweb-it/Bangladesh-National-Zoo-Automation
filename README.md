# Bangladesh National Zoo — Interactive Website

A React website for the Bangladesh National Zoo (Mirpur, Dhaka). The visitor "enters" the zoo through an animated main gate and lands directly on a comprehensive interactive map of the zoo grounds, then explores the rest of the site through the menu.

## Features

- **Gate entrance** – animated welcome scene; the gates swing open and the camera flies into the zoo (optional synthesised nature-sound ambience).
- **Interactive illustrated map** – pan, scroll/pinch zoom, 23 enclosures and facilities with info cards, animated animals, lakes, birds, search and category filters, day/night mode, full-screen.
- **Satellite view** – real imagery (Esri) centred on the zoo's Google Maps location, with everything outside the zoo dimmed.
- **Virtual walk** – a guided loop from the main gate through 17 stops; the camera follows the walker and each stop opens its info card. Pause, skip, resume.
- **Menu pages** – Home, Zoo Map, Virtual Tour, Animals (filter + detail modal), Plan Your Visit (hours, ticket calculator & e-ticket, directions, rules), Facilities, About, Contact (form + embedded Google Map).
- Fully responsive (desktop, tablet, mobile), Bangla + English names.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

## Stack

React 19 · Vite · react-router-dom · Leaflet / react-leaflet (satellite view) · hand-drawn SVG map · Web Audio API ambience.

## Notes

- Enclosure positions are an illustrative layout of the zoo, geo-referenced approximately to the real grounds for the satellite overlay. Edit `src/data/zoo.js` to move pins, add zones/animals, change ticket prices, feeding times or contact details.
- Ticket booking and the contact form are front-end demos (no backend yet).
