# Andy Segment Display Card
A Home Assistant Lovelace custom card that renders an entity state in a classic digital display style:

- 7-segment mode for numeric values (calculator/thermometer look)
- 5x7 dot-matrix mode for text states

The card includes a visual editor (entity picker + styling options) and is designed to look great on dashboards where you want a clear, “LCD-style” readout.

Features:
- Select any entity (standard Home Assistant entity picker)
- Two render styles:
-- 7-segment (digits): digits, minus, decimal dot
-- Dot-matrix (text): renders text in a 5x7 matrix font

- Styling options:
-- Text color and background color
-- Optional “unused segments” (faint segments) in 7-segment mode
-- Dot ON/OFF colors in matrix mode (ON can inherit text color)

- Formatting:
-- Optional decimals for numeric states
-- Optional unit display (e.g. °C)
-- Max characters to display

- Safe multi-card usage:
- Instance-scoped CSS prevents multiple cards from affecting each other

Installation (HACS)
1. Install the repository in HACS (Dashboard/Plugin).
2. Ensure the Lovelace resource is added (HACS usually adds it automatically).
3. Add the card to your dashboard via the card picker: Andy Segment Display Card.

Resource URL is typically:
/hacsfiles/andy-segment-display-card/andy-segment-display-card.js?hacstag=...

Manual Installation:
Copy andy-segment-display-card.js to:
/config/www/andy-segment-display-card.js
Settings → Dashboards → Resources → Add:
URL: /local/andy-segment-display-card.js
Type: JavaScript Module

Hard refresh the browser.

Configuration
All options are available in the visual editor. YAML mode is also supported.
