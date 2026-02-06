/* Andy Segment Display Card (Home Assistant Lovelace Custom Card)
 * v2.0.5
 * ------------------------------------------------------------------
 * Developed by: Andreas ("AndyBonde") with some help from AI :).
 *
 * License / Disclaimer:
 * - Free to use, copy, modify, redistribute.
 * - Provided "AS IS" without warranty. No liability.
 * - Not affiliated with Home Assistant / Nabu Casa.
 * - Runs fully in the browser.
 *
 * Install: Se README.md in GITHUB
 *
 * Changelog
 * 2.0.5 - 2026-02-06
 * Added support for GAP between title and Icon
 * Added Color pickir for Title aand Icon
 * Added interval color selection on progressbar (show all or active interval)
 *
 *
 * 2.0.4 - 2026-02-06
 * Added Multiple ROW Support! 
 * Added support for special characters
 * Added support for unit with both lowercase / uppercase
 * Showing unused matrix dots
 * Added support for Progressbar on numeric values
 * Added support for showing icon in Title, can be left / right aligned
 *
 * 2.0.3 - 2026-02-02
 * FIX: Title default color is now fixed gray (same in Light/Dark). If Title color is set, it overrides.
 * 
  2.0.2 - 2026-02-01
 * FIX: Title now remains visible in Home Assistant Light Mode (respects card background).
 * UI: Added Variables reference + Support section at bottom of the Visual Editor.
 * UI: Added global 'Title color' field (empty = theme-aware).
 * NEW: value_template & Title now supports the full variable set as well.
 *
 * 2.0.1 - 2026-01-22
 * Multi-entity support (Slides): rotate between multiple entities instead of showing only one
 * Slide-based animation engine: configurable In / Stay / Out timing per slide
 * Multiple animation styles: Left, Right, Top, Bottom, Billboard, Matrix, and Running
 * Continuous Running mode: scrolling text that flows left → right without stopping
 * Per-slide value templates: mix static text with <value> placeholders
 * Color Intervals: dynamic text color based on numeric value ranges
 * Global render settings: shared style, size, colors, alignment across all slides
 * Plain Text render mode: in addition to Dot-Matrix and 7-Segment
 * Italic text support (Plain Text + 7-Segment)
 * Center text option
 * Improved Visual Editor: structured Slides list with Add / Move / Delete controls
 * Backwards compatibility: automatic migration from old single-entity YAML
 * 7-Segment letter support: displays C, F, L, I (e.g., °C / °F units)
 * Animations work even with a single slide
 * Improved color picker stability: no focus loss while editing
 * Enhanced editor layout: Slides list separated for better readability
 * More robust architecture: animation logic split into modular functions for future expansion
 *
 * 1.2.7 - 2026-01-10
 * FIX: Safe customElements.define (avoid duplicate define errors)
 * FIX: Wrap in IIFE (avoid "Identifier already declared")
 * FIX: Update SVG when style/config changes (not only when text changes)
 *
 * 1.2.6 - 2026-01-10
 * Added support for card-mod customization
 * Fixed flickering / scrolling issues
 * 
 * 1.2.5 - 2026-01-08
 * - Added support for Danish / Norwegian characters
 * - Added Decimal management
 * - Added Leading Zero function if value is without leading zero it will be added
 */

(() => {
  
  const CARD_VERSION = "2.0.5";
  const CARD_TAG = "andy-segment-display-card";
  const EDITOR_TAG = `${CARD_TAG}-editor`;
  const CARD_NAME = "Andy Segment Displaycard Card";
  const CARD_TAGLINE = `${CARD_NAME} v${CARD_VERSION}`;
  
console.info(
  `%c${CARD_TAGLINE}`,
  [
    "background: rgba(255,152,0,0.95)",
    "color: #fff",
    "padding: 4px 10px",
    "border-radius: 10px",
    "font-weight: 800",
    "letter-spacing: 0.2px",
    "border: 1px solid rgba(0,0,0,0.25)",
    "box-shadow: 0 1px 0 rgba(0,0,0,0.15)"
  ].join(";")
);  
  


  // -------------------- Defaults --------------------
  const DEFAULT_TITLE_COLOR = "rgba(255,255,255,0.75)";

  const DEFAULTS_GLOBAL = {
    // Global render settings (apply to ALL slides)
    render_style: "segment", // "segment" | "matrix" | "plain"
    size_px: 0,              // 0 = auto
    italic: false,           // segment/plain only (disabled for matrix)
    center_text: false,      // center the display (otherwise right align like v1)

    show_title: true,

    background_color: "#0B0F0C",
    text_color: "#00FF66",
  title_color: "",

    // Dot-matrix only
    matrix_dot_off_color: "#221B1B",

    // Legacy support: if set (from old configs), overrides matrix dot-on color.
    // v2 editor no longer exposes this; dot-on uses text_color / interval color.
    matrix_dot_on_color: "",

    // 7-seg only
    show_unused: true,
    unused_color: "#2A2F2C",

    // sizing (auto aspect ratio uses this unless /* auto_max_chars removed in v2.0.83 */ = true)
    max_chars: 10,
    // Color intervals (optional)
    color_intervals: [], // { from:number, to:number, color:"#RRGGBB" }

    // Dot-matrix geometry (kept for compatibility; not exposed in v2 editor)
    matrix_cols: 5,
    matrix_rows: 7,
    matrix_gap: 2,
  };

  const DEFAULT_SLIDE = {
  animate_single: false,
    entity: "",
    title: "",
    title_icon: "",
    title_icon_align: "left",
    title_icon_gap: 6,
    title_text_color: "",
    title_icon_color: "",

    // Numeric formatting
    decimals: null,      // manual (wins over auto_decimals)
    auto_decimals: null, // auto limit decimals
    leading_zero: true,
    show_unit: false,

    // Color intervals (slide override, optional)
    color_intervals: [], // { from:number, to:number, color:"#RRGGBB" }

    // Text template (matrix/plain only): use "<value>" placeholder
    value_template: "<value>",

    // Dot-matrix progress bar (numeric)
    matrix_progress: false,
    progress_min: 0,
    progress_max: 100,
    progress_color_mode: "active", // active | intervals

    // Slide switching
    stay_s: 3,
    out_s: 0.5,
    in_s: 0.5,
    fade: true,
    show_style: "run_left", // run_left | run_right | run_top | run_bottom | billboard | matrix
    hide_style: "run_right",
    hide_prev_first: true,
  };


const DEFAULT_ROW = {
  slides: [{ ...DEFAULT_SLIDE, title: "Slide 1" }],
};

const SEGMENTS = {
  "0": [1,1,1,1,1,1,0],
  "1": [0,1,1,0,0,0,0],
  "2": [1,1,0,1,1,0,1],
  "3": [1,1,1,1,0,0,1],
  "4": [0,1,1,0,0,1,1],
  "5": [1,0,1,1,0,1,1],
  "6": [1,0,1,1,1,1,1],
  "7": [1,1,1,0,0,0,0],
  "8": [1,1,1,1,1,1,1],
  "9": [1,1,1,1,0,1,1],
  "-": [0,0,0,0,0,0,1],
  " ": [0,0,0,0,0,0,0],
  "C": [1,0,0,1,1,1,0],
  "F": [1,0,0,0,1,1,1],
  "L": [0,0,0,1,1,1,0],
  "I": [0,1,1,0,0,0,0],
};
const FONT_5X7 = {
  " ": [0,0,0,0,0,0,0],
  "-": [0,0,0,31,0,0,0],
  "_": [0,0,0,0,0,0,31],
  ".": [0,0,0,0,0,12,12],
  ":": [0,12,12,0,12,12,0],
  "/": [1,2,4,8,16,0,0],
  "\\":[16,8,4,2,1,0,0],

  "0": [14,17,19,21,25,17,14],
  "1": [4,12,4,4,4,4,14],
  "2": [14,17,1,2,4,8,31],
  "3": [31,2,4,2,1,17,14],
  "4": [2,6,10,18,31,2,2],
  "5": [31,16,30,1,1,17,14],
  "6": [6,8,16,30,17,17,14],
  "7": [31,1,2,4,8,8,8],
  "8": [14,17,17,14,17,17,14],
  "9": [14,17,17,15,1,2,12],

  "A": [14,17,17,31,17,17,17],
  "B": [30,17,17,30,17,17,30],
  "C": [14,17,16,16,16,17,14],
  "D": [30,17,17,17,17,17,30],
  "E": [31,16,16,30,16,16,31],
  "F": [31,16,16,30,16,16,16],
  "G": [14,17,16,23,17,17,14],
  "H": [17,17,17,31,17,17,17],
  "I": [14,4,4,4,4,4,14],
  "J": [7,2,2,2,2,18,12],
  "K": [17,18,20,24,20,18,17],
  "L": [16,16,16,16,16,16,31],
  "M": [17,27,21,21,17,17,17],
  "N": [17,25,21,19,17,17,17],
  "O": [14,17,17,17,17,17,14],
  "P": [30,17,17,30,16,16,16],
  "Q": [14,17,17,17,21,18,13],
  "R": [30,17,17,30,20,18,17],
  "S": [15,16,16,14,1,1,30],
  "T": [31,4,4,4,4,4,4],
  "U": [17,17,17,17,17,17,14],
  "V": [17,17,17,17,17,10,4],
  "W": [17,17,17,21,21,27,17],
  "X": [17,17,10,4,10,17,17],
  "Y": [17,17,10,4,4,4,4],
  "Z": [31,1,2,4,8,16,31],

  // Nordic fallbacks
  "Å": [14,17,17,31,17,17,17], // treat as A
  "Ä": [14,17,17,31,17,17,17], // treat as A
  "Ö": [14,17,17,17,17,17,14], // treat as O
  "Æ": [14,17,17,31,17,17,17], // A-like
  "Ø": [14,17,17,17,17,17,14], // O-like
  // Lowercase (basic). If not present, we will fall back to uppercase glyphs below.
  "k": [16,16,18,20,24,20,18],
  "h": [16,16,30,17,17,17,17],
  "w": [17,17,17,21,21,21,10],

};

// FONT_5X7_LOWERCASE_FALLBACK: map missing a-z to A-Z glyphs (keeps unit casing from HA)
for (let i = 65; i <= 90; i++) {
  const up = String.fromCharCode(i);
  const lo = up.toLowerCase();
  if (!FONT_5X7[lo]) FONT_5X7[lo] = FONT_5X7[up];
}

// ----- Dot-matrix icon tokens (v2.0.4+) --------------------
// These let users write placeholders like <degree> or <cloud> inside value/title templates.
// They are replaced with private-use characters that map to extra 5x7 glyphs.
const MATRIX_ICON_TOKENS = Object.freeze({
  degree: "°",
  x: "\uE01A",
  stop: "\uE019",
  rain: "\uE003",
  rain_huge: "\uE004",
  ip: "\uE01B",
  full: "\uE01C",
  calendar: "\uE00C",
  windows: "\uE00D",
  clouds: "\uE002",
  cloud: "\uE001",
  door: "\uE00E",
  female: "\uE00F",
  snowflake: "\uE005",
  key: "\uE011",
  male: "\uE010",
  alarm: "\uE012",
  clock: "\uE013",
  garbage: "\uE014",
  info: "\uE015",
  moon: "\uE009",
  message: "\uE016",
  reminder: "\uE017",
  wifi: "\uE018",
  thunderstorm: "\uE006",
  sun: "\uE007",
  fog: "\uE00B",
  cloud_moon: "\uE00A",
  sun_cloud: "\uE008",
});

// Minimal 5x7 glyphs for the tokens above.
// NOTE: these are intentionally simple and readable at small sizes.
Object.assign(FONT_5X7, {
  "°": [0b00110,0b01001,0b01001,0b00110,0,0,0],
  [MATRIX_ICON_TOKENS.x]: [0b10001,0b01010,0b00100,0b01010,0b10001,0,0],
  [MATRIX_ICON_TOKENS.stop]: [0b01110,0b10001,0b10101,0b10101,0b10001,0b01110,0],
  [MATRIX_ICON_TOKENS.ip]: [0b11111,0b00100,0b00100,0b00100,0b00100,0,0], // simple "i" bar (pairs well with "p:" text)
  [MATRIX_ICON_TOKENS.full]: [0b11111,0b11111,0b11111,0b11111,0b11111,0b11111,0b11111],

  [MATRIX_ICON_TOKENS.cloud]: [0,0b00110,0b01001,0b11111,0b11111,0b11111,0],
  [MATRIX_ICON_TOKENS.clouds]: [0b00110,0b01111,0b11001,0b11111,0b11111,0b11111,0],
  [MATRIX_ICON_TOKENS.rain]: [0,0b00110,0b01001,0b11111,0b11111,0b10101,0b01010],
  [MATRIX_ICON_TOKENS.rain_huge]: [0b00110,0b01001,0b11111,0b11111,0b10101,0b10101,0b01010],
  [MATRIX_ICON_TOKENS.snowflake]: [0b10101,0b01110,0b11111,0b01110,0b10101,0,0],
  [MATRIX_ICON_TOKENS.thunderstorm]: [0b00110,0b01001,0b11111,0b11111,0b00100,0b01000,0b10000],
  [MATRIX_ICON_TOKENS.sun]: [0b00100,0b10101,0b01110,0b11111,0b01110,0b10101,0b00100],
  [MATRIX_ICON_TOKENS.sun_cloud]: [0b00100,0b10101,0b01111,0b11111,0b11111,0b11111,0],
  [MATRIX_ICON_TOKENS.moon]: [0b00111,0b01100,0b11000,0b11000,0b01100,0b00111,0],
  [MATRIX_ICON_TOKENS.cloud_moon]: [0b00111,0b01101,0b11001,0b11111,0b11111,0b11111,0],
  [MATRIX_ICON_TOKENS.fog]: [0,0b11111,0,0b11111,0,0b11111,0],

  [MATRIX_ICON_TOKENS.calendar]: [0b11111,0b10101,0b11111,0b10001,0b11111,0,0],
  [MATRIX_ICON_TOKENS.windows]: [0b11111,0b10101,0b11111,0b10101,0b11111,0,0],
  [MATRIX_ICON_TOKENS.door]: [0b11110,0b10010,0b10010,0b10010,0b11110,0,0],
  [MATRIX_ICON_TOKENS.female]: [0b00100,0b01110,0b00100,0b01110,0b00100,0b00100,0],
  [MATRIX_ICON_TOKENS.male]: [0b11100,0b10100,0b11111,0b00100,0b00100,0,0],
  [MATRIX_ICON_TOKENS.key]: [0b00110,0b01001,0b00110,0b00100,0b00100,0b00110,0],
  [MATRIX_ICON_TOKENS.alarm]: [0b00100,0b01110,0b01110,0b01110,0b11111,0b00100,0],
  [MATRIX_ICON_TOKENS.clock]: [0b01110,0b10001,0b10101,0b10011,0b01110,0,0],
  [MATRIX_ICON_TOKENS.garbage]: [0b01110,0b11111,0b10101,0b10101,0b11111,0,0],
  [MATRIX_ICON_TOKENS.info]: [0b00100,0,0b00100,0b00100,0b00100,0,0],
  [MATRIX_ICON_TOKENS.message]: [0b11111,0b10001,0b10101,0b10001,0b11111,0,0],
  [MATRIX_ICON_TOKENS.reminder]: [0b01110,0b10001,0b11111,0b10001,0b01110,0,0],
  [MATRIX_ICON_TOKENS.wifi]: [0b00001,0b00110,0b01000,0b00110,0b00001,0,0],
});
function clampInt(n, min, max) {
  const x = Number.isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, x));
}

function normalizeForMatrix(s) {
  return s
    .replaceAll("å", "Å")
    .replaceAll("ä", "Ä")
    .replaceAll("ö", "Ö")
    .replaceAll("æ", "Æ")
    .replaceAll("ø", "Ø")
    ;
}


function formatTimeLocal(ts) {
  try { return new Date(ts).toLocaleString(); } catch (e) { return ""; }
}
function formatTimeISO(ts) {
  try { return new Date(ts).toISOString(); } catch (e) { return ""; }
}
function formatRel(ts) {
  try {
    const d = new Date(ts).getTime();
    if (!Number.isFinite(d)) return "";
    const diff = Date.now() - d;
    const sec = Math.round(diff / 1000);
    const abs = Math.abs(sec);
    const s = abs < 60 ? `${abs}s` :
              abs < 3600 ? `${Math.round(abs/60)}m` :
              abs < 86400 ? `${Math.round(abs/3600)}h` :
              `${Math.round(abs/86400)}d`;
    return sec >= 0 ? `${s} ago` : `in ${s}`;
  } catch (e) { return ""; }
}
function applyTemplate(tpl, vars) {
  const t = String(tpl ?? "<value>");
  return t.replace(/<attr:([^>]+)>/g, (_, k) => {
    const key = String(k || "").trim();
    const v = vars?.attr?.[key];
    return (v === undefined || v === null) ? "" : String(v);
  }).replace(/<(degree|x|stop|rain|rain_huge|ip|full|calendar|windows|clouds|cloud|door|female|snowflake|key|male|alarm|clock|garbage|info|moon|message|reminder|wifi|thunderstorm|sun|fog|cloud_moon|sun_cloud)>/g, (_, n) => {
    return MATRIX_ICON_TOKENS?.[String(n)] ?? "";
  }).replaceAll("<value>", String(vars.value ?? ""))
    .replaceAll("<state>", String(vars.state ?? ""))
    .replaceAll("<name>", String(vars.name ?? ""))
    .replaceAll("<unit>", String(vars.unit ?? ""))
    .replaceAll("<entity_id>", String(vars.entity_id ?? ""))
    .replaceAll("<domain>", String(vars.domain ?? ""))
    .replaceAll("<last_changed>", String(vars.last_changed ?? ""))
    .replaceAll("<last_updated>", String(vars.last_updated ?? ""))
    .replaceAll("<last_changed_rel>", String(vars.last_changed_rel ?? ""))
    .replaceAll("<last_updated_rel>", String(vars.last_updated_rel ?? ""))
    .replaceAll("<last_changed_iso>", String(vars.last_changed_iso ?? ""))
    .replaceAll("<last_updated_iso>", String(vars.last_updated_iso ?? ""));
}

function toDisplayString(stateObj, cfg) {
  if (!stateObj) return "—";

  let raw = stateObj.state;

  // numeric formatting
  const num = Number(raw);
  const isNum = raw !== "" && !Number.isNaN(num) && Number.isFinite(num);

  if (isNum) {
    // 1) Manual decimals wins
    if (typeof cfg.decimals === "number") {
      raw = num.toFixed(clampInt(cfg.decimals, 0, 6));
    }
    // 2) Auto decimals: only if raw already has decimals and exceeds limit
    else if (typeof cfg.auto_decimals === "number") {
      const limit = clampInt(cfg.auto_decimals, 0, 6);
      const s = String(raw).replace(",", ".");
      const dot = s.indexOf(".");
      if (dot >= 0) {
        const decLen = s.length - dot - 1;
        if (decLen > limit) {
          raw = num.toFixed(limit);
        } else {
          raw = s; // keep original precision
        }
      } else {
        raw = String(raw);
      }
    }
  }

  // Leading zero (e.g. .5 -> 0.5, -.5 -> -0.5)
  if (cfg.leading_zero) {
    const s = String(raw).replace(",", ".");
    if (s.startsWith(".")) raw = `0${s}`;
    else if (s.startsWith("-.") ) raw = s.replace("-.", "-0.");
    else raw = s;
  }

  if (cfg.show_unit && stateObj.attributes?.unit_of_measurement) {
    raw = `${raw}${stateObj.attributes.unit_of_measurement}`;
  }

  let s = String(raw);

  // Segment mode: keep digits + dot + minus + a few letters (for units)
  if ((cfg.render_style || "segment") === "segment") {
    s = s
      .replace(",", ".")
      .split("")
      .map((ch) => {
        if (ch >= "0" && ch <= "9") return ch;
        if (ch === "." || ch === "-") return ch;

        const up = String(ch).toUpperCase();
        if (up === "C" || up === "F" || up === "L" || up === "I") return up;

        // Ignore other symbols in 7-seg mode (e.g. °)
        return " ";
      })
      .join("");
  } else {
    s = normalizeForMatrix(s);
  }

  const max = clampInt(cfg.max_chars ?? DEFAULTS.max_chars, 1, 40);
  return s.length > max ? s.slice(s.length - max) : s;
}


function setTitleWithIcon(titleEl, text, icon, align, gapPx, textColor, iconColor) {
  titleEl.innerHTML = "";
  titleEl.classList.toggle("asdc-title-has-icon", !!icon);
  titleEl.classList.toggle("asdc-title-icon-right", (align === "right"));
  const gap = (typeof gapPx === "number" && isFinite(gapPx)) ? gapPx : 6;
  titleEl.style.gap = `${gap}px`;
  const span = document.createElement("span");
  span.className = "asdc-title-text";
  span.textContent = text || "";
  if (textColor) span.style.color = textColor;
  if (icon) {
    const ic = document.createElement("ha-icon");
    ic.setAttribute("icon", icon);
    ic.className = "asdc-title-icon";
    if (iconColor) ic.style.color = iconColor;
    if (align === "right") {
      titleEl.appendChild(span);
      titleEl.appendChild(ic);
    } else {
      titleEl.appendChild(ic);
      titleEl.appendChild(span);
    }
  } else {
    titleEl.appendChild(span);
  }
}
/* -------- 7-segment rendering -------- */
function svgForSegmentChar(ch, cfg) {
  if (ch === ".") {
    return `
      <svg class="char dot" viewBox="0 0 60 120" aria-hidden="true">
        <circle class="seg on" cx="45" cy="105" r="8"></circle>
      </svg>
    `;
  }

  const seg = SEGMENTS[ch] || SEGMENTS[" "];

  const paths = [
    `<rect class="seg a" x="12" y="8"  width="36" height="10" rx="5" ry="5"></rect>`,
    `<rect class="seg b" x="44" y="18" width="10" height="38" rx="5" ry="5"></rect>`,
    `<rect class="seg c" x="44" y="64" width="10" height="38" rx="5" ry="5"></rect>`,
    `<rect class="seg d" x="12" y="102" width="36" height="10" rx="5" ry="5"></rect>`,
    `<rect class="seg e" x="6"  y="64" width="10" height="38" rx="5" ry="5"></rect>`,
    `<rect class="seg f" x="6"  y="18" width="10" height="38" rx="5" ry="5"></rect>`,
    `<rect class="seg g" x="12" y="55" width="36" height="10" rx="5" ry="5"></rect>`,
  ];

  const segClasses = ["a","b","c","d","e","f","g"];
  const withState = segClasses.map((name, i) => {
    const isOn = seg[i] === 1;
    return paths[i].replace(
      `class="seg ${name}"`,
      `class="seg ${name} ${isOn ? "on" : "off"}"`
    );
  });

  return `
    <svg class="char" viewBox="0 0 60 120" aria-hidden="true">
      ${withState.join("")}
    </svg>
  `;
}
/* -------- 5x7 dot-matrix rendering -------- */
function svgForMatrixChar(ch, cfg) {
  const cols = clampInt(cfg.matrix_cols ?? 5, 3, 8);
  const rows = clampInt(cfg.matrix_rows ?? 7, 5, 9);
  const gap = clampInt(cfg.matrix_gap ?? 2, 0, 6);

  let pattern = FONT_5X7[ch];
  if (!pattern && typeof ch === "string" && ch.length === 1) {
    const cc = ch.charCodeAt(0);
    if (cc >= 97 && cc <= 122) {
      pattern = FONT_5X7[ch.toUpperCase()];
    }
  }
  if (!pattern) pattern = FONT_5X7[" "];

  const cell = 10;
  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;

  let dots = "";
  for (let r = 0; r < rows; r++) {
    const rowBits = pattern[r] ?? 0;
    for (let c = 0; c < cols; c++) {
      const bitIndex = (cols - 1) - c;
      const on = ((rowBits >> bitIndex) & 1) === 1;
      const x = c * (cell + gap);
      const y = r * (cell + gap);
      dots += `<rect class="dot ${on ? "on" : "off"}" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" ry="2"></rect>`;
    }
  }

  return `
    <svg class="char matrix" viewBox="0 0 ${w} ${h}" aria-hidden="true">
      ${dots}
    </svg>
  `;
}

// Same as svgForMatrixChar, but applies an inline CSS variable override for dot-on color on the SVG root.
// This avoids any HTML->SVG custom property inheritance quirks in some browsers.
function svgForMatrixCharColored(ch, cfg, dotOnOverride) {
  const svg = svgForMatrixChar(ch, cfg);
  if (!dotOnOverride) return svg;
  // Inject style attribute on the <svg ...> element so the variable lives inside the SVG tree
  return svg.replace('<svg class="char matrix"', `<svg class="char matrix" style="--asdc-dot-on:${dotOnOverride};"`);
}


  // -------------------- Color interval helper --------------------
  function pickIntervalColor(intervals, n) {
    if (!Array.isArray(intervals) || intervals.length === 0) return null;
    for (const it of intervals) {
      const f = Number(it?.from);
      const t = Number(it?.to);
      if (!Number.isFinite(f) || !Number.isFinite(t)) continue;
      const lo = Math.min(f, t);
      const hi = Math.max(f, t);
      if (n >= lo && n <= hi) {
        const c = String(it?.color || "").trim();
        if (/^#([0-9a-fA-F]{3}){1,2}$/.test(c)) return c.toUpperCase();
      }
    }
    return null;
  }

  function toNumberOrNull(stateObj) {
    if (!stateObj) return null;
    const raw = stateObj.state;
    const n = Number(String(raw).replace(",", "."));
    if (raw === "" || Number.isNaN(n) || !Number.isFinite(n)) return null;
    return n;
  }

  // -------------------- Animation engine (generic) --------------------
  // NOTE: Animations are implemented as CSS keyframes; easy to extend.
  function animNameFor(style, phase) {
    // phase: "in" | "out"
    switch (style) {
      case "running":   return phase === "in" ? "asdc-in-run-left"  : "asdc-out-run-right";
      case "run_left":  return phase === "in" ? "asdc-in-run-left"  : "asdc-out-run-left";
      case "run_right": return phase === "in" ? "asdc-in-run-right" : "asdc-out-run-right";
      case "run_top":   return phase === "in" ? "asdc-in-run-top"   : "asdc-out-run-top";
      case "run_bottom":return phase === "in" ? "asdc-in-run-bottom": "asdc-out-run-bottom";
      case "billboard": return phase === "in" ? "asdc-in-billboard" : "asdc-out-billboard";
      case "matrix":    return phase === "in" ? "asdc-in-matrix"    : "asdc-out-matrix";
      default:          return phase === "in" ? "asdc-in-run-left"  : "asdc-out-run-right";
    }
  }

  function applyAnim(el, style, phase, seconds, fade) {
    if (!el) return;
    const s = Math.max(0, Number(seconds) || 0);
    if (s <= 0) {
      el.style.animation = "";
      el.classList.remove("asdc-anim");
      return;
    }

    el.classList.add("asdc-anim");
    el.style.setProperty("--asdc-anim-dur", `${s}s`);
    el.style.setProperty("--asdc-anim-fade", fade ? "1" : "0");
    el.style.animation = `${animNameFor(style, phase)} var(--asdc-anim-dur) ease-in-out both`;
  }

  function clearAnim(el) {
    if (!el) return;
    el.style.animation = "";
    el.classList.remove("asdc-anim");
  }

  // -------------------- Config migration --------------------
  function migrateConfig(config) {
    const cfg = config || {};
    const _type = cfg.type;

    // v2.1+ (rows) migration / normalization
    if (Array.isArray(cfg.rows) && cfg.rows.length) {
      const global = { ...DEFAULTS_GLOBAL, ...(cfg.global || cfg) };
      global.color_intervals = Array.isArray(cfg.color_intervals) ? cfg.color_intervals : (global.color_intervals || []);
      const rows = cfg.rows.map((r) => {
        const slides = (Array.isArray(r?.slides) && r.slides.length) ? r.slides : [{ ...DEFAULT_SLIDE }];
        return { ...(r || {}), slides: slides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) };
      });
      // keep backward-compatible top-level slides as row 0
      return { ...(_type ? { type: _type } : {}), ...global, rows, slides: rows[0].slides };
    }

    // If already v2-like (slides only)
    if (Array.isArray(cfg.slides)) {
      const global = { ...DEFAULTS_GLOBAL, ...(cfg.global || cfg) };
      global.color_intervals = Array.isArray(cfg.color_intervals) ? cfg.color_intervals : (global.color_intervals || []);
      const slides = cfg.slides.length > 0 ? cfg.slides : [{ ...DEFAULT_SLIDE }];
      const normSlides = slides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
      return { ...(_type ? { type: _type } : {}), ...global, rows: [{ ...DEFAULT_ROW, slides: normSlides }], slides: normSlides };
    }

    // v1 -> v2 migration
    const global = { ...DEFAULTS_GLOBAL };

    // Map old top-level fields to global
    for (const k of Object.keys(DEFAULTS_GLOBAL)) {
      if (typeof cfg[k] !== "undefined") global[k] = cfg[k];
    }

    // Build first slide from old single-entity config
    const slide = { ...DEFAULT_SLIDE };
    slide.entity = cfg.entity || "";
    slide.title = cfg.title || "";
    slide.decimals = (typeof cfg.decimals === "number") ? cfg.decimals : null;
    slide.auto_decimals = (typeof cfg.auto_decimals === "number") ? cfg.auto_decimals : null;
    slide.leading_zero = cfg.leading_zero !== false;
    slide.show_unit = !!cfg.show_unit;

    const normSlides = [slide];
    return { ...(_type ? { type: _type } : {}), ...global, rows: [{ ...DEFAULT_ROW, slides: normSlides }], slides: normSlides };
  }

  // -------------------- Card --------------------
  class AndySegmentDisplayCard extends HTMLElement {
    constructor() {
      super();
      this._uid = `asdc-${Math.random().toString(36).slice(2, 10)}`;
      this._built = false;
      this._els = null;
      this._raf = 0;

      this._rowStates = [];
      this._rowEls = [];

      // Legacy mirrors (row 0)
      this._slideIndex = 0;
      this._timer = 0;
      this._isSwitching = false;

    }

    static getConfigElement() {
      return document.createElement(EDITOR_TAG);
    }

    static getStubConfig() {
      return {
        ...DEFAULTS_GLOBAL,
        slides: [{ ...DEFAULT_SLIDE, title: "Slide 1" }],
      };
    }

    setConfig(config) {
      this._origType = config?.type || this._origType || undefined;
      this._config = migrateConfig(config);
      if (this._origType && !this._config.type) this._config.type = this._origType;
      this._render();
      this._resetScheduler(true);
    }

    set hass(hass) {
      this._hass = hass;
      this._scheduleRender();
    }

    disconnectedCallback() {
      this._clearAllTimers();
    }

    getCardSize() {
      return 2;
    }

    _scheduleRender() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => {
        this._raf = 0;
        this._render();
      });
    }

    _getRows() {
      const cfg = this._config || {};
      if (Array.isArray(cfg.rows) && cfg.rows.length) {
        return cfg.rows.map(r => ({
          ...(r || {}),
          slides: Array.isArray(r?.slides) && r.slides.length ? r.slides : [{ ...DEFAULT_SLIDE }],
        }));
      }
      const slides = Array.isArray(cfg.slides) && cfg.slides.length ? cfg.slides : [{ ...DEFAULT_SLIDE }];
      return [{ ...DEFAULT_ROW, slides: slides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) }];
    }

    _ensureRowState(count) {
      while (this._rowStates.length < count) {
        this._rowStates.push({
          slideIndex: 0,
          timer: 0,
          isSwitching: false,
          lastText: null,
        });
      }
      if (this._rowStates.length > count) {
        // clear timers for removed rows
        for (let i = count; i < this._rowStates.length; i++) {
          const st = this._rowStates[i];
          if (st?.timer) clearTimeout(st.timer);
        }
        this._rowStates.length = count;
      }
    }

    _clearAllTimers() {
      (this._rowStates || []).forEach(st => {
        if (st?.timer) clearTimeout(st.timer);
        if (st) {
          st.timer = 0;
          st.isSwitching = false;
        }
      });
    }

    _clearRowTimer(rowIndex) {
      const st = this._rowStates[rowIndex];
      if (st?.timer) {
        clearTimeout(st.timer);
        st.timer = 0;
      }
      if (st) st.isSwitching = false;
    }

    _resetScheduler(force) {
      const rows = this._getRows();
      this._ensureRowState(rows.length);

      if (force) {
        this._clearAllTimers();
        this._rowStates.forEach(st => { st.slideIndex = 0; st.lastText = null; });
      }

      // Start loops for all rows
      rows.forEach((row, idx) => this._startLoopRow(idx, row));
    }

    _startLoopRow(rowIndex, row) {
      const cfg = this._config;
      if (!cfg) {
        this._clearRowTimer(rowIndex);
        return;
      }

      const slides = Array.isArray(row?.slides) ? row.slides : [];
      if (slides.length < 1) {
        this._clearRowTimer(rowIndex);
        return;
      }

      // Single-slide: do not auto-animate unless explicitly enabled
      if (slides.length === 1 && !slides[0]?.animate_single) {
        this._clearRowTimer(rowIndex);
        return;
      }

      const st = this._rowStates[rowIndex];
      if (!st) return;

      if (!st.timer && !st.isSwitching) {
        const s = slides[st.slideIndex] || DEFAULT_SLIDE;
        const stay = Math.max(0, Number(s.stay_s) || 0);
        st.timer = setTimeout(() => this._nextSlideRow(rowIndex), stay * 1000);
      }
    }

    async _nextSlideRow(rowIndex) {
      const cfg = this._config;
      const rows = this._getRows();
      if (!cfg || !rows.length) {
        this._clearRowTimer(rowIndex);
        return;
      }

      const row = rows[rowIndex];
      const slides = Array.isArray(row?.slides) ? row.slides : [];
      const st = this._rowStates[rowIndex];
      if (!st || slides.length < 1) {
        this._clearRowTimer(rowIndex);
        return;
      }

      // Single-slide: only animate if enabled
      if (slides.length === 1 && !slides[0]?.animate_single) {
        this._clearRowTimer(rowIndex);
        st.isSwitching = false;
        return;
      }

      this._clearRowTimer(rowIndex);
      st.isSwitching = true;

      const current = slides[st.slideIndex] || DEFAULT_SLIDE;
      const nextIndex = (st.slideIndex + 1) % slides.length;
      const next = slides[nextIndex] || DEFAULT_SLIDE;

      const outS = Math.max(0, Number(current.out_s) || 0);
      const inS  = Math.max(0, Number(next.in_s) || 0);
      const isRunning = (current.show_style === "running");
      const isSingle = (slides.length === 1);
      const runOut = (outS > 0) && (isRunning ? true : (isSingle ? true : !!current.hide_prev_first));

      const els = this._rowEls[rowIndex];
      const displayEl = els?.display || this._els?.display;
      if (displayEl && runOut) {
        const outStyle = isRunning ? "running" : current.hide_style;
        applyAnim(displayEl, outStyle, "out", outS, !!current.fade);
        await new Promise((res) => setTimeout(res, outS * 1000));
        clearAnim(displayEl);
      } else if (displayEl) {
        clearAnim(displayEl);
      }

      st.slideIndex = nextIndex;
      st.lastText = null;
      this._render();

      if (displayEl && inS > 0) {
        applyAnim(displayEl, next.show_style, "in", inS, !!next.fade);
        await new Promise((res) => setTimeout(res, inS * 1000));
        clearAnim(displayEl);
      }

      st.isSwitching = false;

      const stay = Math.max(0, Number(next.stay_s) || 0);
      st.timer = setTimeout(() => this._nextSlideRow(rowIndex), stay * 1000);
    }

      


    _effectiveMaxChars(renderedText) {
      const cfg = this._config;
      return clampInt(cfg.max_chars ?? DEFAULTS_GLOBAL.max_chars, 1, 40);
    }

    _computeActiveTextColor(stateObj, slide) {
      const cfg = this._config;
      const n = toNumberOrNull(stateObj);
      const intervals = (slide && Array.isArray(slide.color_intervals) && slide.color_intervals.length) ? slide.color_intervals : cfg.color_intervals;
      const intervalColor = (n === null) ? null : pickIntervalColor(intervals, n);
      return (intervalColor || cfg.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase();
    }

    _render() {
      if (!this._config) return;

      const cfg = this._config;
      const rows = this._getRows();

      this._ensureRowState(rows.length);

      const sizePx = Number(cfg.size_px ?? 0);
      const isAuto = !Number.isFinite(sizePx) || sizePx <= 0;
      const style = cfg.render_style || "segment"; // segment|matrix|plain

      if (!this._built) {
        this._built = true;

        this.innerHTML = `
          <div id="${this._uid}" class="asdc-root">
            <ha-card class="asdc-card">
              <div class="wrap">
                <div class="rows"></div>
              </div>
            </ha-card>

            <style>
              #${this._uid} .asdc-card { overflow: hidden; }
              #${this._uid} .wrap { width: 100%; padding: 10px 12px 12px 12px; box-sizing: border-box; }
              #${this._uid} .rows { display: flex; flex-direction: column; gap: 10px; width: 100%; }

              #${this._uid} .asdc-row { width: 100%; }
              #${this._uid} .row-title{

              #${this._uid} .row-title{
                align-items: center;
                gap: 6px;
              }
              #${this._uid} .row-title .asdc-title-icon{
                --mdc-icon-size: 18px;
                opacity: 0.95;
              }
              .asdc-pcell{display:inline-block;}
                padding: 0 0 6px 0;
                font-size: 14px;
                opacity: 0.9;
                color: var(--asdc-title-color, ${DEFAULT_TITLE_COLOR});
                display: none;
              }

              #${this._uid} .display {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
                width: 100%;
                transform-origin: center;
              }
              #${this._uid} .char { height: 100%; width: auto; flex: 0 0 auto; }
              #${this._uid} .wrap.segment .char.dot { width: 26px; }

              /* Segment mode (kept from v1) */
              #${this._uid} .wrap.segment .seg.on {
                fill: var(--asdc-text-color);
                filter: drop-shadow(0 0 6px rgba(0,0,0,0.35));
              }
              #${this._uid} .wrap.segment .seg.off { fill: var(--asdc-unused-fill); }

              /* Matrix mode (kept from v1) */
              #${this._uid} .wrap.matrix .dot.on {
                fill: var(--asdc-dot-on);
                filter: drop-shadow(0 0 6px rgba(0,0,0,0.25));
              }
              #${this._uid} .wrap.matrix .dot.off { fill: var(--asdc-dot-off); }

              /* Plain text mode */
              #${this._uid} .wrap.plain .plainText{
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: clip;
                line-height: 1;
                letter-spacing: 0.5px;
                color: var(--asdc-text-color);
                filter: drop-shadow(0 0 6px rgba(0,0,0,0.25));
                display: flex;
                align-items: center;
                justify-content: inherit;
              }

              /* Optional: italic (segment/plain) */
              #${this._uid} .display.asdc-italic { transform: skewX(-10deg); }
              #${this._uid} .wrap.plain .plainText.asdc-italic { font-style: italic; transform: none; }

              /* Animation base */
              #${this._uid} .display.asdc-anim { will-change: transform, opacity, filter; }

              /* Keyframes */
              @keyframes asdc-in-run-left { 0% { transform: translateX(-25%); opacity: calc(1 - var(--asdc-anim-fade)); } 100% { transform: translateX(0); opacity: 1; } }
              @keyframes asdc-out-run-left { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(-25%); opacity: calc(1 - var(--asdc-anim-fade)); } }
              @keyframes asdc-in-run-right { 0% { transform: translateX(25%); opacity: calc(1 - var(--asdc-anim-fade)); } 100% { transform: translateX(0); opacity: 1; } }
              @keyframes asdc-out-run-right { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(25%); opacity: calc(1 - var(--asdc-anim-fade)); } }
              @keyframes asdc-in-top { 0% { transform: translateY(-25%); opacity: calc(1 - var(--asdc-anim-fade)); } 100% { transform: translateY(0); opacity: 1; } }
              @keyframes asdc-out-top { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-25%); opacity: calc(1 - var(--asdc-anim-fade)); } }
              @keyframes asdc-in-bottom { 0% { transform: translateY(25%); opacity: calc(1 - var(--asdc-anim-fade)); } 100% { transform: translateY(0); opacity: 1; } }
              @keyframes asdc-out-bottom { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(25%); opacity: calc(1 - var(--asdc-anim-fade)); } }
              @keyframes asdc-in-billboard { 0% { transform: perspective(600px) rotateX(75deg); opacity: calc(1 - var(--asdc-anim-fade)); filter: blur(1px);} 100% { transform: perspective(600px) rotateX(0deg); opacity: 1; filter: blur(0);} }
              @keyframes asdc-out-billboard { 0% { transform: perspective(600px) rotateX(0deg); opacity: 1; filter: blur(0);} 100% { transform: perspective(600px) rotateX(-75deg); opacity: calc(1 - var(--asdc-anim-fade)); filter: blur(1px);} }
              @keyframes asdc-in-matrix { 0% { transform: translateY(-10%) skewX(-8deg); opacity: calc(1 - var(--asdc-anim-fade)); filter: blur(1px);} 100% { transform: translateY(0) skewX(0); opacity: 1; filter: blur(0);} }
              @keyframes asdc-out-matrix { 0% { transform: translateY(0) skewX(0); opacity: 1; filter: blur(0);} 100% { transform: translateY(10%) skewX(8deg); opacity: calc(1 - var(--asdc-anim-fade)); filter: blur(1px);} }
              @keyframes asdc-in-running { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }
              @keyframes asdc-out-running { 0% { transform: translateX(0); } 100% { transform: translateX(100%); } }
            </style>
          </div>
        `;

        const root = this.querySelector(`#${this._uid}`);
        this._els = {
          root,
          card: root.querySelector(".asdc-card"),
          wrap: root.querySelector(".wrap"),
          rows: root.querySelector(".rows"),
        };
      }

      // Global wrap class controls the SVG styling for all rows
      this._els.wrap.className = `wrap ${isAuto ? "auto" : "fixed"} ${style}`;

      // Background (card_mod friendly)
      this._els.card.style.setProperty("--ha-card-background", cfg.background_color);

      // Ensure row DOM count
      while (this._rowEls.length < rows.length) {
        const rowEl = document.createElement("div");
        rowEl.className = "asdc-row";

        const t = document.createElement("div");
        t.className = "row-title";

        const d = document.createElement("div");
        d.className = "display";
        d.setAttribute("role", "img");

        rowEl.appendChild(t);
        rowEl.appendChild(d);
        this._els.rows.appendChild(rowEl);

        this._rowEls.push({ row: rowEl, title: t, display: d });
      }
      while (this._rowEls.length > rows.length) {
        const last = this._rowEls.pop();
        if (last?.row?.parentElement) last.row.parentElement.removeChild(last.row);
      }

      // Render each row independently (as if stacking multiple cards)
      rows.forEach((row, rowIndex) => {
        const st = this._rowStates[rowIndex];
        const els = this._rowEls[rowIndex];
        if (!els || !st) return;

        const slides = Array.isArray(row.slides) ? row.slides : [{ ...DEFAULT_SLIDE }];
        const slide = slides[st.slideIndex] || slides[0] || DEFAULT_SLIDE;

        const stateObj = (this._hass && slide.entity) ? this._hass.states[slide.entity] : null;

        const mergedForValue = {
          ...DEFAULTS_GLOBAL,
          ...cfg,
          ...DEFAULT_SLIDE,
          ...slide,
          render_style: cfg.render_style,
          max_chars: 999, // no truncation here
        };

        let valueStr = toDisplayString(stateObj, mergedForValue);

        const vars = {
          value: valueStr,
          state: stateObj?.state ?? "",
          name: stateObj?.attributes?.friendly_name ?? slide.title ?? "",
          unit: stateObj?.attributes?.unit_of_measurement ?? "",
          entity_id: slide.entity ?? "",
          domain: (slide.entity || "").split(".")[0] || "",
          last_changed: formatTimeLocal(stateObj?.last_changed),
          last_updated: formatTimeLocal(stateObj?.last_updated),
          last_changed_rel: formatRel(stateObj?.last_changed),
          last_updated_rel: formatRel(stateObj?.last_updated),
          last_changed_iso: formatTimeISO(stateObj?.last_changed),
          last_updated_iso: formatTimeISO(stateObj?.last_updated),
          attr: stateObj?.attributes || {},
        };

        let displayStr = valueStr;
        if ((cfg.render_style || "segment") !== "segment") {
          const tpl = String(slide.value_template || "<value>");
          if (tpl.includes("<")) {
            displayStr = applyTemplate(tpl, vars);
          } else {
            displayStr = tpl + valueStr;
          }

          if ((cfg.render_style || "matrix") === "matrix") {
            displayStr = normalizeForMatrix(displayStr);
          }
        }

        // Dot-matrix progress bar (slide): render numeric value as a filled bar across max_chars using the <full> glyph
        if ((cfg.render_style || "segment") === "matrix" && slide?.matrix_progress) {
          const nVal = toNumberOrNull(stateObj);
          const minV = Number(slide.progress_min ?? 0);
          const maxV = Number(slide.progress_max ?? 100);
          const lo = Number.isFinite(minV) ? minV : 0;
          const hi = (Number.isFinite(maxV) && maxV !== lo) ? maxV : (lo + 100);
          const eff = this._effectiveMaxChars("");
          const pct = (nVal === null) ? 0 : Math.max(0, Math.min(1, (nVal - lo) / (hi - lo)));
          const filled = Math.max(0, Math.min(eff, Math.round(pct * eff)));
          const fullCh = MATRIX_ICON_TOKENS.full;
          displayStr = fullCh.repeat(filled) + " ".repeat(Math.max(0, eff - filled));
        }


        const effMax = this._effectiveMaxChars(displayStr);
        if (displayStr.length > effMax) displayStr = displayStr.slice(displayStr.length - effMax);

        // Dot-matrix: pad with spaces up to max chars so unused dot boxes remain visible
        if ((cfg.render_style || "segment") === "matrix" && effMax > 0 && displayStr.length < effMax) {
          const pad = effMax - displayStr.length;
          if (cfg.center_text) {
            const left = Math.floor(pad / 2);
            const right = pad - left;
            displayStr = " ".repeat(left) + displayStr + " ".repeat(right);
          } else {
            displayStr = " ".repeat(pad) + displayStr;
          }
        }

        // Alignment + italic
        els.display.style.justifyContent = cfg.center_text ? "center" : "flex-end";
        const italicAllowed = (style !== "matrix") && !!cfg.italic;
        els.display.classList.toggle("asdc-italic", italicAllowed);

        // Update per-row sizing
        const maxChars = this._effectiveMaxChars(displayStr);
        if (isAuto) {
          const ratio =
            (style === "segment") ? (maxChars / 2.2) :
            (style === "matrix")  ? (maxChars / 2.8) :
            (maxChars / 1.6); // plain
          els.display.style.width = "100%";
          els.display.style.height = "";
          els.display.style.aspectRatio = `${ratio}`;
        } else {
          els.display.style.aspectRatio = "";
          els.display.style.height = `${clampInt(sizePx, 18, 300)}px`;
        }

        // Row title (per row)
        let titleText = (cfg.show_title !== false) ? (slide.title || "") : "";
        if (titleText || (slide?.title_icon)) {
          if (String(titleText).includes("<")) titleText = applyTemplate(titleText, vars);
          setTitleWithIcon(els.title, titleText, (slide?.title_icon || ""), (slide?.title_icon_align || "left"), (slide?.title_icon_gap ?? 6), (slide?.title_text_color || ""), (slide?.title_icon_color || ""));
          els.title.style.display = "flex";
        } else {
          els.title.textContent = "";
          els.title.style.display = "none";
        }

        // Colors (per row, interval aware)
        const activeTextColor = this._computeActiveTextColor(stateObj, slide);

        // Dot ON color: follow activeTextColor for all render styles
        const dotOn = activeTextColor;

        const titleDefault = DEFAULT_TITLE_COLOR; // fixed default gray
        const tc = String(cfg.title_color || "").trim();
        els.row.style.setProperty("--asdc-title-color", tc !== "" ? tc : titleDefault);

        els.row.style.setProperty("--asdc-text-color", activeTextColor);
        els.row.style.setProperty("--asdc-dot-on", dotOn);
        els.row.style.setProperty("--asdc-dot-off", (cfg.matrix_dot_off_color || DEFAULTS_GLOBAL.matrix_dot_off_color).toUpperCase());

        const showUnused = !!cfg.show_unused;
        els.row.style.setProperty("--asdc-unused-fill", showUnused ? (cfg.unused_color || DEFAULTS_GLOBAL.unused_color).toUpperCase() : "transparent");

        // Render content only if changed
        if (displayStr !== st.lastText) {
          st.lastText = displayStr;

          if (style === "plain") {
            els.display.innerHTML = `<div class="plainText ${italicAllowed ? "asdc-italic" : ""}">${displayStr}</div>`;
            els.display.setAttribute("aria-label", `${slide.entity || "entity"} value ${displayStr}`);

            requestAnimationFrame(() => {
              const pt = els.display.querySelector(".plainText");
              if (!pt) return;

              const manual = Number(cfg.size_px) || 0;
              if (manual > 0) {
                pt.style.fontSize = `${manual}px`;
              } else {
                const wrapBox = els.row?.getBoundingClientRect?.() || els.display.getBoundingClientRect();
                const fs = Math.max(12, Math.min(180, wrapBox.height * 0.85));
                pt.style.fontSize = `${fs}px`;
              }

              pt.style.justifyContent = cfg.center_text ? "center" : "flex-end";
            });

          } else {
            let html = null;


            // Dot-matrix progress bar: optionally color each filled cell by interval scale

            if (style === "matrix" && slide?.matrix_progress && (slide.progress_color_mode || "active") === "intervals") {

              const nVal = toNumberOrNull(stateObj);

              const minV = Number(slide.progress_min ?? 0);

              const maxV = Number(slide.progress_max ?? 100);

              const lo = Number.isFinite(minV) ? minV : 0;

              const hi = (Number.isFinite(maxV) && maxV !== lo) ? maxV : (lo + 100);

              const eff = this._effectiveMaxChars("");

              const pct = (nVal === null) ? 0 : Math.max(0, Math.min(1, (nVal - lo) / (hi - lo)));

              const filled = Math.max(0, Math.min(eff, Math.round(pct * eff)));

              const intervals = (Array.isArray(slide.color_intervals) && slide.color_intervals.length) ? slide.color_intervals : (cfg.color_intervals || []);

              const fullCh = MATRIX_ICON_TOKENS.full;

              let out = "";

              for (let i = 0; i < eff; i++) {

                if (i < filled) {

                  const sample = lo + ((i + 0.5) / eff) * (hi - lo);

                  const col = pickIntervalColor(intervals, sample) || (cfg.text_color || "#00FF66");

                  out += svgForMatrixCharColored(fullCh, cfg, col);

                } else {

                  out += svgForMatrixChar(" ", cfg);

                }

              }

              html = out;

            }


            if (html === null) {

              const chars = displayStr

                .split("")

                .map((ch) => {

                  if (style === "segment") return svgForSegmentChar(ch, cfg);

                  return svgForMatrixChar(ch, cfg);

                })

                .join("");

              html = chars;

            }


            els.display.innerHTML = html;
            els.display.setAttribute("aria-label", `${slide.entity || "entity"} value ${displayStr}`);
          }
        }

        // Keep legacy mirrors aligned for row 0 only
        if (rowIndex === 0) {
          this._slideIndex = st.slideIndex;
        }
      });

      // Start/continue loops for each row
      rows.forEach((row, idx) => this._startLoopRow(idx, row));
    }

  }

  // Safe define
  if (!customElements.get(CARD_TAG)) {
    customElements.define(CARD_TAG, AndySegmentDisplayCard);
  }

  // -------------------- Editor (UI) --------------------
  class AndySegmentDisplayCardEditor extends HTMLElement {
    setConfig(config) {
      this._config = migrateConfig(config);
      this._buildOnce();
      this._sync();
    }

    set hass(hass) {
      this._hass = hass;

      if (this._built) {
        try {
          if (this._slideEntity) this._slideEntity.hass = hass;
        } catch (e) {
          // ignore
        }
      }
    }

    _buildOnce() {
      if (this._built) return;
      this._built = true;

      const root = document.createElement("div");
      root.className = "form";

      const mkText = (label, key, type = "text", placeholder = "") => {
        const tf = document.createElement("ha-textfield");
        tf.label = label;
        tf.type = type;
        tf.placeholder = placeholder;
        tf.configValue = key;

        tf.addEventListener("input", (e) => this._onChange(e));
        tf.addEventListener("change", (e) => this._onChange(e));
        tf.addEventListener("value-changed", (e) => this._onChange(e));
        return tf;
      };

      const mkSwitch = (label, key) => {
        const ff = document.createElement("ha-formfield");
        ff.label = label;
        const sw = document.createElement("ha-switch");
        sw.configValue = key;
        sw.addEventListener("change", (e) => this._onChange(e));
        sw.addEventListener("value-changed", (e) => this._onChange(e));
        ff.appendChild(sw);
        return { wrap: ff, sw };
      };

      const mkSection = (title) => {
        const s = document.createElement("div");
        s.className = "section";
        const t = document.createElement("div");
        t.className = "section-title";
        t.innerText = title;
        s.appendChild(t);
        return s;
      };

      const normalizeHex = (v, allowEmpty) => {
        const s = String(v || "").trim();
        if (allowEmpty && s === "") return "";
        if (!/^#([0-9a-fA-F]{3}){1,2}$/.test(s)) return null;
        if (s.length === 4) {
          const r = s[1], g = s[2], b = s[3];
          return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
        }
        return s.toUpperCase();
      };

      const mkColor = (label, key, allowEmpty = false) => {
        const row = document.createElement("div");
        row.className = "colorRow";

        const tf = document.createElement("ha-textfield");
        tf.label = label;
        tf.placeholder = allowEmpty ? "(empty = default gray)" : "#RRGGBB";
        tf.configValue = key;
        tf.addEventListener("change", (e) => this._onChange(e));
        tf.addEventListener("value-changed", (e) => this._onChange(e));

        const btn = document.createElement("input");
        btn.type = "color";
        btn.className = "colorBtn";
        btn.dataset.configValue = key;

        btn.addEventListener("input", (e) => {
          // IMPORTANT: do NOT commit on every input while the native picker is open.
          // Committing triggers HA config updates which can close the picker when the user adjusts hue/palette.
          const val = String(e.target.value || "").toUpperCase();
          tf.value = val;
        });

        btn.addEventListener("change", (e) => {
          const val = String(e.target.value || "").toUpperCase();
          tf.value = val;
          this._commit(key, val);
        });

row._tf = tf;
        row._btn = btn;
        row._allowEmpty = allowEmpty;
        row._normalizeHex = normalizeHex;

        row.appendChild(tf);
        row.appendChild(btn);
        return row;
      };

      const mkEntityControl = (key) => {
        const hasSelector = !!customElements.get("ha-selector");
        if (hasSelector) {
          const sel = document.createElement("ha-selector");
          sel.label = "Entity";
          sel.configValue = key;
          sel.selector = { entity: {} };
          sel.addEventListener("value-changed", (e) => this._onChange(e));
          return sel;
        }
        const ep = document.createElement("ha-entity-picker");
        ep.label = "Entity";
        ep.allowCustomEntity = true;
        ep.configValue = key;
        ep.addEventListener("value-changed", (e) => this._onChange(e));
        return ep;
      };

      const mkSelect = (label, key, options) => {
        const sel = document.createElement("ha-select");
        sel.label = label;
        sel.configValue = key;

        options.forEach(([value, text]) => {
          const item = document.createElement("mwc-list-item");
          item.value = value;
          item.innerText = text;
          sel.appendChild(item);
        });

        const stop = (e) => e.stopPropagation();
        sel.addEventListener("click", stop);
        sel.addEventListener("opened", stop);
        sel.addEventListener("closed", stop);
        sel.addEventListener("keydown", stop);

        sel.addEventListener("value-changed", (e) => {
          e.stopPropagation();
          this._onChange(e);
        });

        sel.addEventListener("selected", (e) => {
          e.stopPropagation();
          // Some HA builds only emit "selected" for ha-select; ensure we persist.
          this._onChange({ target: sel, detail: { value: sel.value } });
        });

        return sel;
      };

      const mkIconPicker = (label, key) => {
        const ip = document.createElement("ha-icon-picker");
        ip.label = label;
        ip.configValue = key;
        ip.addEventListener("value-changed", (e) => this._onChange(e));
        return ip;
      };

      const mkButton = (text, onClick) => {
        const tag = customElements.get("ha-button") ? "ha-button" : "mwc-button";
        const b = document.createElement(tag);

        // Prefer attribute + textContent to support different HA/MWC builds
        b.setAttribute("raised", "");
        b.classList.add("asdcBtn");
        b.setAttribute("label", text);
        b.textContent = text; // fallback rendering

        b.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        });
        return b;
      };

      
       const cardTitle = document.createElement("div");
       cardTitle.className = "section-title badgesHeader";
       cardTitle.innerText = CARD_TAGLINE;
       root.appendChild(cardTitle);
      
      // ---------- Global ----------
      const secGlobal = mkSection("Global settings");

      this._elRenderStyle = mkSelect("Render style (global)", "render_style", [
        ["segment", "7-segment (digits)"],
        ["matrix", "Dot-matrix (text)"],
        ["plain", "Plain text"],
      ]);
      secGlobal.appendChild(this._elRenderStyle);

      this._elSize = mkText("Size (px) — 0 = Auto", "size_px", "number");
      secGlobal.appendChild(this._elSize);

      const { wrap: italWrap, sw: italSw } = mkSwitch("Italic (segment/plain)", "italic");
      this._elItalic = italSw;
      secGlobal.appendChild(italWrap);

      const { wrap: centerWrap, sw: centerSw } = mkSwitch("Center text", "center_text");
      this._elCenter = centerSw;
      secGlobal.appendChild(centerWrap);

      const { wrap: stWrap, sw: stSw } = mkSwitch("Show title", "show_title");
      this._elShowTitle = stSw;
      secGlobal.appendChild(stWrap);

      this._rowText = mkColor("Text color", "text_color");
      secGlobal.appendChild(this._rowText);

      this._rowTitle = mkColor("Title color", "title_color", true);
      secGlobal.appendChild(this._rowTitle);

      this._rowBg = mkColor("Background color", "background_color");
      secGlobal.appendChild(this._rowBg);

      const maxRow = document.createElement("div");
      maxRow.className = "twoCols";
      this._elMaxChars = mkText("Max chars", "max_chars", "number");
      maxRow.appendChild(this._elMaxChars);
            secGlobal.appendChild(maxRow);

      root.appendChild(secGlobal);

      // ---------- 7-segment options ----------
      const secSeg = mkSection("7-segment options");
      const { wrap: unusedWrap, sw: unusedSw } = mkSwitch("Show unused segments (faint)", "show_unused");
      this._elShowUnused = unusedSw;
      secSeg.appendChild(unusedWrap);
      this._rowUnused = mkColor("Unused segments color", "unused_color");
      secSeg.appendChild(this._rowUnused);
      root.appendChild(secSeg);

      // ---------- Dot-matrix options ----------
      const secMat = mkSection("Dot-matrix options");
      this._rowDotOff = mkColor("Dot OFF color", "matrix_dot_off_color");
      secMat.appendChild(this._rowDotOff);
      root.appendChild(secMat);

      // ---------- Color intervals ----------
      const secIntervals = mkSection("Color intervals");
      const intervalHeader = document.createElement("div");
      intervalHeader.className = "rowHeader";
      const h = document.createElement("div");
      h.innerText = "Intervals";
      intervalHeader.appendChild(h);

      const intervalBtns = document.createElement("div");
      intervalBtns.className = "btnRow";
      intervalBtns.appendChild(mkButton("Add", () => this._addInterval()));
      intervalHeader.appendChild(intervalBtns);

      secIntervals.appendChild(intervalHeader);

      this._intervalList = document.createElement("div");
      this._intervalList.className = "intervalList";
      secIntervals.appendChild(this._intervalList);
      root.appendChild(secIntervals);

      
      // ---------- Rows ----------
      const secRows = mkSection("Rows");
      const rowsHeader = document.createElement("div");
      rowsHeader.className = "rowHeader";
      const rh = document.createElement("div");
      rh.innerText = "Rows";
      rowsHeader.appendChild(rh);

      this._btnAddRow = mkButton("Add", () => this._addRow());
      this._btnUpRow  = mkButton("Move up", () => this._moveRow(-1));
      this._btnDownRow= mkButton("Move down", () => this._moveRow(1));
      this._btnDelRow = mkButton("Delete", () => this._deleteRow());

      const rowBtns = document.createElement("div");
      rowBtns.className = "btnRow";
      rowBtns.appendChild(this._btnAddRow);
      rowBtns.appendChild(this._btnUpRow);
      rowBtns.appendChild(this._btnDownRow);
      rowBtns.appendChild(this._btnDelRow);
      rowsHeader.appendChild(rowBtns);

      secRows.appendChild(rowsHeader);

      this._rowsList = document.createElement("div");
      this._rowsList.className = "rowsList";
      secRows.appendChild(this._rowsList);

      root.appendChild(secRows);

// ---------- Slides ----------
      const secSlides = mkSection("Slides");
      const slidesHeader = document.createElement("div");
      slidesHeader.className = "rowHeader";
      const sh = document.createElement("div");
      sh.innerText = "Slides";
      slidesHeader.appendChild(sh);

      this._btnAddSlide = mkButton("Add", () => this._addSlide());
      this._btnUpSlide  = mkButton("Move up", () => this._moveSlide(-1));
      this._btnDownSlide= mkButton("Move down", () => this._moveSlide(1));
      this._btnDelSlide = mkButton("Delete", () => this._deleteSlide());

      const slideBtns = document.createElement("div");
      slideBtns.className = "btnRow";
      slideBtns.appendChild(this._btnAddSlide);
      slideBtns.appendChild(this._btnUpSlide);
      slideBtns.appendChild(this._btnDownSlide);
      slideBtns.appendChild(this._btnDelSlide);
      slidesHeader.appendChild(slideBtns);

      secSlides.appendChild(slidesHeader);

      const body = document.createElement("div");
      body.className = "slidesBody";

      this._slidesList = document.createElement("div");
      this._slidesList.className = "slidesList";
      body.appendChild(this._slidesList);

      this._slideEditor = document.createElement("div");
      this._slideEditor.className = "slideEditor";
      body.appendChild(this._slideEditor);

      secSlides.appendChild(body);
      root.appendChild(secSlides);

      // ---------- Variables + Support ----------
      const secSupport = mkSection("Variables & Support");

      const varsHead = document.createElement("div");
      varsHead.className = "badgeVarsHelp";

      const varRow = [
        `<code>&lt;value&gt;</code> formatted value (incl. unit)`,
        `<code>&lt;state&gt;</code> raw state`,
        `<code>&lt;name&gt;</code> friendly name`,
        `<code>&lt;unit&gt;</code> unit`,
        `<code>&lt;entity_id&gt;</code> entity id`,
        `<code>&lt;domain&gt;</code> entity domain`,
        `<code>&lt;last_changed&gt;</code> local time`,
        `<code>&lt;last_updated&gt;</code> local time`,
        `<code>&lt;last_changed_rel&gt;</code> relative time`,
        `<code>&lt;last_updated_rel&gt;</code> relative time`,
        `<code>&lt;last_changed_iso&gt;</code> ISO time`,
        `<code>&lt;last_updated_iso&gt;</code> ISO time`,
        `<code>&lt;attr:xxx&gt;</code> any attribute, e.g. <code>&lt;attr:temperature&gt;</code>`
      ].join("<br/>");

      // Dot-matrix symbol tokens (usable in templates) (usable in templates)
      const symbolOrder = [
        ["x", "X"],
        ["stop", "stop"],
        ["rain", "rain"],
        ["ip", "ip:"],
        ["full", "full light segment"],
        ["calendar", "calendar"],
        ["windows", "windows"],
        ["clouds", "clouds"],
        ["door", "door"],
        ["female", "female"],
        ["snowflake", "snowflake"],
        ["key", "key"],
        ["male", "male"],
        ["alarm", "alarm"],
        ["clock", "clock"],
        ["garbage", "garbage"],
        ["info", "info"],
        ["moon", "moon"],
        ["message", "message"],
        ["reminder", "reminder"],
        ["wifi", "wifi"],
        ["rain_huge", "huge rain"],
        ["sun", "sun"],
        ["thunderstorm", "thunderstorm"],
        ["cloud", "cloud"],
        ["fog", "fog"],
        ["cloud_moon", "cloud and moon"],
        ["sun_cloud", "sun and cloud"],
        ["degree", "degree symbol"],
      ];

      const symCfg = {
        matrix_cols: 5,
        matrix_rows: 7,
        matrix_gap: 2,
        matrix_dot_on_color: "#00FF66",
        matrix_dot_off_color: "#221B1B",
      };

      const symbolRows = symbolOrder.map(([key, label]) => {
        const ch = MATRIX_ICON_TOKENS[key];
        const svg = ch ? svgForMatrixChar(ch, symCfg) : "";
        return `
          <div class="badgeSymRow">
            <div class="badgeSymKey"><code>&lt;${key}&gt;</code></div>
            <div class="badgeSymLabel">${label}</div>
            <div class="badgeSymPreview">${svg}</div>
          </div>
        `;
      }).join("");


      varsHead.innerHTML = `
        <div class="badgeVarsTitle">Variables you can use in templates, with or without your own text</div>
        <div class="badgeVarsList">${varRow}</div>
        <div class="badgeVarsExample"><b>Example:</b> Temperature: <code>&lt;value&gt;</code></div>

        
        <div class="badgeSymHelp">
          <div class="badgeSymTitle">Dot-matrix symbols you can use in templates</div>
          <div class="badgeSymHint">Use these placeholders in Title / Value template when <b>Render style</b> is <b>Dot-matrix (text)</b>.</div>
          <div class="badgeSymGrid">${symbolRows}</div>
        </div>

        <div class="badgeSupport">
          <div class="badgeSupportTitle">☕ Support the project</div>
          <div class="badgeSupportText">
            I’m a Home Automation enthusiast who spends late nights building custom cards and tools for Home Assistant.
            If you enjoy my work or use any of my cards, your support helps me keep improving and maintaining everything.
          </div>

          <div class="badgeSupportActions">
            <a class="badgeSupportImgLink" href="https://www.buymeacoffee.com/AndyBonde" target="_blank" rel="noopener noreferrer" aria-label="Buy me a coffee">
              <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="140" alt="Buy me a coffee">
            </a>
          </div>
        </div>
      `;

      secSupport.appendChild(varsHead);
      root.appendChild(secSupport);

      // Slide editor fields
      this._slideEntity = mkEntityControl("__slide_entity");
      this._slideEditor.appendChild(this._slideEntity);

      this._slideTitle = mkText("Title (required)", "__slide_title");
      this._slideEditor.appendChild(this._slideTitle);

      this._slideTitleIcon = mkIconPicker("Title icon (optional)", "__slide_title_icon");
      this._slideEditor.appendChild(this._slideTitleIcon);

      this._slideTitleIconAlign = mkSelect("Title icon align", "__slide_title_icon_align", [
        ["left", "Left"],
        ["right", "Right"],
      ]);
      this._slideEditor.appendChild(this._slideTitleIconAlign);


      this._slideTitleIconGap = mkText("Title icon gap (px)", "__slide_title_icon_gap", "number", "6");
      this._slideEditor.appendChild(this._slideTitleIconGap);

      const mkSlideColor = (label, key, allowEmpty = true) => {
        const row = document.createElement("div");
        row.className = "colorRow";

        const tf = document.createElement("ha-textfield");
        tf.label = label;
        tf.type = "text";
        tf.placeholder = allowEmpty ? "(empty = default)" : "#RRGGBB";
        tf.configValue = key;

        tf.addEventListener("input", (e) => this._onChange(e));
        tf.addEventListener("change", (e) => this._onChange(e));
        tf.addEventListener("value-changed", (e) => this._onChange(e));

        const btn = document.createElement("input");
        btn.type = "color";
        btn.className = "colorBtn";
        btn.addEventListener("input", (e) => {
          tf.value = String(e.target.value || "");
          this._onChange({ target: tf });
        });

        row.appendChild(tf);
        row.appendChild(btn);
        return row;
      };

      this._slideTitleTextColor = mkSlideColor("Title text color (optional)", "__slide_title_text_color", true);
      this._slideEditor.appendChild(this._slideTitleTextColor);

      this._slideTitleIconColor = mkSlideColor("Title icon color (optional)", "__slide_title_icon_color", true);
      this._slideEditor.appendChild(this._slideTitleIconColor);


      const secNum = mkSection("Numeric formatting (slide)");
      this._slideDecimals = mkText("Decimals (manual) (empty = keep original)", "__slide_decimals", "number", "");
      secNum.appendChild(this._slideDecimals);

      this._slideAutoDecimals = mkText("Auto limit decimals (empty = disabled)", "__slide_auto_decimals", "number", "");
      secNum.appendChild(this._slideAutoDecimals);

      const { wrap: lzWrap, sw: lzSw } = mkSwitch("Leading zero (e.g. .5 → 0.5)", "__slide_leading_zero");
      this._slideLeadingZero = lzSw;
      secNum.appendChild(lzWrap);

      const { wrap: unitWrap, sw: unitSw } = mkSwitch("Show unit (e.g. °C)", "__slide_show_unit");
      this._slideShowUnit = unitSw;
      secNum.appendChild(unitWrap);

      this._slideEditor.appendChild(secNum);

      const secTextTpl = mkSection("Value / text (slide)");
      this._slideTpl = mkText("Value template (use <value>)", "__slide_value_template", "text", "<value>");
      secTextTpl.appendChild(this._slideTpl);
      this._slideEditor.appendChild(secTextTpl);

      // Dot-matrix progress bar
      const secProg = mkSection("Dot-matrix progress bar (slide)");
      const { wrap: pbWrap, sw: pbSw } = mkSwitch("Render numeric value as a progress bar (fills dots)", "__slide_matrix_progress");
      this._slideMatrixProgress = pbSw;
      secProg.appendChild(pbWrap);

      this._slideProgMin = mkText("Progress min", "__slide_progress_min", "number", "0");
      secProg.appendChild(this._slideProgMin);
      this._slideProgMax = mkText("Progress max", "__slide_progress_max", "number", "100");
      secProg.appendChild(this._slideProgMax);

      this._slideProgColorMode = mkSelect("Progressbar colors", "__slide_progress_color_mode", [
        ["active", "Use active interval color"],
        ["intervals", "Use all interval colors"],
      ]);
      secProg.appendChild(this._slideProgColorMode);

      this._slideEditor.appendChild(secProg);

      const secSlideIntervals = mkSection("Color intervals (slide override)");
      const intervalHead = document.createElement("div");
      intervalHead.className = "rowHead";
      const btnAdd = mkButton("Add", () => this._addSlideInterval());
      intervalHead.appendChild(btnAdd);
      secSlideIntervals.appendChild(intervalHead);

      this._slideIntervalList = document.createElement("div");
      this._slideIntervalList.className = "intervalList";
      secSlideIntervals.appendChild(this._slideIntervalList);

      this._slideEditor.appendChild(secSlideIntervals);

      const secSwitch = mkSection("Slide switch settings");
      this._slideStay = mkText("Stay seconds", "__slide_stay_s", "number", "3");
      secSwitch.appendChild(this._slideStay);
      this._slideOut = mkText("Out seconds", "__slide_out_s", "number", "0.5");
      secSwitch.appendChild(this._slideOut);
      this._slideIn = mkText("In seconds", "__slide_in_s", "number", "0.5");
      secSwitch.appendChild(this._slideIn);

      const { wrap: fadeWrap, sw: fadeSw } = mkSwitch("Fade toggle", "__slide_fade");
      this._slideFade = fadeSw;
      secSwitch.appendChild(fadeWrap);

      const { wrap: asWrap, sw: asSw } = mkSwitch("Animate single slide", "__slide_animate_single");
      this._slideAnimateSingle = asSw;
      this._animateSingleWrap = asWrap;
      secSwitch.appendChild(asWrap);

      this._slideShowStyle = mkSelect("Show style", "__slide_show_style", [
        ["running", "Running"],
        ["run_left", "Left"],
        ["run_top", "Top"],
        ["run_right", "Right"],
        ["run_bottom", "Bottom"],
        ["billboard", "Billboard"],
        ["matrix", "Matrix"],
      ]);
      secSwitch.appendChild(this._slideShowStyle);

      this._slideHideStyle = mkSelect("Hide style", "__slide_hide_style", [
        ["run_left", "Left"],
        ["run_top", "Top"],
        ["run_right", "Right"],
        ["run_bottom", "Bottom"],
        ["billboard", "Billboard"],
        ["matrix", "Matrix"],
      ]);
      this._hideStyleWrap = document.createElement("div");
      this._hideStyleWrap.appendChild(this._slideHideStyle);
      secSwitch.appendChild(this._hideStyleWrap);

      const { wrap: hpWrap, sw: hpSw } = mkSwitch("Hide previous slide first", "__slide_hide_prev_first");
      this._slideHidePrevFirst = hpSw;
      this._hidePrevWrap = hpWrap;
      secSwitch.appendChild(hpWrap);

      this._slideEditor.appendChild(secSwitch);

      const style = document.createElement("style");
      style.textContent = `
        .form { display:flex; flex-direction:column; gap:12px; padding:8px 0; }
        mwc-button.asdcBtn{
          --mdc-theme-primary: var(--primary-color, #03A9F4);
          --mdc-theme-on-primary: #FFFFFF;
        }
        mwc-button.asdcBtn[disabled]{
          opacity: .55;
        }

        .section { border-top:1px solid rgba(0,0,0,0.10); padding-top:10px; margin-top:6px; display:flex; flex-direction:column; gap:10px; }
        .section-title-old { font-size:12px; opacity:.75; letter-spacing:.2px; }
        
        .section-title{
         background: color-mix(in srgb, var(--warning-color, #ff9800) 22%, transparent);
         padding: 8px 10px;
         border-radius: 12px;
         border: 1px solid color-mix(in srgb, var(--warning-color, #ff9800) 55%, transparent);
         font-weight: 800;
         opacity: 0.98;
         color: var(--primary-text-color);
        }
        

        .colorRow { display:flex; align-items:flex-end; gap:10px; }
        .colorRow ha-textfield { flex: 1 1 auto; }

        .colorBtn{
          width: 44px;
          height: 38px;
          padding: 0;
          border: 1px solid rgba(0,0,0,0.25);
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
        }

        .rowHeader{
          display:flex;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
        }
        .btnRow{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          margin-left:auto;
        }
        .rowHeader > div:first-child{
          font-size: 13px;
          opacity: .85;
          padding: 4px 0;
        }

        .twoCols{
          display:grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items:end;
        }
        .twoCols ha-formfield{
          padding-bottom: 8px;
        }

        .intervalList{
          display:flex;
          flex-direction:column;
          gap:8px;
        }
        .intervalRow{
          display:grid;
          grid-template-columns: 1fr 1fr 1.2fr auto;
          gap:10px;
          align-items:end;
        }
        .intervalRow mwc-icon-button{
          margin-bottom: 6px;
        }

        .slidesBody{
          display:flex;
          flex-direction:column;
          gap: 12px;
          align-items:stretch;
        }
        .slidesList{
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 10px;
          overflow:auto;
          max-height: 240px;
        }

        .rowsList{
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 10px;
          overflow:auto;
          max-height: 200px;
        }
        .rowItem{
          padding: 10px 12px;
          cursor:pointer;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 12px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .rowItem:last-child{ border-bottom:none; }
        .rowItem.active{
          background: color-mix(in srgb, var(--primary-color, #03A9F4) 18%, transparent);
          font-weight: 800;
        }
        .slideItem{
          padding: 10px 12px;
          cursor:pointer;
          user-select:none;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          font-size: 13px;
          opacity: .9;
          display:flex;
          justify-content:space-between;
          gap:8px;
        }
        .slideItem:last-child{ border-bottom:none; }
        .slideItem.active{
          background: rgba(3, 169, 244, 0.12);
          opacity: 1;
        }
        .slideItem small{
          opacity:.65;
        }
        .slideEditor{
          display:flex;
          flex-direction:column;
          gap:10px;
        }
        @media (max-width: 900px){
          .slidesBody{ grid-template-columns: 1fr; }
        }

        .badgeVarsHelp{
          margin-top: 6px;
          padding: 10px 10px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgba(0,0,0,0.03);
        }
        .badgeVarsTitle{
          font-weight: 800;
          margin-bottom: 6px;
        }
        .badgeVarsList{
          line-height: 1.35;
          font-size: 0.92em;
          opacity: 0.92;
        }
        .badgeVarsList code{
          background: rgba(0,0,0,0.06);
          padding: 1px 4px;
          border-radius: 6px;
        }
        .badgeVarsExample{
          margin-top: 10px;
          font-size: 0.92em;
          opacity: 0.95;
        }

        
      .badgeSymHelp{
        margin-top: 14px;
        padding: 10px 10px;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,0.12);
        background: rgba(0,0,0,0.03);
      }
      .badgeSymTitle{
        font-weight: 800;
        margin-bottom: 4px;
      }
      .badgeSymHint{
        opacity: 0.85;
        font-size: 0.92em;
        margin-bottom: 10px;
        line-height: 1.35;
      }
      .badgeSymGrid{
        display: grid;
        grid-template-columns: 1fr;
        gap: 6px;
      }
      .badgeSymRow{
        display: grid;
        grid-template-columns: 140px 1fr 60px;
        gap: 10px;
        align-items: center;
        padding: 6px 8px;
        border-radius: 10px;
        background: rgba(0,0,0,0.04);
      }
      .badgeSymKey code{
        font-size: 0.95em;
      }
      .badgeSymLabel{
        opacity: 0.9;
      }
      .badgeSymPreview svg.char{
        height: 18px;
        width: auto;
        display: block;
      }
      .badgeSymPreview .dot.on{
        fill: var(--asdc-dot-on, #00FF66);
      }
      .badgeSymPreview .dot.off{
        fill: var(--asdc-dot-off, #221B1B);
      }
      @media (max-width: 520px){
        .badgeSymRow{
          grid-template-columns: 130px 1fr 52px;
        }
      }

      .badgeSupport{
          margin-top: 12px;
          padding: 10px 10px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgba(0,0,0,0.03);
        }
        .badgeSupportTitle{
          font-weight: 800;
          margin-bottom: 6px;
        }
        .badgeSupportText{
          opacity: 0.9;
          line-height: 1.35;
          font-size: 0.92em;
          margin-bottom: 10px;
        }
        .badgeSupportActions{
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .badgeSupportLink{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          padding: 0 12px;
          border-radius: 10px;
          font-weight: 800;
          text-decoration: none;

          background: var(--primary-color);
          color: #fff;
          border: 1px solid rgba(0,0,0,0.25);
        }
        .badgeSupportLink:hover{
          filter: brightness(1.05);
        }
        .badgeSupportImgLink img{
          display: block;
          height: 32px;
          width: auto;
          border-radius: 10px;
        }
      `;

      this.innerHTML = "";
      this.appendChild(style);
      this.appendChild(root);
    }

    _syncColor(row, value) {
      const allowEmpty = !!row._allowEmpty;
      const norm = row._normalizeHex(value, allowEmpty);
      const v = norm === null ? (allowEmpty ? "" : "#000000") : norm;

      row._tf.value = v;
      row._btn.value = v && v !== "" ? v : "#000000";
      row._btn.style.opacity = (v && v !== "") ? "1" : "0.35";
    }

    _sync() {
      if (!this._config) return;

      // Global
      this._elRenderStyle.value = this._config.render_style || "segment";
      this._elSize.value = String(this._config.size_px ?? 0);

      this._elItalic.checked = !!this._config.italic;
      this._elCenter.checked = !!this._config.center_text;

      this._elShowTitle.checked = (this._config.show_title !== false);

      const isMatrix = (this._config.render_style === "matrix");
      this._elItalic.disabled = isMatrix;

      this._elMaxChars.value = String(this._config.max_chars ?? DEFAULTS_GLOBAL.max_chars);

      this._elShowUnused.checked = !!this._config.show_unused;

      this._syncColor(this._rowText, this._config.text_color);
      this._syncColor(this._rowTitle, this._config.title_color);
      this._syncColor(this._rowBg, this._config.background_color);
      this._syncColor(this._rowUnused, this._config.unused_color);
      this._syncColor(this._rowDotOff, this._config.matrix_dot_off_color);

      // Show/hide sections based on style
      const st = this._config.render_style || "segment";
      this._elShowUnused.closest(".section").style.display = (st === "segment") ? "flex" : "none";
      this._rowDotOff.closest(".section").style.display = (st === "matrix") ? "flex" : "none";

      // Intervals + Slides
      this._renderIntervals();

      if (!Array.isArray(this._config.rows) || this._config.rows.length === 0) {
        const baseSlides = (Array.isArray(this._config.slides) && this._config.slides.length)
          ? this._config.slides
          : [{ ...DEFAULT_SLIDE, title: "Slide 1" }];
        this._config.rows = [{ slides: baseSlides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) }];
      } else {
        this._config.rows = this._config.rows.map(r => {
          const slides = (Array.isArray(r?.slides) && r.slides.length)
            ? r.slides
            : [{ ...DEFAULT_SLIDE, title: "Slide 1" }];
          return { ...(r || {}), slides: slides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) };
        });
      }

      if (typeof this._activeRow !== "number") this._activeRow = 0;
      this._activeRow = clampInt(this._activeRow, 0, this._config.rows.length - 1);

      // Present the currently selected row's slides in the existing slides editor
      this._config.slides = this._config.rows[this._activeRow].slides;

      if (!Array.isArray(this._config.slides) || this._config.slides.length === 0) {
        this._config.slides = [{ ...DEFAULT_SLIDE, title: "Slide 1" }];
        this._config.rows[this._activeRow].slides = this._config.slides;
      }

      if (typeof this._activeSlide !== "number") this._activeSlide = 0;
      this._activeSlide = clampInt(this._activeSlide, 0, this._config.slides.length - 1);

      this._renderRowsList();
      this._syncRowButtons();

      this._renderSlidesList();
      this._syncSlideEditor();
      this._syncSlideButtons();
    }

    _syncSlideButtons() {
      const n = (this._config.slides || []).length;
      const i = this._activeSlide || 0;
      this._btnUpSlide.disabled = (i <= 0);
      this._btnDownSlide.disabled = (i >= n - 1);
      this._btnDelSlide.disabled = (n <= 1);
    }

    _renderRowsList() {
      this._rowsList.innerHTML = "";
      const rows = Array.isArray(this._config.rows) ? this._config.rows : [];
      rows.forEach((r, idx) => {
        const item = document.createElement("div");
        item.className = `rowItem ${idx === this._activeRow ? "active" : ""}`;
        const isDef = !!r?.is_default;
        const title = isDef ? "Row (default)" : `Row ${idx + 1}`;
        const slidesCount = Array.isArray(r?.slides) ? r.slides.length : 0;
        item.innerHTML = `<div>${title}<br><small>${slidesCount} slide${slidesCount === 1 ? "" : "s"}</small></div><div>›</div>`;
        item.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Persist current edited slides back into current row before switching
          if (Array.isArray(this._config.rows) && this._config.rows[this._activeRow]) {
            this._config.rows[this._activeRow].slides = this._config.slides || [];
          }
          this._activeRow = idx;
          this._activeSlide = 0;
          // Switch top-level slides view to selected row
          if (this._config.rows && this._config.rows[idx]) {
            this._config.slides = this._config.rows[idx].slides || [];
          }
          this._sync();
        });
        this._rowsList.appendChild(item);
      });
    }

    _syncRowButtons() {
      const rows = Array.isArray(this._config.rows) ? this._config.rows : [];
      const n = rows.length;
      const idx = clampInt(this._activeRow || 0, 0, Math.max(0, n - 1));

      const canMoveUp = n > 1 && idx > 0;
      const canMoveDown = n > 1 && idx < n - 1;
      const isDef = !!rows[idx]?.is_default;
      const canDelete = n > 1 && !isDef;

      this._btnUpRow.disabled = !canMoveUp;
      this._btnDownRow.disabled = !canMoveDown;
      this._btnDelRow.disabled = !canDelete;
    }

    _addRow() {
      const next = { ...this._config };
      // Ensure rows exists
      let rows = Array.isArray(next.rows) && next.rows.length ? next.rows.map(r => ({ ...(r || {}), slides: (r?.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) })) : [];
      if (!rows.length) {
        rows = [{ is_default: true, slides: (next.slides || [{ ...DEFAULT_SLIDE }]).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) }];
      }
      if (!rows.some(r => r && r.is_default)) rows[0].is_default = true;

      // Persist current edited slides into active row
      const ar = clampInt(this._activeRow || 0, 0, rows.length - 1);
      rows[ar] = { ...(rows[ar] || {}), slides: (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) };

      // Create new row inheriting current row's slides
      const inheritSlides = (rows[ar].slides && rows[ar].slides.length)
        ? rows[ar].slides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }))
        : [{ ...DEFAULT_SLIDE, title: "Slide 1" }];

      rows.push({ is_default: false, slides: inheritSlides });

      next.rows = rows;
      // Switch active row to new row
      this._activeRow = rows.length - 1;
      this._activeSlide = 0;
      next.slides = rows[this._activeRow].slides;

      this._commitFull(next);
    }

    _moveRow(dir) {
      const next = { ...this._config };
      let rows = Array.isArray(next.rows) ? next.rows.map(r => ({ ...(r || {}), slides: (r?.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) })) : [];
      if (!rows.length) return;

      if (!rows.some(r => r && r.is_default)) rows[0].is_default = true;

      const from = clampInt(this._activeRow || 0, 0, rows.length - 1);
      const to = clampInt(from + dir, 0, rows.length - 1);
      if (from === to) return;

      // Persist current edited slides into active row before moving
      rows[from] = { ...(rows[from] || {}), slides: (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) };

      const tmp = rows[from];
      rows[from] = rows[to];
      rows[to] = tmp;

      next.rows = rows;
      this._activeRow = to;
      this._activeSlide = 0;
      next.slides = rows[to].slides;

      this._commitFull(next);
    }

    _deleteRow() {
      const next = { ...this._config };
      let rows = Array.isArray(next.rows) ? next.rows.map(r => ({ ...(r || {}), slides: (r?.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) })) : [];
      if (rows.length <= 1) return;

      if (!rows.some(r => r && r.is_default)) rows[0].is_default = true;

      const idx = clampInt(this._activeRow || 0, 0, rows.length - 1);
      if (rows[idx]?.is_default) return; // default row cannot be deleted

      // Persist current edited slides into active row before deleting (if deleting another row we don't care, but safe)
      rows[idx] = { ...(rows[idx] || {}), slides: (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) };

      rows.splice(idx, 1);
      next.rows = rows;

      this._activeRow = clampInt(Math.min(idx, rows.length - 1), 0, rows.length - 1);
      this._activeSlide = 0;
      next.slides = rows[this._activeRow].slides;

      this._commitFull(next);
    }



    _renderSlidesList() {
      this._slidesList.innerHTML = "";
      (this._config.slides || []).forEach((s, idx) => {
        const item = document.createElement("div");
        item.className = `slideItem ${idx === this._activeSlide ? "active" : ""}`;
        const title = (s.title && String(s.title).trim()) ? String(s.title).trim() : `Slide ${idx + 1}`;
        const ent = s.entity ? String(s.entity) : "";
        item.innerHTML = `<div>${title}<br><small>${ent}</small></div><div>›</div>`;
        item.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._activeSlide = idx;
          this._sync();
        });
        this._slidesList.appendChild(item);
      });
    }


    _addSlideInterval() {
      const next = { ...this._config };
      const slides = (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
      const idx = clampInt(this._activeSlide || 0, 0, slides.length - 1);
      const s = { ...slides[idx] };

      const list = Array.isArray(s.color_intervals) ? [...s.color_intervals] : [];
      list.push({
        from: 0,
        to: 0,
        color: String(this._config.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase(),
      });

      s.color_intervals = list;
      slides[idx] = s;
      next.slides = slides;
      this._commitFull(next);
      this._sync();
    }

    _renderSlideIntervals() {
      if (!this._slideIntervalList) return;
      const slides = this._config.slides || [];
      const s = slides[this._activeSlide] || { ...DEFAULT_SLIDE };
      const intervals = Array.isArray(s.color_intervals) ? s.color_intervals : [];

      const list = this._slideIntervalList;
      list.innerHTML = "";

      intervals.forEach((it, idx) => {
        const row = document.createElement("div");
        row.className = "intervalRow";

        const from = document.createElement("ha-textfield");
        from.label = "Value from";
        from.type = "number";
        from.value = (typeof it.from === "number" || typeof it.from === "string") ? String(it.from) : "";
        from.dataset.slideIntervalIndex = String(idx);
        from.dataset.slideIntervalKey = "from";
        from.addEventListener("change", (e) => this._onSlideIntervalChange(e));
        from.addEventListener("value-changed", (e) => this._onSlideIntervalChange(e));

        const to = document.createElement("ha-textfield");
        to.label = "To";
        to.type = "number";
        to.value = (typeof it.to === "number" || typeof it.to === "string") ? String(it.to) : "";
        to.dataset.slideIntervalIndex = String(idx);
        to.dataset.slideIntervalKey = "to";
        to.addEventListener("change", (e) => this._onSlideIntervalChange(e));
        to.addEventListener("value-changed", (e) => this._onSlideIntervalChange(e));

        const colorRow = document.createElement("div");
        colorRow.className = "colorRow";
        const tf = document.createElement("ha-textfield");
        tf.label = "Color";
        tf.value = String(it.color || this._config.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase();
        tf.dataset.slideIntervalIndex = String(idx);
        tf.dataset.slideIntervalKey = "color";
        tf.addEventListener("change", (e) => this._onSlideIntervalChange(e));
        tf.addEventListener("value-changed", (e) => this._onSlideIntervalChange(e));

        const btn = document.createElement("input");
        btn.type = "color";
        btn.className = "colorBtn";
        btn.value = (tf.value && /^#/.test(tf.value)) ? tf.value : "#000000";
        btn.addEventListener("input", (e) => {
          const v = String(e.target.value || "").toUpperCase();
          tf.value = v;
        });
        btn.addEventListener("change", (e) => {
          const v = String(e.target.value || "").toUpperCase();
          tf.value = v;
          this._setSlideIntervalValue(idx, "color", v, /*noSync*/ true);
        });
        colorRow.appendChild(tf);
        colorRow.appendChild(btn);

        const delTag = customElements.get("ha-button") ? "ha-button" : "mwc-button";
        const del = document.createElement(delTag);
        del.setAttribute("raised","");
        del.classList.add("asdcBtn");
        del.setAttribute("label","Delete");
        del.textContent = "Delete";
        del.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const next = { ...this._config };
          const slides = (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
          const si = clampInt(this._activeSlide || 0, 0, slides.length - 1);
          const ss = { ...slides[si] };
          const arr = Array.isArray(ss.color_intervals) ? [...ss.color_intervals] : [];
          arr.splice(idx, 1);
          ss.color_intervals = arr;
          slides[si] = ss;
          next.slides = slides;
          this._commitFull(next);
          this._sync();
        });

        row.appendChild(from);
        row.appendChild(to);
        row.appendChild(colorRow);
        row.appendChild(del);
        list.appendChild(row);
      });
    }

    _onSlideIntervalChange(ev) {
      const target = ev.target;
      const idx = Number(target?.dataset?.slideIntervalIndex);
      const key = String(target?.dataset?.slideIntervalKey || "");
      if (!Number.isFinite(idx) || !key) return;

      const raw = this._eventValue(ev, target);
      if (key === "color") {
        const norm = this._rowText._normalizeHex(raw, false);
        if (norm === null) return;
        this._setSlideIntervalValue(idx, key, norm, /*noSync*/ true);
        return;
      }

      const num = (raw === "" || raw === null || typeof raw === "undefined") ? null : Number(raw);
      const val = Number.isFinite(num) ? num : null;
      this._setSlideIntervalValue(idx, key, val, /*noSync*/ true);
    }

    _setSlideIntervalValue(idx, key, value, noSync = false) {
      const next = { ...this._config };
      const slides = (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
      const si = clampInt(this._activeSlide || 0, 0, slides.length - 1);
      const s = { ...slides[si] };
      const intervals = Array.isArray(s.color_intervals) ? [...s.color_intervals] : [];
      const it = { ...(intervals[idx] || {}) };
      it[key] = value;
      intervals[idx] = it;
      s.color_intervals = intervals;
      slides[si] = s;
      next.slides = slides;

      this._commitFull(next);
      if (!noSync) this._sync();
    }
    _renderIntervals() {
      const list = this._intervalList;
      list.innerHTML = "";
      const intervals = Array.isArray(this._config.color_intervals) ? this._config.color_intervals : [];
      intervals.forEach((it, idx) => {
        const row = document.createElement("div");
        row.className = "intervalRow";

        const from = document.createElement("ha-textfield");
        from.label = "Value from";
        from.type = "number";
        from.value = (typeof it.from === "number" || typeof it.from === "string") ? String(it.from) : "";
        from.dataset.intervalIndex = String(idx);
        from.dataset.intervalKey = "from";
        from.addEventListener("change", (e) => this._onIntervalChange(e));
        from.addEventListener("value-changed", (e) => this._onIntervalChange(e));

        const to = document.createElement("ha-textfield");
        to.label = "To";
        to.type = "number";
        to.value = (typeof it.to === "number" || typeof it.to === "string") ? String(it.to) : "";
        to.dataset.intervalIndex = String(idx);
        to.dataset.intervalKey = "to";
        to.addEventListener("change", (e) => this._onIntervalChange(e));
        to.addEventListener("value-changed", (e) => this._onIntervalChange(e));

        const colorRow = document.createElement("div");
        colorRow.className = "colorRow";
        const tf = document.createElement("ha-textfield");
        tf.label = "Color";
        tf.value = String(it.color || this._config.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase();
        tf.dataset.intervalIndex = String(idx);
        tf.dataset.intervalKey = "color";
        tf.addEventListener("change", (e) => this._onIntervalChange(e));
        tf.addEventListener("value-changed", (e) => this._onIntervalChange(e));

        const btn = document.createElement("input");
        btn.type = "color";
        btn.className = "colorBtn";
        btn.value = (tf.value && /^#/.test(tf.value)) ? tf.value : "#000000";
        btn.addEventListener("input", (e) => {
          const v = String(e.target.value || "").toUpperCase();
          tf.value = v;
          // no commit while picker is open
        });
        btn.addEventListener("change", (e) => {
          const v = String(e.target.value || "").toUpperCase();
          tf.value = v;
          this._setIntervalValue(idx, "color", v, /*noSync*/ true);
        });
        colorRow.appendChild(tf);
        colorRow.appendChild(btn);

        const delTag = customElements.get("ha-button") ? "ha-button" : "mwc-button";
        const del = document.createElement(delTag);
        del.setAttribute("raised","");
        del.classList.add("asdcBtn");
        del.setAttribute("label","Delete");
        del.textContent = "Delete";
        del.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._deleteInterval(idx);
        });

        row.appendChild(from);
        row.appendChild(to);
        row.appendChild(colorRow);
        row.appendChild(del);

        list.appendChild(row);
      });
    }

    _syncSlideEditor() {
      const slides = this._config.slides || [];
      const s = slides[this._activeSlide] || { ...DEFAULT_SLIDE };

      if (this._hass) {
        this._slideEntity.hass = this._hass;
      }
      this._slideEntity.value = s.entity || "";

      this._slideTitle.value = s.title || "";

      if (this._slideTitleIcon && this._hass) this._slideTitleIcon.hass = this._hass;
      if (this._slideTitleIcon) this._slideTitleIcon.value = s.title_icon || "";
      if (this._slideTitleIconAlign) this._slideTitleIconAlign.value = s.title_icon_align || "left";

      if (this._slideTitleIconGap) this._slideTitleIconGap.value = (s.title_icon_gap === null || s.title_icon_gap === undefined) ? "6" : String(s.title_icon_gap);

      if (this._slideTitleTextColor) {
        const tf = this._slideTitleTextColor.querySelector("ha-textfield");
        const btn = this._slideTitleTextColor.querySelector("input[type=color]");
        const val = s.title_text_color || "";
        if (tf) tf.value = val;
        if (btn && /^#([0-9a-f]{6})$/i.test(val)) btn.value = val;
      }

      if (this._slideTitleIconColor) {
        const tf = this._slideTitleIconColor.querySelector("ha-textfield");
        const btn = this._slideTitleIconColor.querySelector("input[type=color]");
        const val = s.title_icon_color || "";
        if (tf) tf.value = val;
        if (btn && /^#([0-9a-f]{6})$/i.test(val)) btn.value = val;
      }

      this._slideDecimals.value = (s.decimals === null || s.decimals === undefined) ? "" : String(s.decimals);
      this._slideAutoDecimals.value = (s.auto_decimals === null || s.auto_decimals === undefined) ? "" : String(s.auto_decimals);

      this._slideLeadingZero.checked = s.leading_zero !== false;
      this._slideShowUnit.checked = !!s.show_unit;

      this._slideTpl.value = s.value_template || "<value>";

      // Dot-matrix progress bar (slide)
      if (this._slideMatrixProgress) this._slideMatrixProgress.checked = !!s.matrix_progress;
      if (this._slideProgMin) this._slideProgMin.value = String((s.progress_min ?? 0));
      if (this._slideProgMax) this._slideProgMax.value = String((s.progress_max ?? 100));
      if (this._slideProgColorMode) this._slideProgColorMode.value = s.progress_color_mode || "active";
      if (this._slideProgMin && this._slideProgMin.closest(".section")) {
        const stp = (this._config.render_style || "segment");
        this._slideProgMin.closest(".section").style.display = (stp === "matrix") ? "" : "none";
      }


      this._slideStay.value = String(s.stay_s ?? DEFAULT_SLIDE.stay_s);
      this._slideOut.value  = String(s.out_s ?? DEFAULT_SLIDE.out_s);
      this._slideIn.value   = String(s.in_s ?? DEFAULT_SLIDE.in_s);

      this._slideFade.checked = !!s.fade;
      this._slideAnimateSingle.checked = !!s.animate_single;
      const onlyOne = (this._config?.slides?.length === 1);
      if (this._animateSingleWrap) this._animateSingleWrap.style.display = onlyOne ? "" : "none";
      this._slideShowStyle.value = s.show_style || DEFAULT_SLIDE.show_style;
      this._slideHideStyle.value = s.hide_style || DEFAULT_SLIDE.hide_style;

      const isRunning = (this._slideShowStyle.value === "running");
      if (isRunning) {
        this._slideHideStyle.value = "run_right";
        if (this._hideStyleWrap) this._hideStyleWrap.style.display = "none";
        if (this._hidePrevWrap) this._hidePrevWrap.style.display = "none";
      } else {
        if (this._hideStyleWrap) this._hideStyleWrap.style.display = "";
        if (this._hidePrevWrap) this._hidePrevWrap.style.display = "";
      }
      this._slideHidePrevFirst.checked = !!s.hide_prev_first;

      const st = this._config.render_style || "segment";
      const tplDisabled = (st === "segment");
      this._slideTpl.disabled = tplDisabled;
      this._slideTpl.label = tplDisabled ? "Value template (not used in 7-segment)" : "Value template (use <value>)";

      this._renderSlideIntervals();
    }
    _commit(key, value) {
      const next = { ...(this._config || DEFAULTS_GLOBAL), ...(this._origType ? { type: this._origType } : {}), [key]: value };
      next.color_intervals = this._config.color_intervals || [];

      // Preserve / normalize rows
      if (!Array.isArray(this._config.rows) || this._config.rows.length === 0) {
        const baseSlides = this._config.slides || [{ ...DEFAULT_SLIDE, title:"Slide 1" }];
        next.rows = [{ slides: baseSlides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) }];
      } else {
        next.rows = this._config.rows.map(r => {
          const slides = (Array.isArray(r?.slides) && r.slides.length) ? r.slides : [{ ...DEFAULT_SLIDE, title:"Slide 1" }];
          return { ...(r || {}), slides: slides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) };
        });
      }

      // Canonical top-level slides mirrors Row 1
      next.slides = next.rows[0].slides;

      this._config = next;

      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      }));
    }

    _commitFull(nextConfig) {
      if (this._origType && !nextConfig.type) nextConfig.type = this._origType;

      // Ensure rows exist
      let rows = [];
      if (Array.isArray(nextConfig.rows) && nextConfig.rows.length) {
        rows = nextConfig.rows.map(r => {
          const slides = (Array.isArray(r?.slides) && r.slides.length) ? r.slides : [{ ...DEFAULT_SLIDE, title:"Slide 1" }];
          return { ...(r || {}), slides: slides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) };
        });
      } else {
        const baseSlides = (Array.isArray(nextConfig.slides) && nextConfig.slides.length)
          ? nextConfig.slides
          : [{ ...DEFAULT_SLIDE, title:"Slide 1" }];
        rows = [{ is_default: true, slides: baseSlides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) }];
      }

      // Ensure exactly one default row flag exists (movable but not deletable)
      if (!rows.some(r => r && r.is_default)) {
        if (rows[0]) rows[0].is_default = true;
      }
      const ar = clampInt(this._activeRow || 0, 0, rows.length - 1);
      const activeSlides = (Array.isArray(nextConfig.slides) && nextConfig.slides.length)
        ? nextConfig.slides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }))
        : [{ ...DEFAULT_SLIDE, title:"Slide 1" }];

      rows[ar] = { ...(rows[ar] || {}), slides: activeSlides };
      nextConfig.rows = rows;

      // Canonical top-level slides mirrors Row 1 (backward compatibility)
      const defRow = rows.find(r => r && r.is_default) || rows[0];
      nextConfig.slides = (defRow && Array.isArray(defRow.slides)) ? defRow.slides : rows[0].slides;

      this._config = nextConfig;
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: nextConfig },
        bubbles: true,
        composed: true,
      }));
    }

    _eventValue(ev, target) {
      if (ev && ev.detail && typeof ev.detail.value !== "undefined") return ev.detail.value;
      return target.value;
    }

    _onChange(ev) {
      const target = ev.target;
      const key = target.configValue || target.dataset?.configValue;
      if (!key) return;

      // Route slide-scoped editor fields through the slide handler
      if (String(key).startsWith("__slide_")) {
        return this._onSlideChange(String(key), ev);
      }

      if (typeof target.checked !== "undefined") {
        if (key === "italic" || key === "center_text" || key === "show_unused" || key === "show_title") {
          return this._commit(key, !!target.checked);
        }
      }

      let value = this._eventValue(ev, target);

      if (key === "size_px" || key === "max_chars") {
        value = value === "" ? 0 : Number(value);
        if (!Number.isFinite(value)) value = 0;
        return this._commit(key, value);
      }

      if (key === "render_style") {
        this._commit(key, value);
        this._sync();
        return;
      }

      if (key === "text_color" || key === "background_color" || key === "unused_color" || key === "matrix_dot_off_color") {
        const norm = this._rowText._normalizeHex(value, false);
        if (norm === null) {
          this._sync();
          return;
        }
        return this._commit(key, norm);
      }

      if (key.startsWith("__slide_")) {
        return this._onSlideChange(key, ev);
      }
    }

    _slideCommitField(field, newValue) {
      const next = { ...this._config };
      const slides = (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
      const idx = clampInt(this._activeSlide || 0, 0, slides.length - 1);
      slides[idx] = { ...slides[idx], [field]: newValue };
      next.slides = slides;
      this._commitFull(next);
      this._sync();
    }

    _onSlideChange(key, ev) {
      const target = ev.target;
      let v = this._eventValue(ev, target);

      if (key === "__slide_entity") {
        this._slideCommitField("entity", v || "");

        const slides = this._config.slides || [];
        const idx = this._activeSlide || 0;
        const s = slides[idx] || {};
        const titleNow = String(s.title || "").trim();
        if (!titleNow) {
          const friendly = this._hass?.states?.[v]?.attributes?.friendly_name;
          const autoTitle = friendly || (v ? String(v).split(".").slice(1).join(".").replaceAll("_"," ") : `Slide ${idx+1}`);
          this._slideCommitField("title", autoTitle);
        }
        return;
      }

      if (key === "__slide_title") {
        this._slideCommitField("title", String(v || ""));
        return;
      }

      if (key === "__slide_title_icon") {
        this._slideCommitField("title_icon", String(v || ""));
        return;
      }

      if (key === "__slide_title_icon_align") {
        const vv = (v === "right") ? "right" : "left";
        this._slideCommitField("title_icon_align", vv);
        return;
      }
      if (key === "__slide_title_icon_gap") {
        const num = (v === "" || v === null || typeof v === "undefined") ? null : Number(v);
        const val = Number.isFinite(num) ? num : 6;
        this._slideCommitField("title_icon_gap", val);
        return;
      }

      if (key === "__slide_title_text_color") {
        this._slideCommitField("title_text_color", String(v || ""));
        return;
      }

      if (key === "__slide_title_icon_color") {
        this._slideCommitField("title_icon_color", String(v || ""));
        return;
      }

      if (key === "__slide_progress_color_mode") {
        const vv = (v === "intervals" || v === "all") ? "intervals" : "active";
        this._slideCommitField("progress_color_mode", vv);
        return;
      }



      if (key === "__slide_matrix_progress") {
        this._slideCommitField("matrix_progress", !!target.checked);
        return;
      }

      if (key === "__slide_progress_min" || key === "__slide_progress_max") {
        const num = (v === "" || v === null || typeof v === "undefined") ? null : Number(v);
        const val = Number.isFinite(num) ? num : null;
        const field = (key === "__slide_progress_min") ? "progress_min" : "progress_max";
        this._slideCommitField(field, (val === null ? (field === "progress_min" ? 0 : 100) : val));
        return;
      }


      if (key === "__slide_decimals" || key === "__slide_auto_decimals") {
        const num = (v === "" || v === null || typeof v === "undefined") ? null : Number(v);
        const val = Number.isFinite(num) ? num : null;
        this._slideCommitField(key === "__slide_decimals" ? "decimals" : "auto_decimals", val);
        return;
      }

      if (key === "__slide_leading_zero" || key === "__slide_show_unit" || key === "__slide_fade" || key === "__slide_hide_prev_first" || key === "__slide_animate_single") {
        const checked = !!target.checked;
        const field =
          (key === "__slide_leading_zero") ? "leading_zero" :
          (key === "__slide_show_unit") ? "show_unit" :
          (key === "__slide_fade") ? "fade" :
          (key === "__slide_animate_single") ? "animate_single" :
          "hide_prev_first";
        this._slideCommitField(field, checked);
        return;
      }

      if (key === "__slide_stay_s" || key === "__slide_out_s" || key === "__slide_in_s") {
        const num = Number(v);
        const val = Number.isFinite(num) ? num : 0;
        const field = (key === "__slide_stay_s") ? "stay_s" : (key === "__slide_out_s") ? "out_s" : "in_s";
        this._slideCommitField(field, val);
        return;
      }

      if (key === "__slide_value_template") {
        this._slideCommitField("value_template", String(v || "<value>"));
        return;
      }

      if (key === "__slide_show_style" || key === "__slide_hide_style") {
        const field = (key === "__slide_show_style") ? "show_style" : "hide_style";
        this._slideCommitField(field, String(v || ""));
        return;
      }
    }

    _addSlide() {
      const next = { ...this._config };
      const slides = (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));

      const base = slides.length > 0 ? slides[slides.length - 1] : { ...DEFAULT_SLIDE };
      const s = { ...DEFAULT_SLIDE, ...base };
      s.entity = "";
      s.title = `Slide ${slides.length + 1}`;

      slides.push(s);
      next.slides = slides;
      this._activeSlide = slides.length - 1;
      this._commitFull(next);
      this._sync();
    }

    _moveSlide(dir) {
      const next = { ...this._config };
      const slides = (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
      const i = this._activeSlide || 0;
      const j = i + dir;
      if (j < 0 || j >= slides.length) return;
      const tmp = slides[i];
      slides[i] = slides[j];
      slides[j] = tmp;
      next.slides = slides;
      this._activeSlide = j;
      this._commitFull(next);
      this._sync();
    }

    _deleteSlide() {
      const next = { ...this._config };
      const slides = (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
      if (slides.length <= 1) return;
      const i = this._activeSlide || 0;
      slides.splice(i, 1);
      next.slides = slides;
      this._activeSlide = clampInt(i, 0, slides.length - 1);
      this._commitFull(next);
      this._sync();
    }

    _addInterval() {
      const next = { ...this._config };
      const ints = Array.isArray(next.color_intervals) ? [...next.color_intervals] : [];
      ints.push({ from: 0, to: 0, color: (next.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase() });
      next.color_intervals = ints;
      this._commitFull(next);
      this._sync();
    }

    _deleteInterval(idx) {
      const next = { ...this._config };
      const ints = Array.isArray(next.color_intervals) ? [...next.color_intervals] : [];
      ints.splice(idx, 1);
      next.color_intervals = ints;
      this._commitFull(next);
      this._sync();
    }

    _setIntervalValue(idx, key, value, noSync) {
      const next = { ...this._config };
      const ints = Array.isArray(next.color_intervals) ? [...next.color_intervals] : [];
      const it = { ...(ints[idx] || {}) };

      if (key === "from" || key === "to") {
        const num = (value === "" || value === null || typeof value === "undefined") ? null : Number(value);
        it[key] = Number.isFinite(num) ? num : 0;
      } else if (key === "color") {
        const s = String(value || "").trim();
        if (/^#([0-9a-fA-F]{3}){1,2}$/.test(s)) it.color = s.toUpperCase();
      }
      ints[idx] = it;
      next.color_intervals = ints;
      this._commitFull(next);
      if (!noSync) this._sync();
        }

    _onIntervalChange(ev) {
      const t = ev.target;
      const idx = Number(t.dataset.intervalIndex);
      const key = t.dataset.intervalKey;
      const val = this._eventValue(ev, t);
      this._setIntervalValue(idx, key, val, /*noSync*/ true);
    }
  }

  // Register editor for this card tag
  if (!customElements.get(EDITOR_TAG)) {
    customElements.define(EDITOR_TAG, AndySegmentDisplayCardEditor);
  }

  try {
    if (String(CARD_TAG).endsWith("-development")) {
      const base = String(CARD_TAG).replace(/-development$/,"");
      const alias = `${base}-editor-development`;
      if (alias !== EDITOR_TAG && !customElements.get(alias)) {
        class AndySegmentDisplayCardEditorAlias extends AndySegmentDisplayCardEditor {}
        customElements.define(alias, AndySegmentDisplayCardEditorAlias);
      }
    }
  } catch (e) {
    // ignore
  }

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: CARD_TAG,
    name: "Andy Segment Display Card",
    description: "7-segment (digits), dot-matrix (text) or plain text display for multiple entities (Slides).",
  });
})();
