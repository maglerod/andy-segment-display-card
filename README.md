# Andy Segment Display Card V2.0.4

### 7-segment mode (numeric) Dot-matrix mode (text) & Plain text
![Preview of display](Images/segment-display-card.png)
![Preview of progressbar](Images/rowsprogress.png)
![Preview of slides](Images/slides.png)
![Visual editor](Images/segment-display-card-configeditor_1.png)

> **Recommended installation method:** HACS  
> Manual installation is supported but not recommended unless HACS is unavailable.

A Home Assistant Lovelace custom card that renders an entity state in a classic digital display style, and now support multiple entities / rows / slides and progressbar

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

## v2.0.4
- Added Multiple ROW Support! 
- Added support for special characters (scroll down
- Added support for unit with both lowercase / uppercase
- Showing unused matrix dots
- Added support for Progressbar on numeric values
- Added support for showing icon in Title, can be left / right aligned

## v2.0 
- Multi-entity support (Slides): rotate between multiple entities instead of showing only one
- Slide-based animation engine: configurable In / Stay / Out timing per slide
- Multiple animation styles: Left, Right, Top, Bottom, Billboard, Matrix, and Running
- Continuous Running mode: scrolling text that flows left → right without stopping
- Per-slide value templates: mix static text with <value> placeholders
- Color Intervals: dynamic text color based on numeric value ranges
- Global render settings: shared style, size, colors, alignment across all slides
- Plain Text render mode: in addition to Dot-Matrix and 7-Segment
- Italic text support (Plain Text + 7-Segment)
- Center text option
- Improved Visual Editor: structured Slides list with Add / Move / Delete controls
- Backwards compatibility: automatic migration from old single-entity YAML
- 7-Segment letter support: displays C, F, L, I (e.g., °C / °F units)
- Animations work even with a single slide
- Improved color picker stability: no focus loss while editing
- Enhanced editor layout: Slides list separated for better readability
- More robust architecture: animation logic split into modular functions for future expansion

Configuration
All options are available in the visual editor. YAML mode is also supported.






## ☕ Support the project 
I’m a Home Automation enthusiast who spends way too many late nights building custom cards, dashboards and small tools for Home Assistant.
I love creating clean, useful UI components and sharing them for free with the community, and I try to help others whenever I can with ideas, code and support.
If you enjoy my work or use any of my cards in your setup, your support means a lot and helps me keep experimenting, improving and maintaining everything.

<a href="https://www.buymeacoffee.com/AndyBonde" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="160">
</a>










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

```
