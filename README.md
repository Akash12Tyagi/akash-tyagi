# Lusso di Firenze — concept homepage

Single-page concept homepage (`index.html` + `assets/`) by BEYOUROWN, built to the Lusso di Firenze brand guidelines. Not the live store.

- **Brand system:** Vivid Red `#BD0000`, Black, Warm Off-White `#FAF7F2`, Soft Gray `#E9E9E9`; Lufga (Outfit stands in until Lufga is self-hosted) + Poppins; official logo and photography.
- **3D:** real-time three.js models of all ten products, measured from the product photography: round flask (Amber Nomad, Aura Elegance, Miss Desire, Silver Elite, Royal Velvet), faceted gem (Flora Bella, Vaan Noir), square (Majesty Noir, Rouge Signature) and the carved crystal tumbler (Golden Temptation), with transmissive glass, refracting liquid and printed labels, on a travertine plinth. Drag to turn, click to spritz.
- **Scroll story:** hero → Majesty Noir notes (dark set, notes orbit the opened bottle) → collection (all ten bottles on a travertine turntable) → four brand pillars → Amber Nomad quote → photography → 3D gift box (terracotta coffret whose lid opens on scroll; the three chosen bottles drop in) → CTA.

## Run it locally

Everything (three.js, Lenis, logo, photography) ships in `assets/`, so it runs offline; only the Google Fonts need internet (it falls back to system fonts without).

- **Mac:** double-click `start-mac.command` (first time: right-click → Open, to allow it).
- **Windows:** double-click `start-windows.bat` (needs Python, or Node for the `npx serve` fallback).
- **Linux / any terminal:** `./start.sh`, or `python3 -m http.server 8765` in this folder, then open http://localhost:8765.

It must be served over http (not opened as a file), because the bottle labels are drawn from the logo images.

MRP/discount figures are placeholders until live pricing is supplied.
