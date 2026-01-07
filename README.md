# Andy Segment Display Card
[![Buy Me a Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=☕&slug=andybonde&button_colour=FFDD00&font_colour=000000&outline_colour=000000&coffee_colour=ffffff)](https://buymeacoffee.com/andybonde)

### 7-segment mode (numeric) Dot-matrix mode (text)
![Preview of display](Images/segment-display-card.png)
![Visual editor](Images/segment-display-card-configeditor_1.png)

> **Recommended installation method:** HACS  
> Manual installation is supported but not recommended unless HACS is unavailable.


segment-display-card.png
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



## Installation

### Option A — Install via HACS (published repository)
1. Open **HACS** in Home Assistant.
2. Go to **Frontend**.
3. Search for **Andy segment display**.
4. Open the card and click **Download**.
5. Restart Home Assistant (or reload frontend resources).

After installation, the Lovelace resource is usually added automatically by HACS.  
If not, see **“Add as a resource”** below.

---

### Option B — Install via HACS (custom repository)
Use this method if the card is not yet listed in the HACS store.

1. Open **HACS** in Home Assistant.
2. Click the **⋮ (three dots)** menu in the top right.
3. Select **Custom repositories**.
4. Add the repository:
   - **Repository**: `https://github.com/maglerod/andy-segment-display-card`
   - **Category**: **Lovelace**
5. Click **Add**.
6. Go to **Frontend** in HACS.
7. Search for **Andy Segment Display**.
8. Click **Download**.
9. Restart Home Assistant (or reload frontend resources).

---

### Option C — Manual installation (no HACS)
1. Download `andy-segment-display-card.js` from this repository.
2. Copy the file to your Home Assistant configuration directory: /config/www/andy-segment-display-card.js

### Add as a resource (if needed)
If the card does not appear automatically:

1. Go to **Settings → Dashboards → Resources**
2. Click **Add Resource**
3. Enter:
- **URL**: `/local/andy-segment-display-card.js?v=20260101-123`
- **Resource type**: `JavaScript Module`
4. Save and perform a **hard refresh** in your browser (`Ctrl+F5` / `Cmd+Shift+R`).


---

### Add the card to a dashboard

#### Using the UI editor
1. Open your dashboard → **Edit dashboard**
2. Click **Add card**
3. Search for **Andy Segment Display**
4. Configure the card and save

#### Using YAML
```yaml
type: custom:andy-segment-display-card
entity: sensor.your_sensor_here
title: ""
size_px: 0
text_color: "#00FF66"
background_color: "#0B0F0C"
show_unused: true
unused_color: "#2A2F2C"
decimals: null
show_unit: false
max_chars: 10
render_style: segment
matrix_dot_off_color: "#1C211E"
matrix_dot_on_color: ""
matrix_cols: 5
matrix_rows: 7
matrix_gap: 2
