/* Andy Segment Display Card (Home Assistant Lovelace Custom Card)
 * v2.0.9
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
 *

 * 2.0.9 - 2026-04-24
 * UI: Better mobile-friendly numeric editor input for negative/decimal interval ranges
 * NEW: Auto-entities row shorthand support (row objects can be treated as single-slide rows)
 * PERF: Reduce per-render row normalization/allocation pressure for smoother mobile dashboards

 * 2.0.8 - 2026-02-14
 * PERF: Fix fixed-segment animation timer cleanup + reduce will-change GPU pressure
 * NEW: Interval NewValue (with variables + matrix tokens) + Interval Effect (Neon)
 * NEW: Animation style 'fade' (simple fade in/out)
 * UI: Progressbar preset button in editor
 *
 * 2.0.7 - 2025-02-211
 * Added Title + Icon inline (same row) as value / progressbar
 * Added reserve title + icon space if Inline
 * Added segment GAP setting
 * Color intervals match value or number
 * Added several dot matrix symbols
 * Showing unused segments in both 7-segment and Dot Matrix mode
 * Added "fixed" segments in animation, smoother animation
 * Optimisation of animation loops
 *
 *
 * 2.0.6 - 2025-02-07
 * Added support for Timer entity, such as Remaining time. Attribute to shown via dropdown if entity = timer.
 * Added new Dot Matrix symbols: House, lightniing, lightbulb, battery
 * Added support for showing % and # in dot matrix
 *
 *
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
  
  const CARD_VERSION = "2.0.9";
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
    fixed_segments_animations: true,  // DEFAULT: fixed-grid animations (no translate/transform). Set false to use legacy transforms.

    // Interactions (Home Assistant standard)
    tap_action: { action: "more-info" },
    hold_action: { action: "none" },
    double_tap_action: { action: "toggle-mode" },

    show_title: true,

    // Title placement
    title_inline: false,        // show Title+Icon inline with value
    title_reserve_px: 0,        // reserved width (px) for title area when inline (0 = auto)


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

    // Spacing between characters (applies to both 7-seg and dot-matrix)
    char_gap_px: 6,
    // Color intervals (optional)
    // { from:number, to:number, color:"#RRGGBB", match?:string, new_value?:string, effect?:"none"|"neon" }
    color_intervals: [],

    // Optional global effect when no interval overrides it
    text_effect: "none", // none | neon

    // Neon effect strength (0..100). Interval can override via neon_strength.
    neon_strength: 0,

    // Dot-matrix geometry (kept for compatibility; not exposed in v2 editor)
    matrix_cols: 5,
    matrix_rows: 7,
    matrix_gap: 2,
  };

  const DEFAULT_SLIDE = {
  animate_single: false,
    timer_mode: "",
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
    // { from:number, to:number, color:"#RRGGBB", match?:string, new_value?:string, effect?:"none"|"neon" }
    color_intervals: [],

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
  "%": [25,26,4,8,22,6,0],
  "#": [10,31,10,31,10,10,0],
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

  "": [4,14,31,6,12,8,0],
  "": [4,14,21,31,17,17,0],
  "": [31,17,17,17,31,4,0],
  "": [14,17,17,14,4,14,0],
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
  lightning: "",
  house: "",
  battery: "",
  lightbulb: "",
plug: "\uE020",
fan: "\uE021",
fire: "\uE022",
water: "\uE023",
thermometer: "\uE024",
arrow_up: "\uE025",
arrow_down: "\uE026",
check: "\uE027",
cross: "\uE028",
lock: "\uE029",
unlock: "\uE02A",
house_v2: "",
tree: "",
bolt_v2: "",
warning: "",
heart: "",
battery_v2: "",
arrows_lr: "",
arrows_ud: "",
arrows_ud_v2: "",
happy: "",
sad: "",
skull: "",
dollar: "",
pound: "",
euro: "",
amp: "",
at: "",
question: ""
});

// Precompiled regex for <token> replacements (dot-matrix symbols).
// Built from MATRIX_ICON_TOKENS keys so new symbols automatically work everywhere (title/value/templates).
const MATRIX_TOKEN_RE = (() => {
  const keys = Object.keys(MATRIX_ICON_TOKENS || {});
  keys.sort((a, b) => b.length - a.length);
  // Keys are simple (a-z, 0-9, underscore) so no escaping needed.
  return new RegExp(`<(${keys.join("|")})>`, "g");
})();


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

  [MATRIX_ICON_TOKENS.plug]: [0b00100,0b00100,0b11111,0b10101,0b11111,0b00100,0b00100],
  [MATRIX_ICON_TOKENS.fan]: [0b00100,0b01110,0b10101,0b01110,0b10101,0b01110,0b00100],
  [MATRIX_ICON_TOKENS.fire]: [0b00100,0b01100,0b10110,0b11111,0b01110,0b00100,0],
  [MATRIX_ICON_TOKENS.water]: [0b00100,0b01010,0b10001,0b10001,0b01010,0b00100,0],
  [MATRIX_ICON_TOKENS.thermometer]: [0b00100,0b00100,0b00100,0b00100,0b01110,0b01110,0b00100],
  [MATRIX_ICON_TOKENS.arrow_up]: [0b00100,0b01110,0b10101,0b00100,0b00100,0b00100,0],
  [MATRIX_ICON_TOKENS.arrow_down]: [0b00100,0b00100,0b00100,0b00100,0b10101,0b01110,0b00100],
  [MATRIX_ICON_TOKENS.check]: [0b00001,0b00010,0b00100,0b10100,0b01000,0,0],
  [MATRIX_ICON_TOKENS.cross]: [0b10001,0b01010,0b00100,0b01010,0b10001,0,0],
  [MATRIX_ICON_TOKENS.lock]: [0b01110,0b10001,0b10001,0b11111,0b10101,0b11111,0],
  [MATRIX_ICON_TOKENS.unlock]: [0b01110,0b10000,0b10001,0b11111,0b10101,0b11111,0],
[MATRIX_ICON_TOKENS.house_v2]: [0b00100,0b01110,0b11111,0b10101,0b11111,0b10001,0b10001],
[MATRIX_ICON_TOKENS.tree]: [0b00100,0b01110,0b11111,0b00100,0b00100,0b01110,0b00100],
[MATRIX_ICON_TOKENS.bolt_v2]: [0b00100,0b01100,0b11110,0b00110,0b01111,0b00110,0b00100],
[MATRIX_ICON_TOKENS.warning]: [0b00100,0b00100,0b00100,0b00100,0b00100,0b00000,0b00100],
[MATRIX_ICON_TOKENS.heart]: [0b01010,0b11111,0b11111,0b11111,0b01110,0b00100,0b00000],
[MATRIX_ICON_TOKENS.battery_v2]: [0b01110,0b10001,0b11111,0b11111,0b11111,0b10001,0b01110],
[MATRIX_ICON_TOKENS.arrows_lr]: [0b00100,0b01010,0b10001,0b11111,0b10001,0b01010,0b00100],
[MATRIX_ICON_TOKENS.arrows_ud]: [0b00100,0b01110,0b10101,0b00100,0b10101,0b01110,0b00100],
[MATRIX_ICON_TOKENS.arrows_ud_v2]: [0b00100,0b01110,0b11111,0b00100,0b11111,0b01110,0b00100],
[MATRIX_ICON_TOKENS.happy]: [0b00000,0b01010,0b00000,0b00000,0b10001,0b01110,0b00000],
[MATRIX_ICON_TOKENS.sad]: [0b00000,0b01010,0b00000,0b00000,0b01110,0b10001,0b00000],
[MATRIX_ICON_TOKENS.skull]: [0b01110,0b10101,0b11111,0b11111,0b01110,0b01010,0b00000],
[MATRIX_ICON_TOKENS.dollar]: [0b00100,0b01111,0b10100,0b01110,0b00101,0b11110,0b00100],
[MATRIX_ICON_TOKENS.pound]: [0b00110,0b01001,0b11100,0b01000,0b11110,0b01000,0b11111],
[MATRIX_ICON_TOKENS.euro]: [0b00110,0b01001,0b11110,0b01000,0b11110,0b01001,0b00110],
[MATRIX_ICON_TOKENS.amp]: [0b01100,0b10010,0b10100,0b01000,0b10101,0b10010,0b01101],
[MATRIX_ICON_TOKENS.at]: [0b01110,0b10001,0b10111,0b10101,0b10111,0b10000,0b01110],
[MATRIX_ICON_TOKENS.question]: [0b01110,0b10001,0b00001,0b00110,0b00100,0b00000,0b00100],
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

function parseHmsToSeconds(hms) {
  if (hms === undefined || hms === null) return null;
  const s = String(hms).trim();
  if (!s) return null;
  const parts = s.split(":").map(p => p.trim());
  if (!parts.length || parts.some(p => p === "" || !Number.isFinite(Number(p)))) return null;
  let sec = 0;
  if (parts.length === 3) sec = Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
  else if (parts.length === 2) sec = Number(parts[0]) * 60 + Number(parts[1]);
  else if (parts.length === 1) sec = Number(parts[0]);
  else return null;
  return Number.isFinite(sec) ? Math.max(0, Math.floor(sec)) : null;
}
function formatSecondsHMS(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const mm = String(m).padStart(2, "0");
  const sss = String(ss).padStart(2, "0");
  if (h > 0) return `${h}:${mm}:${sss}`;
  // mm:ss (with leading 0 minutes)
  return `${m}:${sss}`.padStart(4, "0");
}

function applyTemplate(tpl, vars) {
  const t = String(tpl ?? "<value>");
  return t.replace(/<attr:([^>]+)>/g, (_, k) => {
    const key = String(k || "").trim();
    const v = vars?.attr?.[key];
    return (v === undefined || v === null) ? "" : String(v);
  }).replace(MATRIX_TOKEN_RE, (_, n) => {
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
      .split("")
      .map((ch) => {
        if (ch >= "0" && ch <= "9") return ch;
        if (ch === "." || ch === "," || ch === ":" || ch === "-") return ch;

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
  // Punctuation / indicator chars for 7-segment
  if (ch === ".") {
    return `
      <svg class="char dot" viewBox="0 0 26 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <circle class="seg on" cx="18" cy="105" r="8"></circle>
      </svg>
    `;
  }

  if (ch === ",") {
    return `
      <svg class="char dot" viewBox="0 0 26 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <circle class="seg on" cx="18" cy="105" r="8"></circle>
        <rect class="seg on" x="15" y="110" width="6" height="10" rx="3"></rect>
      </svg>
    `;
  }

  if (ch === ":") {
    return `
      <svg class="char dot" viewBox="0 0 60 120" aria-hidden="true">
        <circle class="seg on" cx="30" cy="45" r="8"></circle>
        <circle class="seg on" cx="30" cy="75" r="8"></circle>
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

  let onDots = "";
  let offDots = "";
  for (let r = 0; r < rows; r++) {
    const rowBits = pattern[r] ?? 0;
    for (let c = 0; c < cols; c++) {
      const bitIndex = (cols - 1) - c;
      const on = ((rowBits >> bitIndex) & 1) === 1;
      const x = c * (cell + gap);
      const y = r * (cell + gap);
      const el = `<rect class="dot ${on ? "on" : "off"}" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" ry="2"></rect>`;
      if (on) onDots += el; else offDots += el;
    }
  }

  return `
    <svg class="char matrix" viewBox="0 0 ${w} ${h}" aria-hidden="true">
      <g class="offLayer">${offDots}</g>
      <g class="onLayer">${onDots}</g>
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


// -------------------- Gradient helpers (Segment + Matrix) --------------------
// Gradient is enabled when interval provides color_to (hex). Applies ONLY to 7-segment + dot-matrix.
// We inject <defs> into each SVG so url(#...) resolves inside the SVG fragment (safe, no global id collisions).
function _asdcGradientDefs(colorA, colorB, style) {
  const a = String(colorA || "").trim();
  const b = String(colorB || "").trim();
  const mode = String(style || "linear").toLowerCase();
  const id = "asdc-grad";
  if (!a || !b) return "";
  if (mode === "inside-out" || mode === "inside_out" || mode === "insideout") {
    return `<defs>
      <radialGradient id="${id}" cx="50%" cy="50%" r="65%">
        <stop offset="0%" stop-color="${a}"></stop>
        <stop offset="100%" stop-color="${b}"></stop>
      </radialGradient>
    </defs>`;
  }
  if (mode === "outside-in" || mode === "outside_in" || mode === "outsidein") {
    return `<defs>
      <radialGradient id="${id}" cx="50%" cy="50%" r="65%">
        <stop offset="0%" stop-color="${b}"></stop>
        <stop offset="100%" stop-color="${a}"></stop>
      </radialGradient>
    </defs>`;
  }
  if (mode === "two-tone" || mode === "two_tone" || mode === "twotone") {
    return `<defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${a}"></stop>
        <stop offset="50%" stop-color="${a}"></stop>
        <stop offset="50%" stop-color="${b}"></stop>
        <stop offset="100%" stop-color="${b}"></stop>
      </linearGradient>
    </defs>`;
  }
  // default: linear top->bottom
  return `<defs>
    <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${a}"></stop>
      <stop offset="100%" stop-color="${b}"></stop>
    </linearGradient>
  </defs>`;
}

function _asdcInjectPaintIntoSvg(svg, paint) {
  if (!paint || !paint.gradient_on) return svg;
  const defs = _asdcGradientDefs(paint.color, paint.color_to, paint.gradient_style);
  if (!defs) return svg;
  const fillRef = "url(#asdc-grad)";
  // Put custom property on <svg ...> so inner elements can resolve it.
  // Also inject defs just after opening <svg ...>.
  return svg
    .replace(/<svg\s+([^>]*?)>/, (m0, attrs) => {
      const hasStyle = /\sstyle=/.test(attrs);
      const styleAdd = `--asdc-on-fill:${fillRef};`;
      const attrs2 = hasStyle
        ? attrs.replace(/style="([^"]*)"/, (m1, s1) => `style="${s1};${styleAdd}"`)
        : `${attrs} style="${styleAdd}"`;
      return `<svg ${attrs2}>${defs}`;
    });
}

function svgForSegmentCharPainted(ch, cfg, paint) {
  const svg = svgForSegmentChar(ch, cfg);
  return _asdcInjectPaintIntoSvg(svg, paint);
}

function svgForMatrixCharPainted(ch, cfg, paint, dotOnOverride) {
  // Start from the colored variant so we keep --asdc-dot-on fix inside SVG (browser/webview quirks).
  let svg = svgForMatrixCharColored(ch, cfg, dotOnOverride);
  return _asdcInjectPaintIntoSvg(svg, paint);
}

  // -------------------- Color interval helper --------------------
  function pickIntervalRule(intervals, n, stateStr) {
    if (!Array.isArray(intervals) || intervals.length === 0) return null;

    const st = String(stateStr ?? "").trim().toLowerCase();

    // 1) Match-value rules (string state, e.g. on/off/open/closed)
    if (st) {
      for (const it of intervals) {
        const match = String(it?.match ?? "").trim();
        if (!match) continue;
        const parts = match.split(/[|,]/).map(p => p.trim().toLowerCase()).filter(Boolean);
        if (parts.length && parts.includes(st)) return it || null;
      }
    }

    // 2) Numeric range rules (from/to)
    const nn = Number(n);
    if (!Number.isFinite(nn)) return null;

    for (const it of intervals) {
      // If match is set, treat it as a match-rule (skip numeric)
      if (String(it?.match ?? "").trim()) continue;

      const f = Number(it?.from);
      const tt = Number(it?.to);
      if (!Number.isFinite(f) || !Number.isFinite(tt)) continue;
      const lo = Math.min(f, tt);
      const hi = Math.max(f, tt);
      if (nn >= lo && nn <= hi) return it || null;
    }
    return null;
  }

  function pickIntervalColor(intervals, n, stateStr) {
    const it = pickIntervalRule(intervals, n, stateStr);
    if (!it) return null;
    const c = String(it?.color || "").trim();
    if (/^#([0-9a-fA-F]{3}){1,2}$/.test(c)) return c.toUpperCase();
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
      case "run_top":   return phase === "in" ? "asdc-in-top"   : "asdc-out-top";
      case "run_bottom":return phase === "in" ? "asdc-in-bottom": "asdc-out-bottom";
      case "billboard": return phase === "in" ? "asdc-in-billboard" : "asdc-out-billboard";
      case "matrix":    return phase === "in" ? "asdc-in-matrix"    : "asdc-out-matrix";
      case "fade":      return phase === "in" ? "asdc-in-fade"     : "asdc-out-fade";
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

  function parseEditorNumber(raw) {
    if (raw === "" || raw === null || typeof raw === "undefined") return null;
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;

    const s = String(raw).trim().replace(/\s+/g, "").replace(",", ".");
    if (!s || s === "-" || s === "+" || s === "." || s === "," || s === "-." || s === "+.") return null;

    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  function tuneNumericTextfield(tf, { allowNegative = false, allowDecimal = true } = {}) {
    if (!tf) return tf;

    const pattern = allowDecimal
      ? (allowNegative ? "[-0-9.,]*" : "[0-9.,]*")
      : (allowNegative ? "[-0-9]*" : "[0-9]*");

    tf.type = "text";
    tf.inputMode = allowDecimal ? "decimal" : "numeric";
    tf.autocomplete = "off";
    tf.spellcheck = false;
    tf.setAttribute("type", "text");
    tf.setAttribute("inputmode", allowDecimal ? "decimal" : "numeric");
    tf.setAttribute("autocomplete", "off");
    tf.setAttribute("spellcheck", "false");
    tf.setAttribute("pattern", pattern);
    return tf;
  }

  function normalizeSlideConfig(slide) {
    return { ...DEFAULT_SLIDE, ...(slide || {}) };
  }

  function normalizeSlidesConfig(slides) {
    if (Array.isArray(slides) && slides.length) {
      return slides.map((s) => normalizeSlideConfig(s));
    }
    return [{ ...DEFAULT_SLIDE }];
  }

  function normalizeRowConfig(row) {
    const base = { ...(row || {}) };

    if (Array.isArray(base.slides) && base.slides.length) {
      return { ...base, slides: normalizeSlidesConfig(base.slides) };
    }

    // Auto-entities and similar generators often provide row items directly as slide-like objects.
    // Treat that shorthand as a single-slide row while preserving row flags like is_default.
    const slideSource = { ...base };
    delete slideSource.slides;
    delete slideSource.is_default;

    return { ...base, slides: normalizeSlidesConfig([slideSource]) };
  }

  function normalizeRowsConfig(rows, fallbackSlides) {
    if (Array.isArray(rows) && rows.length) {
      return rows.map((r) => normalizeRowConfig(r));
    }
    return [{ ...DEFAULT_ROW, is_default: true, slides: normalizeSlidesConfig(fallbackSlides) }];
  }

  // -------------------- Config migration --------------------
  function migrateConfig(config) {
    const cfg = config || {};
    const _type = cfg.type;

    // v2.1+ (rows) migration / normalization
    if (Array.isArray(cfg.rows) && cfg.rows.length) {
      const global = { ...DEFAULTS_GLOBAL, ...(cfg.global || cfg) };
      // Sanitize a few common fields (HA editor components sometimes emit "" or strings)
      if (typeof global.show_title !== "boolean") global.show_title = (DEFAULTS_GLOBAL.show_title !== false);
      if (typeof global.show_unused !== "boolean") global.show_unused = (DEFAULTS_GLOBAL.show_unused !== false);
      if (typeof global.title_inline !== "boolean") global.title_inline = !!DEFAULTS_GLOBAL.title_inline;
      if (typeof global.fixed_segments_animations !== "boolean") global.fixed_segments_animations = (DEFAULTS_GLOBAL.fixed_segments_animations !== false);
      if (typeof global.fixed_segments_animations !== "boolean") global.fixed_segments_animations = (DEFAULTS_GLOBAL.fixed_segments_animations !== false);
      global.title_reserve_px = Number(global.title_reserve_px ?? DEFAULTS_GLOBAL.title_reserve_px) || 0;
      global.char_gap_px = Number(global.char_gap_px ?? DEFAULTS_GLOBAL.char_gap_px) || DEFAULTS_GLOBAL.char_gap_px;
      global.color_intervals = Array.isArray(cfg.color_intervals) ? cfg.color_intervals : (global.color_intervals || []);
      const rows = normalizeRowsConfig(cfg.rows, cfg.slides);
      // keep backward-compatible top-level slides as row 0
      return { ...(_type ? { type: _type } : {}), ...global, rows, slides: rows[0].slides };
    }

    // If already v2-like (slides only)
    if (Array.isArray(cfg.slides)) {
      const global = { ...DEFAULTS_GLOBAL, ...(cfg.global || cfg) };
      if (typeof global.show_title !== "boolean") global.show_title = (DEFAULTS_GLOBAL.show_title !== false);
      if (typeof global.show_unused !== "boolean") global.show_unused = (DEFAULTS_GLOBAL.show_unused !== false);
      if (typeof global.title_inline !== "boolean") global.title_inline = !!DEFAULTS_GLOBAL.title_inline;
      if (typeof global.fixed_segments_animations !== "boolean") global.fixed_segments_animations = (DEFAULTS_GLOBAL.fixed_segments_animations !== false);
      if (typeof global.fixed_segments_animations !== "boolean") global.fixed_segments_animations = (DEFAULTS_GLOBAL.fixed_segments_animations !== false);
      global.title_reserve_px = Number(global.title_reserve_px ?? DEFAULTS_GLOBAL.title_reserve_px) || 0;
      global.char_gap_px = Number(global.char_gap_px ?? DEFAULTS_GLOBAL.char_gap_px) || DEFAULTS_GLOBAL.char_gap_px;
      global.color_intervals = Array.isArray(cfg.color_intervals) ? cfg.color_intervals : (global.color_intervals || []);
      const normSlides = normalizeSlidesConfig(cfg.slides);
      return { ...(_type ? { type: _type } : {}), ...global, rows: [{ ...DEFAULT_ROW, slides: normSlides }], slides: normSlides };
    }

    // v1 -> v2 migration
    const global = { ...DEFAULTS_GLOBAL };

    // Map old top-level fields to global
    for (const k of Object.keys(DEFAULTS_GLOBAL)) {
      if (typeof cfg[k] !== "undefined") global[k] = cfg[k];
    }

    if (typeof global.show_title !== "boolean") global.show_title = (DEFAULTS_GLOBAL.show_title !== false);
    if (typeof global.show_unused !== "boolean") global.show_unused = (DEFAULTS_GLOBAL.show_unused !== false);
    if (typeof global.title_inline !== "boolean") global.title_inline = !!DEFAULTS_GLOBAL.title_inline;
      if (typeof global.fixed_segments_animations !== "boolean") global.fixed_segments_animations = (DEFAULTS_GLOBAL.fixed_segments_animations !== false);
      if (typeof global.fixed_segments_animations !== "boolean") global.fixed_segments_animations = (DEFAULTS_GLOBAL.fixed_segments_animations !== false);
    global.title_reserve_px = Number(global.title_reserve_px ?? DEFAULTS_GLOBAL.title_reserve_px) || 0;
    global.char_gap_px = Number(global.char_gap_px ?? DEFAULTS_GLOBAL.char_gap_px) || DEFAULTS_GLOBAL.char_gap_px;

    // Build first slide from old single-entity config
    const slide = { ...DEFAULT_SLIDE };
    slide.entity = cfg.entity || "";
    slide.title = cfg.title || "";
    slide.decimals = (typeof cfg.decimals === "number") ? cfg.decimals : null;
    slide.auto_decimals = (typeof cfg.auto_decimals === "number") ? cfg.auto_decimals : null;
    slide.leading_zero = cfg.leading_zero !== false;
    slide.show_unit = !!cfg.show_unit;

    const normSlides = normalizeSlidesConfig([slide]);
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

      // Render cache for fast slide transitions (reduces SVG/string churn)
      this._renderCache = new Map();
      this._renderCacheOrder = [];
      this._renderCacheMax = 80;

      // Legacy mirrors (row 0)
      this._slideIndex = 0;
      this._timer = 0;
      this._isSwitching = false;

      // Runtime-only style toggle (does not mutate YAML config)
      this._runtimeStyle = null;
      this._pendingRender = false;

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

    connectedCallback() {
      super.connectedCallback && super.connectedCallback();

      // Visibility tracking to avoid animating cards that are off-screen (big CPU saver with many cards)
      this._isVisible = true;
      if (!this._io && "IntersectionObserver" in window) {
        this._io = new IntersectionObserver((entries) => {
          const e = entries && entries[0];
          const vis = !!(e && e.isIntersecting);
          this._isVisible = vis;
          if (vis) this._scheduleRender(true);
          else this._pendingRender = true;
        }, { root: null, threshold: 0.01 });
        try { this._io.observe(this); } catch (e) {}
      }

      if (!this._onVisChange) {
        this._onVisChange = () => {
          // When tab becomes visible again, repaint once so animations resume smoothly
          if (!document.hidden) this._scheduleRender(true);
        };
        document.addEventListener("visibilitychange", this._onVisChange);
      }

      // Action handlers (tap/hold/double)
      this._setupActions && this._setupActions();

    }

    disconnectedCallback() {
      this._clearAllTimers();
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = 0;
      }

      if (this._io) {
        try { this._io.disconnect(); } catch (e) {}
        this._io = null;
      }
      if (this._onVisChange) {
        document.removeEventListener("visibilitychange", this._onVisChange);
        this._onVisChange = null;
      }
      // Release references to help GC in long-running dashboards
      this._rowEls = null;
      this._rowStates = [];
      this._slides = null;
      this._config = null;
      this._hass = null;
    }

    getCardSize() {
      return 2;
    }


_scheduleRender(force = false) {
  // Big perf win: do not render while off-screen or when tab is hidden.
  // We keep a pending flag and repaint once the card becomes visible again.
  if (!force && (!this._isVisible || document.hidden)) {
    this._pendingRender = true;
    return;
  }

  if (this._raf) cancelAnimationFrame(this._raf);
  this._raf = requestAnimationFrame(() => {
    this._raf = 0;
    this._pendingRender = false;
    this._render();
  });
}



    _fastUpdateRowDisplay(rowIndex, displayStr) {
      const cfg = this._config || {};
      const els = this._rowEls?.[rowIndex];
      if (!els?.display) return;

      const style = this._effectiveStyle(cfg);
      try { if (this._actionsInitDone && this._asdcAction && !this._asdcAction.bound) { const c = this.querySelector('ha-card.asdc-card') || this.querySelector('.asdc-card'); this._bindActionsToTarget(c || this); } } catch(e) {}
      const s = String(displayStr ?? "");

      // Only update innerHTML for the animated row; do NOT recompute hass/state/vars here (performance).
      // Only update innerHTML for the animated row; do NOT recompute hass/state/vars here (performance).
      const paint = this._rowStates?.[rowIndex]?._activePaint || null;
      const html = this._getCachedDisplayHtml(style, s, cfg, paint);
      els.display.innerHTML = html;

      els.display.setAttribute("aria-label", `value ${s}`);
    }



    _cfgCacheSig(cfg) {
      if (!cfg) return "";
      if (cfg.__asdc_cache_sig) return cfg.__asdc_cache_sig;
      // Include only render-affecting settings (keep short to avoid perf overhead)
      const sigObj = {
        render_style: cfg.render_style,
        // Segment
        segment_style: cfg.segment_style,
        segment_variant: cfg.segment_variant,
        segment_round: cfg.segment_round,
        segment_skew: cfg.segment_skew,
        show_unused: cfg.show_unused,
        unused_color: cfg.unused_color,
        // Matrix
        matrix_dot_style: cfg.matrix_dot_style,
        matrix_dot_size: cfg.matrix_dot_size,
        matrix_gap_px: cfg.matrix_gap_px,
        matrix_dot_off_color: cfg.matrix_dot_off_color,
        // General
        italic: cfg.italic,
      };
      const s = JSON.stringify(sigObj);
      cfg.__asdc_cache_sig = String(s);
      return cfg.__asdc_cache_sig;
    }

    _paintCacheKey(paint) {
      if (!paint) return "";
      return [
        paint.color || "",
        paint.color_to || "",
        paint.gradient_style || "",
        paint.gradient_on ? "1" : "0"
      ].join("|");
    }

    _getCachedDisplayHtml(style, text, cfg, paint) {
      const s = String(text ?? "");
      const key = `${style}::${this._cfgCacheSig(cfg)}::${this._paintCacheKey(paint)}::${s}`;
      const cache = this._renderCache;
      if (cache && cache.has(key)) return cache.get(key);

      let html = "";
      if (style === "plain") {
        html = `<div class="plainText ${(style !== "matrix") && !!cfg.italic ? "asdc-italic" : ""}">${s}</div>`;
      } else {
        const chars = s.split("");
        const dotOn = (paint?.color || (cfg.text_color || "#00FF66"));
        for (let i = 0; i < chars.length; i++) {
          const ch = chars[i];
          if (style === "segment") html += svgForSegmentCharPainted(ch, cfg, paint);
          else html += svgForMatrixCharPainted(ch, cfg, paint, dotOn);
        }
      }

      if (cache) {
        cache.set(key, html);
        this._renderCacheOrder.push(key);
        if (this._renderCacheOrder.length > (this._renderCacheMax || 80)) {
          const old = this._renderCacheOrder.shift();
          if (old) cache.delete(old);
        }
      }
      return html;
    }

    _getRows() {
      const cfg = this._config || {};
      if (Array.isArray(cfg.rows) && cfg.rows.length) {
        return cfg.rows;
      }
      return normalizeRowsConfig(null, cfg.slides);
    }

    _ensureRowState(count) {
      while (this._rowStates.length < count) {
        this._rowStates.push({
          slideIndex: 0,
          timer: 0,
          isSwitching: false,
          lastText: null,
          _lastStyle: null,
          liveTimer: 0,
          liveMode: null,
          liveFinishesAt: 0,
          liveRemainingBase: 0,
          liveStartMs: 0,
          _lastAnimText: null,
        });
      }
      if (this._rowStates.length > count) {
        // clear timers for removed rows
        for (let i = count; i < this._rowStates.length; i++) {
          const st = this._rowStates[i];
          if (st?.timer) clearTimeout(st.timer);
          if (st?.liveTimer) clearInterval(st.liveTimer);
          if (st?.animTimer) clearTimeout(st.animTimer);
        }
        this._rowStates.length = count;
      }
    }

    _clearAllTimers() {
      (this._rowStates || []).forEach(st => {
        if (st?.timer) clearTimeout(st.timer);
        if (st?.liveTimer) clearInterval(st.liveTimer);
        if (st?.animTimer) clearTimeout(st.animTimer);
        if (st) {
          st.timer = 0;
          st.liveTimer = 0;
          st.animTimer = 0;
          st.isSwitching = false;
          if (st.anim) { st.anim.active = false; st.anim = null; }
          st._lastAnimText = null;
        }
      });
    }

    _clearRowTimer(rowIndex) {
      const st = this._rowStates[rowIndex];
      if (st?.timer) {
        clearTimeout(st.timer);
        st.timer = 0;
      }
      if (st?.animTimer) {
        clearTimeout(st.animTimer);
        st.animTimer = 0;
      }
      if (st) st.isSwitching = false;
    }
    _clearRowLiveTimer(rowIndex) {
      const st = this._rowStates[rowIndex];
      if (st?.liveTimer) {
        clearInterval(st.liveTimer);
        st.liveTimer = 0;
      }
      if (st) {
        st.liveMode = null;
        st.liveFinishesAt = 0;
        st.liveRemainingBase = 0;
        st.liveStartMs = 0;
      }
    }

    _ensureRowLiveTimer(rowIndex, stateObj, mode) {
      const st = this._rowStates[rowIndex];
      if (!st) return;

      const domain = ((stateObj?.entity_id || "") || "").split(".")[0] || "";
      if (domain !== "timer" || (mode !== "remaining" && mode !== "finishes_in")) {
        this._clearRowLiveTimer(rowIndex);
        return;
      }

      const active = (stateObj?.state === "active");
      if (!active) {
        this._clearRowLiveTimer(rowIndex);
        return;
      }

      const finRaw = stateObj?.attributes?.finishes_at;
      const finMs = finRaw ? new Date(finRaw).getTime() : 0;
      const baseRem = parseHmsToSeconds(stateObj?.attributes?.remaining);

      if (st.liveTimer && st.liveMode === mode && st.liveFinishesAt === finMs) return;

      this._clearRowLiveTimer(rowIndex);
      st.liveMode = mode;
      st.liveFinishesAt = finMs;
      st.liveRemainingBase = baseRem || 0;
      st.liveStartMs = Date.now();

      st.liveTimer = setInterval(() => this._scheduleRender(), 1000);
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


    _fixedAnimEnabledForStyle(style) {
      const cfg = this._config || {};
      return !!cfg.fixed_segments_animations && (style === "segment" || style === "matrix");
    }

    _computeFixedShiftText(text, width, shift, dir) {
      const w = Math.max(1, Number(width) || 1);
      const s = Math.max(0, Math.min(w, Number(shift) || 0));
      let base = String(text ?? "");
      if (base.length > w) base = base.slice(base.length - w);
      base = base.padStart(w, " ");
      const spaces = " ".repeat(s);
      if (dir === "left") {
        return base.slice(s) + spaces;
      }
      return spaces + base.slice(0, w - s);
    }


    _computeFixedAnimText(st, finalText, width) {
  const anim = st?.anim;
  if (!anim || !anim.active) return null;

  const now = performance.now();
  const dur = Math.max(1, anim.durMs || 1);
  const p = Math.max(0, Math.min(1, (now - anim.startMs) / dur));
  const w = Math.max(1, Number(width) || 1);

  if (anim.mode === "marquee") {
    const total = Math.max(0, Number(anim.totalSteps) || 0);
    const stepMs = Math.max(10, Number(anim.stepMs) || (dur / Math.max(1, total || 1)));
    const stepRaw = Math.floor((now - anim.startMs) / stepMs);
    const step = Math.max(0, Math.min(total, stepRaw));
    anim._step = step;
    const pad = String(anim.textPad ?? "");
    if (!pad) return "";
    if ((anim.dir || "left") === "right") {
      const start = Math.max(0, Math.min(total - step, pad.length - w));
      return pad.slice(start, start + w);
    }
    const start = Math.max(0, Math.min(step, pad.length - w));
    return pad.slice(start, start + w);
  }

  if (anim.mode === "shift") {
    const dir = anim.dir || "left";
    const baseText = (anim.phase === "out") ? anim.baseText : (anim.targetText ?? finalText);
    const stepMs = Math.max(10, Number(anim.stepMs) || (dur / Math.max(1, w)));
    const step = Math.max(0, Math.min(w, Math.floor((now - anim.startMs) / stepMs)));
    const shift = (anim.phase === "out") ? step : Math.max(0, w - step);
    anim._shift = shift;
    return this._computeFixedShiftText(baseText, w, shift, dir);
  }

  if (anim.mode === "fade") {
    anim.opacity = (anim.phase === "out") ? (1 - p) : p;
    return (anim.phase === "out") ? (anim.baseText ?? finalText) : (anim.targetText ?? finalText);
  }

  return null;
}

    _runFixedAnimRow(rowIndex, phase, styleName, seconds, baseText, targetText, width) {
  const st = this._rowStates[rowIndex];
  if (!st) return Promise.resolve();
  const durMs = Math.max(0, Number(seconds) || 0) * 1000;
  if (durMs <= 0) return Promise.resolve();

  const style = String(styleName || "").toLowerCase();
  const isLeft = style.includes("left");
  const isRight = style.includes("right");
  const isRun = style === "running";

  // Running should enter from LEFT and travel to RIGHT (fixed grid)
  const dir = isRun ? "right" : (isRight ? "right" : "left");

  // Supported styles -> marquee/shift; others -> fade-only (no transforms)
  const mode = isRun ? "marquee" : ((isLeft || isRight) ? "shift" : "fade");

  const w = Math.max(1, Number(width) || 1);
  const base = String(baseText ?? st.lastText ?? "");
  const target = String(targetText ?? "");

  st.anim = {
    active: true,
    mode,
    phase,
    dir,
    startMs: performance.now(),
    durMs,
    baseText: base,
    targetText: targetText ?? null,
    opacity: null,
    width: w,
    // marquee fields
    textPad: null,
    totalSteps: 0,
    stepMs: 0,
    // per-frame helpers
    _step: 0,
    _shift: 0,
  };

  if (mode === "shift") {
    st.anim.stepMs = durMs / Math.max(1, w);
  }

  if (mode === "marquee") {
    const msg = (targetText != null) ? target : base;
    const pad = " ".repeat(w) + msg + " ".repeat(w);
    st.anim.textPad = pad;
    st.anim.totalSteps = Math.max(0, pad.length - w);
    st.anim.stepMs = st.anim.totalSteps > 0 ? (durMs / st.anim.totalSteps) : durMs;
  }

  return new Promise((resolve) => {
    const tick = () => {
      const a = st.anim;
      if (!a || !a.active) { if (st.animTimer) { clearTimeout(st.animTimer); st.animTimer = 0; } return resolve(); }

      // Pause heavy animation work when tab is hidden or card is off-screen
      if (document.hidden || this._isVisible === false) {
        if (st.animTimer) clearTimeout(st.animTimer);
        st.animTimer = setTimeout(tick, 250);
        return;
      }

      const now = performance.now();
      if ((now - a.startMs) >= a.durMs) {
        // finalize
        a.active = false;
        st.anim = null;
        st._lastAnimText = null;
        if (st.animTimer) { clearTimeout(st.animTimer); st.animTimer = 0; }

        const els = this._rowEls[rowIndex];
        if (els?.display) els.display.style.opacity = "";
        this._scheduleRender();
        return resolve();
      }

      // Only re-render when the visible frame actually changes (reduces load / stutter)
      const finalTxt = String(st.lastText ?? "");
      const frameTxt = this._computeFixedAnimText(st, finalTxt, a.width);
      // Fade uses opacity updates even when text frame doesn't change
      if (st.anim && typeof st.anim.opacity === "number") {
        const els2 = this._rowEls[rowIndex];
        if (els2?.display) els2.display.style.opacity = String(st.anim.opacity);
      }
      if (frameTxt !== st._lastAnimText) {
        st._lastAnimText = frameTxt;
        this._fastUpdateRowDisplay(rowIndex, frameTxt);
      }

      // Adaptive tick: check often enough to catch the next step, but avoid hammering HA
      const baseDelay = ((document.hidden || this._isVisible === false) ? 250 : 33);
      const stepMs = Number(a.stepMs) || 0;
      const want = stepMs > 0 ? Math.max(16, Math.min(80, Math.floor(stepMs / 2))) : baseDelay;
      if (st.animTimer) clearTimeout(st.animTimer);
      st.animTimer = setTimeout(tick, Math.max(baseDelay, want));
    };

    tick();
  });
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
      const style = this._effectiveStyle(cfg);
      if (displayEl && runOut) {
        const outStyle = isRunning ? "running" : current.hide_style;
        if (this._fixedAnimEnabledForStyle(style)) {
          await this._runFixedAnimRow(rowIndex, "out", outStyle, outS, st.lastText, null, this._effectiveMaxChars(""));
        } else {
          applyAnim(displayEl, outStyle, "out", outS, !!current.fade);
          await new Promise((res) => setTimeout(res, outS * 1000));
          clearAnim(displayEl);
        }
      } else if (displayEl) {
        clearAnim(displayEl);
      }

      st.slideIndex = nextIndex;
      st.lastText = null;
      this._render();

      if (displayEl && inS > 0) {
        if (this._fixedAnimEnabledForStyle(style)) {
          // After render, st.lastText holds the final (target) text
          await this._runFixedAnimRow(rowIndex, "in", next.show_style, inS, null, st.lastText, this._effectiveMaxChars(""));
        } else {
          applyAnim(displayEl, next.show_style, "in", inS, !!next.fade);
          await new Promise((res) => setTimeout(res, inS * 1000));
          clearAnim(displayEl);
        }
      }

      st.isSwitching = false;

      const stay = Math.max(0, Number(next.stay_s) || 0);
      st.timer = setTimeout(() => this._nextSlideRow(rowIndex), stay * 1000);
    }

      


    _effectiveMaxChars(renderedText) {
      const cfg = this._config;
      return clampInt(cfg.max_chars ?? DEFAULTS_GLOBAL.max_chars, 1, 40);
    }

    
    _computeActivePaint(stateObj, slide) {
      const cfg = this._config;
      let n = toNumberOrNull(stateObj);
      const domain = (slide?.entity || "").split(".")[0] || "";
      if (domain === "timer" && stateObj) {
        const mode = String(slide?.timer_mode || "remaining");
        if (mode === "remaining" || mode === "finishes_in") {
          const finMs = stateObj.attributes?.finishes_at ? new Date(stateObj.attributes.finishes_at).getTime() : 0;
          const remAttrS = parseHmsToSeconds(stateObj.attributes?.remaining);
          n = finMs ? Math.max(0, Math.round((finMs - Date.now()) / 1000)) : (remAttrS === null ? null : remAttrS);
        } else if (mode === "duration") {
          const durS = parseHmsToSeconds(stateObj.attributes?.duration);
          n = (durS === null) ? null : durS;
        }
      }

      const intervals = (slide && Array.isArray(slide.color_intervals) && slide.color_intervals.length) ? slide.color_intervals : cfg.color_intervals;
      const rule = pickIntervalRule(intervals, n, stateObj?.state);

      const color = (rule && /^#([0-9a-fA-F]{3}){1,2}$/.test(String(rule.color || "").trim()))
        ? String(rule.color).trim().toUpperCase()
        : (cfg.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase();

      const colorTo = (rule && /^#([0-9a-fA-F]{3}){1,2}$/.test(String(rule.color_to || "").trim()))
        ? String(rule.color_to).trim().toUpperCase()
        : "";

      const rs = this._effectiveStyle(cfg);
      const gradientOn = !!colorTo && (rs === "segment" || rs === "matrix");

      const gStyle = String(rule?.gradient_style || "linear").trim().toLowerCase() || "linear";

      return {
        color,
        color_to: colorTo,
        gradient_style: gStyle,
        gradient_on: gradientOn,
      };
    }

    _render() {
      if (!this._config) return;

      const cfg = this._config;
      const rows = this._getRows();

      this._ensureRowState(rows.length);

      const sizePx = Number(cfg.size_px ?? 0);
      const isAuto = !Number.isFinite(sizePx) || sizePx <= 0;
      const style = (this._runtimeStyle || cfg.render_style || "segment"); // segment|matrix|plain

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
                min-width: 0;
                overflow: hidden;
                transform-origin: center;
              }
              #${this._uid} .char { height: 100%; width: auto; flex: 0 0 auto; }
              #${this._uid} .wrap.segment .display { align-items: flex-end; }
              #${this._uid} .wrap.segment .char { display: block; }

              #${this._uid} .wrap.segment .char.dot { width: 26px; }

              /* Segment mode (kept from v1) */
              #${this._uid} .wrap.segment .seg.on {
                fill: var(--asdc-on-fill, var(--asdc-text-color));
                filter: drop-shadow(0 0 6px rgba(0,0,0,0.35));
              }
              #${this._uid} .wrap.segment .seg.off { fill: var(--asdc-unused-fill); }

              /* Matrix mode (kept from v1) */
              #${this._uid} .wrap.matrix .dot.on {
                fill: var(--asdc-on-fill, var(--asdc-dot-on));
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
              #${this._uid} .display.asdc-anim { will-change: transform, opacity; }

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
              @keyframes asdc-in-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
              @keyframes asdc-out-fade { 0% { opacity: 1; } 100% { opacity: 0; } }

              /* Neon effect (only when enabled via interval/global)
                 NOTE: Apply glow ONLY to active elements (onLayer / .on), never to off dots/segments. */
              #${this._uid} .asdc-neon {
                --asdc-neon1: 5px;
                --asdc-neon2: 14px;
              }
              /* Neon on matrix/7-seg disabled (plain text only) */
/* Plain text */
              #${this._uid} .asdc-neon .plainText {
                text-shadow: 0 0 var(--asdc-neon1) var(--asdc-text-color), 0 0 var(--asdc-neon2) var(--asdc-text-color);
              }
              /* If supported, add drop-shadow boost (auto mode) */
              #${this._uid}.asdc-neon-filter .asdc-neon .plainText {
                filter: drop-shadow(0 0 var(--asdc-neon1) var(--asdc-text-color)) drop-shadow(0 0 var(--asdc-neon2) var(--asdc-text-color));
              }
              /* Allow glow to extend beyond clipping on some WebViews */
              #${this._uid} .asdc-neon .display { overflow: visible; }


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

        // Bind actions to the actual ha-card element for reliable tap/hold/double.
        this._bindActionsToTarget(this._els.card || this);

        // Feature detect drop-shadow support (some kiosk/WebView devices are limited)
        if (this._supportsDropShadow == null) {
          try {
            this._supportsDropShadow = !!(window.CSS && CSS.supports && CSS.supports("filter", "drop-shadow(0 0 2px #000)"));
          } catch (e) {
            this._supportsDropShadow = false;
          }
        }
        // Mark root so CSS can add a filter-based boost where supported (text-shadow remains the fallback)
        this._els.root.classList.toggle("asdc-neon-filter", !!this._supportsDropShadow);

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

        // Timer entity support (per slide)
        const domain = (slide.entity || "").split(".")[0] || "";
        const timerMode = String(slide.timer_mode || "").trim(); // remaining|duration|finishes_at|finishes_in|state
        if (domain === "timer" && stateObj) {
          const mode = timerMode || "remaining";
          this._ensureRowLiveTimer(rowIndex, stateObj, mode);

          const durS = parseHmsToSeconds(stateObj.attributes?.duration);
          const remAttrS = parseHmsToSeconds(stateObj.attributes?.remaining);
          const finMs = stateObj.attributes?.finishes_at ? new Date(stateObj.attributes.finishes_at).getTime() : 0;

          let remS = remAttrS;
          if (finMs && Number.isFinite(finMs)) {
            remS = Math.max(0, Math.round((finMs - Date.now()) / 1000));
          } else if (remAttrS !== null) {
            const stLive = this._rowStates[rowIndex];
            if (stLive && stLive.liveStartMs) {
              const elapsed = Math.round((Date.now() - stLive.liveStartMs) / 1000);
              remS = Math.max(0, (stLive.liveRemainingBase || remAttrS || 0) - elapsed);
            }
          }

          if (mode === "duration") {
            valueStr = (durS === null) ? (stateObj.attributes?.duration ?? "") : formatSecondsHMS(durS);
          } else if (mode === "finishes_at") {
            valueStr = finMs ? formatTimeLocal(new Date(finMs).toISOString()) : String(stateObj.attributes?.finishes_at ?? "");
          } else if (mode === "finishes_in" || mode === "remaining") {
            valueStr = (remS === null) ? String(stateObj.attributes?.remaining ?? "") : formatSecondsHMS(remS);
          } else if (mode === "state") {
            valueStr = String(stateObj.state ?? "");
          } else {
            valueStr = (remS === null) ? String(stateObj.attributes?.remaining ?? "") : formatSecondsHMS(remS);
          }
        } else {
          this._clearRowLiveTimer(rowIndex);
        }


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

        // Interval rule (for NewValue / Effect) – matches same logic as interval colors
        const intervalsForRule = (Array.isArray(slide.color_intervals) && slide.color_intervals.length) ? slide.color_intervals : (cfg.color_intervals || []);
        let intervalN = toNumberOrNull(stateObj);
        // Timer entities: allow interval matching on remaining seconds if a timer_mode is active
        if (stateObj && String(slide.timer_mode || "").trim() && String(slide.entity || "").startsWith("timer.")) {
          const mode = String(slide.timer_mode || "").trim();
          const durS = parseHmsToSeconds(stateObj.attributes?.duration);
          const remAttrS = parseHmsToSeconds(stateObj.attributes?.remaining);
          const finMs = stateObj.attributes?.finishes_at ? new Date(stateObj.attributes.finishes_at).getTime() : 0;

          let remS = remAttrS;
          if (finMs && Number.isFinite(finMs)) {
            remS = Math.max(0, Math.round((finMs - Date.now()) / 1000));
          } else if (remAttrS !== null) {
            const stLive = this._rowStates[rowIndex];
            if (stLive && stLive.liveStartMs) {
              const elapsed = Math.round((Date.now() - stLive.liveStartMs) / 1000);
              remS = Math.max(0, (stLive.liveRemainingBase || remAttrS || 0) - elapsed);
            }
          }
          if ((mode === "finishes_in" || mode === "remaining") && remS !== null) intervalN = remS;
          else if (mode === "duration" && durS !== null) intervalN = durS;
        }

        const intervalRule = pickIntervalRule(intervalsForRule, intervalN, stateObj?.state);

        // Neon effect (strength 0..100). Interval can override via neon_strength.
        // Backward compat:
        // - If interval.effect === "neon" and neon_strength is missing, use global cfg.neon_strength (or 60 fallback)
        // - If cfg.text_effect === "neon", apply global cfg.neon_strength
        const globalEff = String(cfg.text_effect || "none").toLowerCase();
        const globalStrengthRaw = Number(cfg.neon_strength ?? 0);

        let strengthRaw = 0;
        if (intervalRule && intervalRule.neon_strength != null && intervalRule.neon_strength !== "") {
          strengthRaw = Number(intervalRule.neon_strength);
        } else if (intervalRule && String(intervalRule.effect || "").toLowerCase() === "neon") {
          strengthRaw = Number.isFinite(globalStrengthRaw) && globalStrengthRaw > 0 ? globalStrengthRaw : 60;
        } else if (globalEff === "neon") {
          strengthRaw = globalStrengthRaw;
        }

        const strength = Number.isFinite(strengthRaw) ? Math.max(0, Math.min(100, strengthRaw)) : 0;

// Neon is supported for plain text only (per request). 0 = off.
const _rs = String(cfg.render_style || "segment").toLowerCase();
const isPlain = (_rs === "plain");
const neonOn = isPlain && strength > 0;

els.row.classList.toggle("asdc-neon", neonOn);

if (neonOn) {
  // Convert 0..100 -> px blur radius (tuned for plain text)
  const b1 = 1.2 + (strength / 100) * 5.0;
  const b2 = 3.2 + (strength / 100) * 16.0;
  els.row.style.setProperty("--asdc-neon1", `${b1.toFixed(2)}px`);
  els.row.style.setProperty("--asdc-neon2", `${b2.toFixed(2)}px`);
} else {
  els.row.style.removeProperty("--asdc-neon1");
  els.row.style.removeProperty("--asdc-neon2");
}

// Base value formatting (template) for non-segment renderers
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

        // Optional interval NewValue (overrides template output)
        if (intervalRule && typeof intervalRule.new_value === "string" && intervalRule.new_value.trim() !== "") {
          const tplNv = String(intervalRule.new_value);
          displayStr = tplNv.includes("<") ? applyTemplate(tplNv, vars) : tplNv;
          if ((cfg.render_style || "segment") === "matrix") {
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



        // If there's nothing to show (e.g. timer not started / unknown), keep the display width by rendering blanks
        // so "unused segments/dots" can still be visible (7-seg: faint segments, matrix: off dots).
        if (((style || "matrix") === "segment" || (style || "matrix") === "matrix") &&
            (!displayStr || String(displayStr).trim() === "")) {
          const __mc = clampInt(cfg.max_chars ?? DEFAULTS.max_chars, 1, 40);
          displayStr = " ".repeat(__mc);
        }

        const effMax = this._effectiveMaxChars(displayStr);
        if (displayStr.length > effMax) displayStr = displayStr.slice(displayStr.length - effMax);

        // Dot-matrix: pad with spaces up to max chars so unused dot boxes remain visible
if ((style || "segment") === "matrix" && effMax > 0 && displayStr.length < effMax) {
  const pad = effMax - displayStr.length;
  if (cfg.center_text) {
    const left = Math.floor(pad / 2);
    const right = pad - left;
    displayStr = " ".repeat(left) + displayStr + " ".repeat(right);
  } else {
    displayStr = " ".repeat(pad) + displayStr;
  }
}

// 7-segment: pad with spaces up to max chars so unused 7-seg digits remain visible
if ((style || "segment") === "segment" && effMax > 0 && displayStr.length < effMax) {
  const pad = effMax - displayStr.length;
  if (cfg.center_text) {
    const left = Math.floor(pad / 2);
    const right = pad - left;
    displayStr = " ".repeat(left) + displayStr + " ".repeat(right);
  } else {
    // right-aligned display: pad on the left
    displayStr = " ".repeat(pad) + displayStr;
  }
}


// PERF: Build a lightweight signature for row layout + styling.
// If nothing that affects DOM/styles changed, we can skip most assignments.
        const __paintTmp = this._computeActivePaint(stateObj, slide);
        const __rowSig = [
          String(style),
          String(displayStr),
          String(cfg.center_text ? "C" : "R"),
          String((style !== "matrix") && !!cfg.italic ? "I" : "N"),
          String(isAuto ? "A" : "F"),
          String(sizePx || 0),
          String(cfg.max_chars || ""),
          String(cfg.char_gap_px || ""),
          String(cfg.title_inline === true ? "T" : "N"),
          String(cfg.title_reserve_px || 0),
          String(cfg.show_title !== false ? "ST" : "HT"),
          String(__paintTmp.color || ""),
          String(__paintTmp.color_to || ""),
          String(__paintTmp.gradient_style || ""),
          String(cfg.matrix_dot_off_color || ""),
          String(cfg.unused_color || ""),
          String(cfg.title_color || ""),
        ].join("§");

        // Store paint on state (used below). This avoids recomputing if we early exit.
        st._activePaint = __paintTmp;

        const __sigSame = (__rowSig === st._lastRowSig);

        const italicAllowed = (style !== "matrix") && !!cfg.italic;

        // Fixed-segment animation (opt-in): override text per frame without moving the grid
        if (st?.anim?.active && this._fixedAnimEnabledForStyle(style)) {
          const w = this._effectiveMaxChars("");
          const ov = this._computeFixedAnimText(st, displayStr, w);
          if (typeof ov === "string") displayStr = ov;
          if (st.anim && typeof st.anim.opacity === "number") {
            els.display.style.opacity = String(st.anim.opacity);
          } else {
            els.display.style.opacity = "";
          }
        } else {
          els.display.style.opacity = "";
        }

        const dotOn = st._activePaint?.color || cfg.text_color || DEFAULTS_GLOBAL.text_color;

        // Alignment + italic + sizing + title + colors (skip when nothing changed)
        if (!__sigSame) {
          els.display.style.justifyContent = cfg.center_text ? "center" : "flex-end";
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

        // Row title (per row) - cached to avoid DOM churn on every hass update
        let titleText = (cfg.show_title !== false) ? (slide.title || "") : "";
        const titleIcon = (slide?.title_icon || "");
        const titleAlign = (slide?.title_icon_align || "left");
        const titleGap = (slide?.title_icon_gap ?? 6);
        const titleTextColor = (slide?.title_text_color || "");
        const titleIconColor = (slide?.title_icon_color || "");

        if (titleText || titleIcon) {
          if (String(titleText).includes("<")) titleText = applyTemplate(titleText, vars);
          const tKey = [titleText, titleIcon, titleAlign, String(titleGap), titleTextColor, titleIconColor].join("|");
          if (tKey !== st._lastTitleKey) {
            st._lastTitleKey = tKey;
            setTitleWithIcon(els.title, titleText, titleIcon, titleAlign, titleGap, titleTextColor, titleIconColor);
          }
          els.title.style.display = "flex";
        } else {
          if (st._lastTitleKey) {
            st._lastTitleKey = "";
            els.title.textContent = "";
          }
          els.title.style.display = "none";
        }

        // Title inline (same row as value) + reserved width
        const inlineTitle = (cfg.title_inline === true);
        els.row.classList.toggle("asdc-inline-title", inlineTitle);
        if (inlineTitle) {
          els.row.style.display = "flex";
          els.row.style.alignItems = "center";
          els.row.style.gap = "10px";
          els.title.style.padding = "0";
          els.title.style.margin = "0";
          const reserve = clampInt(Number(cfg.title_reserve_px ?? 0), 0, 1000);
          if (reserve > 0) {
            els.title.style.flex = `0 0 ${reserve}px`;
            els.title.style.minWidth = `${reserve}px`;
          } else {
            els.title.style.flex = "0 0 auto";
            els.title.style.minWidth = "";
          }
          els.display.style.flex = "1 1 auto";
          els.display.style.minWidth = "0";
          els.display.style.overflow = "hidden";
        } else {
          els.row.style.display = "";
          els.row.style.alignItems = "";
          els.row.style.gap = "";
          els.title.style.flex = "";
          els.title.style.minWidth = "";
          els.display.style.flex = "";
          els.display.style.minWidth = "";
          els.display.style.overflow = "";
        }

        // Character gap (between digits/characters)
        const charGap = clampInt(Number(cfg.char_gap_px ?? 6), 0, 40);
        els.display.style.gap = `${charGap}px`;

        // Colors (per row, interval aware)
        const paint = st._activePaint;
        const activeTextColor = paint.color;

        // Dot ON color: follow activeTextColor for all render styles

        const titleDefault = DEFAULT_TITLE_COLOR; // fixed default gray
        const tc = String(cfg.title_color || "").trim();
        els.row.style.setProperty("--asdc-title-color", tc !== "" ? tc : titleDefault);

        els.row.style.setProperty("--asdc-text-color", activeTextColor);
        els.row.style.setProperty("--asdc-dot-on", dotOn);
        els.row.style.setProperty("--asdc-dot-off", (cfg.matrix_dot_off_color || DEFAULTS_GLOBAL.matrix_dot_off_color).toUpperCase());

        // 7-segment LCD style: always show unused segments (faint) so the display looks like a real LCD.
        const showUnused = (style === "segment") ? true : !!cfg.show_unused;
        els.row.style.setProperty("--asdc-unused-fill", showUnused ? (cfg.unused_color || DEFAULTS_GLOBAL.unused_color).toUpperCase() : "transparent");

        }

        if (!__sigSame) st._lastRowSig = __rowSig;

        // Render content only if changed
        if (displayStr !== st.lastText || style !== st._lastStyle) {
          st._lastStyle = style;
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

                  out += svgForMatrixCharPainted(" ", cfg, st._activePaint, dotOn);

                }

              }

              html = out;

            }


            if (html === null) {

              html = this._getCachedDisplayHtml(style, displayStr, cfg, st._activePaint);

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
    
// -------------------- Actions (tap/hold/double tap) --------------------
// HA is inconsistent across browsers/webviews with pointer/dblclick. We therefore use:
// - click -> tap/double (time-based, reliable everywhere)
// - contextmenu -> hold (long-press on touch, right-click on desktop)
// plus pointer-based hold fallback for environments that don't emit contextmenu on long press.

_setupActions() {
  if (this._actionsInitDone) return;
  this._actionsInitDone = true;

  this._asdcAction = {
    bound: false,
    target: null,
    tapTimer: 0,
    lastClickTs: 0,
    ignoreNextClick: false,
    // pointer-hold fallback
    holdTimer: 0,
    downX: 0,
    downY: 0,
    moved: false,
  };
}

_bindActionsToTarget(target) {
  if (!target) return;
  const st = this._asdcAction || (this._asdcAction = {});
  if (st.bound && st.target === target) return;
  if (st.bound) return; // bind once per instance

  st.bound = true;
  st.target = target;

  const DOUBLE_MS = 280;
  const HOLD_MS = 550;
  const MOVE_TOL = 14;

  const debug = (...args) => {
    try {
      if (this._config && this._config.debug_actions) console.debug("[ASDC actions]", ...args);
    } catch (e) {}
  };

  const clearTimers = () => {
    if (st.tapTimer) { clearTimeout(st.tapTimer); st.tapTimer = 0; }
    if (st.holdTimer) { clearTimeout(st.holdTimer); st.holdTimer = 0; }
  };

  // ----- click -> tap/double -----
  const onClick = (ev) => {
    // If a hold just happened, ignore the click that follows.
    if (st.ignoreNextClick) {
      st.ignoreNextClick = false;
      debug("click ignored after hold");
      try { ev?.preventDefault?.(); ev?.stopPropagation?.(); } catch (e) {}
      return;
    }

    const now = Date.now();
    const last = st.lastClickTs || 0;

    // double
    if (now - last <= DOUBLE_MS) {
      st.lastClickTs = 0;
      if (st.tapTimer) { clearTimeout(st.tapTimer); st.tapTimer = 0; }
      debug("double");
      this._doAction("double", ev);
      try { ev?.preventDefault?.(); ev?.stopPropagation?.(); } catch (e) {}
      return;
    }

    // single (defer)
    st.lastClickTs = now;
    if (st.tapTimer) { clearTimeout(st.tapTimer); st.tapTimer = 0; }
    st.tapTimer = setTimeout(() => {
      st.tapTimer = 0;
      st.lastClickTs = 0;
      debug("tap");
      this._doAction("tap", ev);
    }, DOUBLE_MS);
  };

  // ----- contextmenu -> hold (best on touch + right click desktop) -----
  const onContext = (ev) => {
    debug("hold(contextmenu)");
    // contextmenu should never show for cards
    try { ev?.preventDefault?.(); ev?.stopPropagation?.(); } catch (e) {}
    // cancel pending tap/double
    if (st.tapTimer) { clearTimeout(st.tapTimer); st.tapTimer = 0; }
    st.lastClickTs = 0;
    this._doAction("hold", ev);
    // ignore the click that often follows long-press
    st.ignoreNextClick = true;
  };

  // ----- pointer-hold fallback -----
  const onDown = (ev) => {
    // primary button only
    if (ev && ev.button !== undefined && ev.button !== 0) return;

    st.moved = false;
    const p = ev?.touches?.[0] || ev;
    st.downX = p?.clientX ?? 0;
    st.downY = p?.clientY ?? 0;

    if (st.holdTimer) { clearTimeout(st.holdTimer); st.holdTimer = 0; }
    st.holdTimer = setTimeout(() => {
      st.holdTimer = 0;
      if (st.moved) return;
      debug("hold(pointer)");
      // cancel pending tap
      if (st.tapTimer) { clearTimeout(st.tapTimer); st.tapTimer = 0; }
      st.lastClickTs = 0;
      this._doAction("hold", ev);
      st.ignoreNextClick = true;
      try { ev?.preventDefault?.(); ev?.stopPropagation?.(); } catch (e) {}
    }, HOLD_MS);
  };

  const onMove = (ev) => {
    if (!st.holdTimer) return;
    const p = ev?.touches?.[0] || ev;
    const x = p?.clientX ?? 0;
    const y = p?.clientY ?? 0;
    const dx = Math.abs(x - st.downX);
    const dy = Math.abs(y - st.downY);
    if ((dx + dy) > MOVE_TOL) {
      st.moved = true;
      if (st.holdTimer) { clearTimeout(st.holdTimer); st.holdTimer = 0; }
    }
  };

  const onUp = (ev) => {
    if (st.holdTimer) { clearTimeout(st.holdTimer); st.holdTimer = 0; }
  };

  // Bind in capture so internal elements can't swallow events
  target.addEventListener("click", onClick, true);
  target.addEventListener("contextmenu", onContext, true);

  target.addEventListener("pointerdown", onDown, true);
  target.addEventListener("pointermove", onMove, true);
  target.addEventListener("pointerup", onUp, true);
  target.addEventListener("pointercancel", onUp, true);

  target.addEventListener("touchstart", onDown, true);
  target.addEventListener("touchmove", onMove, true);
  target.addEventListener("touchend", onUp, true);
  target.addEventListener("touchcancel", onUp, true);

  target.addEventListener("mousedown", onDown, true);
  target.addEventListener("mousemove", onMove, true);
  target.addEventListener("mouseup", onUp, true);

  debug("bound", target);
}




    _getActiveEntityId
() {
      // Prefer active slide entity if present, else card entity
      try {
        const row = (this._rows && this._rows[0]) ? this._rows[0] : null;
        const slides = row && Array.isArray(row.slides) ? row.slides : (Array.isArray(this._config?.slides) ? this._config.slides : null);
        const si = clampInt(this._slideIndex || 0, 0, slides ? (slides.length - 1) : 0);
        const slide = slides ? slides[si] : null;
        return (slide && slide.entity) ? slide.entity : (this._config && this._config.entity) ? this._config.entity : null;
      } catch (e) {
        return (this._config && this._config.entity) ? this._config.entity : null;
      }
    }

    _getActionConfig(kind) {
      // kind: tap|hold|double
      const slideKey = kind === "double" ? "double_tap_action" : `${kind}_action`;
      const globalKey = slideKey;

      // slide override if present
      try {
        const row = (this._rows && this._rows[0]) ? this._rows[0] : null;
        const slides = row && Array.isArray(row.slides) ? row.slides : (Array.isArray(this._config?.slides) ? this._config.slides : null);
        const si = clampInt(this._slideIndex || 0, 0, slides ? (slides.length - 1) : 0);
        const slide = slides ? slides[si] : null;
        if (slide && slide[slideKey]) return slide[slideKey];
      } catch (e) { /* ignore */ }

      return this._config ? this._config[globalKey] : null;
    }


    _effectiveStyle(cfg) {
      const c = cfg || this._config || {};
      return String(this._runtimeStyle || c.render_style || "segment").toLowerCase();
    }



_toggleRenderMode() {
  const order = ["segment", "matrix", "plain"];
  const cfg = this._config || {};
  const cur = String(this._runtimeStyle || cfg.render_style || "segment").toLowerCase();
  const idx = Math.max(0, order.indexOf(cur));
  const next = order[(idx + 1) % order.length];
  this._runtimeStyle = next;
  this._scheduleRender(true);
}

    _doAction(kind, ev) {
      const hass = this._hass;
      if (!hass) return;

      const cfg = this._getActionConfig(kind);
      if (!cfg || !cfg.action || cfg.action === "none") return;

      const entityId = this._getActiveEntityId();
      const action = String(cfg.action);

      if (action === "toggle-mode") {
        this._toggleRenderMode();
        return;
      }

      if (action === "more-info") {
        if (!entityId) return;
        const e = new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true });
        this.dispatchEvent(e);
        return;
      }

      if (action === "toggle") {
        if (!entityId) return;
        hass.callService("homeassistant", "toggle", { entity_id: entityId });
        return;
      }

      if (action === "navigate") {
        const path = cfg.navigation_path;
        if (!path) return;
        history.pushState(null, "", path);
        window.dispatchEvent(new Event("location-changed", { bubbles: true, composed: true }));
        return;
      }

      if (action === "url") {
        const url = cfg.url_path || cfg.url;
        if (!url) return;
        window.open(url, "_blank");
        return;
      }

      if (action === "call-service") {
        const svc = cfg.service;
        if (!svc || svc.indexOf(".") === -1) return;
        const [domain, service] = svc.split(".");
        const data = cfg.service_data || {};
        hass.callService(domain, service, data);
        return;
      }

      if (action === "fire-dom-event") {
        // Basic support: bubble a custom event with the action payload
        this.dispatchEvent(new CustomEvent("ll-custom", { detail: cfg, bubbles: true, composed: true }));
        return;
      }
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
       
             // ---------- Support (TOP) ----------
      // Only the support block should be at the top. Variables + Symbols remain at the bottom.
      //const secSupportTop = mkSection("Support the project");
      const supportTop = document.createElement("div");
      supportTop.className = "badgeVarsHelp";
      supportTop.innerHTML = `
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
      //secSupportTop.appendChild(supportTop);
      root.appendChild(supportTop);

      

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

      const { wrap: inlWrap, sw: inlSw } = mkSwitch("Title + icon inline (same row)", "title_inline");
      this._elTitleInline = inlSw;
      secGlobal.appendChild(inlWrap);

      this._elTitleReserve = mkText("Reserved title width (px)", "title_reserve_px", "number", "0 = auto");
      secGlobal.appendChild(this._elTitleReserve);

      this._elCharGap = mkText("Character gap (px)", "char_gap_px", "number", "6");
      secGlobal.appendChild(this._elCharGap);

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

      
      // ---------- Actions (tap/hold/double tap) ----------
      const secActions = mkSection("Actions");
      const actHint = document.createElement("div");
      actHint.className = "hint";
      actHint.innerText = "Configure what happens when you tap, hold or double-tap the card (Home Assistant standard actions).";
      secActions.appendChild(actHint);

      const mkActionRow = (labelPrefix) => {
        const wrap = document.createElement("div");
        wrap.className = "actionRow";

        const sel = mkSelect(labelPrefix + " action", `${labelPrefix.toLowerCase()}_action_type`, [
          ["none", "None"],
          ["more-info", "More info"],
          ["toggle", "Toggle"],
          ["toggle-mode", "Toggle display mode"],
          ["navigate", "Navigate"],
          ["url", "URL"],
          ["call-service", "Call service"],
          ["fire-dom-event", "Fire DOM event"],
        ]);

        const nav = mkText(labelPrefix + " navigation path", `${labelPrefix.toLowerCase()}_navigation_path`, "text", "/lovelace/0");
        const url = mkText(labelPrefix + " URL", `${labelPrefix.toLowerCase()}_url`, "text", "https://...");
        const svc = mkText(labelPrefix + " service (domain.service)", `${labelPrefix.toLowerCase()}_service`, "text", "light.toggle");
        const svcData = mkText(labelPrefix + " service_data (JSON)", `${labelPrefix.toLowerCase()}_service_data`, "text", '{"entity_id":"light.kitchen"}');

        nav.classList.add("actionExtra");
        url.classList.add("actionExtra");
        svc.classList.add("actionExtra");
        svcData.classList.add("actionExtra");

        wrap.appendChild(sel);
        wrap.appendChild(nav);
        wrap.appendChild(url);
        wrap.appendChild(svc);
        wrap.appendChild(svcData);

        wrap._sel = sel;
        wrap._nav = nav;
        wrap._url = url;
        wrap._svc = svc;
        wrap._svcData = svcData;
        return wrap;
      };

      this._tapActRow = mkActionRow("Tap");
      this._holdActRow = mkActionRow("Hold");
      this._dblActRow = mkActionRow("Double");

      secActions.appendChild(this._tapActRow);
      secActions.appendChild(this._holdActRow);
      secActions.appendChild(this._dblActRow);

      root.appendChild(secActions);

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
        ["lightning", "lightning bolt"],
        ["house", "house"],
        ["battery", "battery"],
        ["lightbulb", "lightbulb"],
        ["plug", "plug"],
        ["fan", "fan"],
        ["fire", "fire"],
        ["water", "water"],
        ["thermometer", "thermometer"],
        ["arrow_up", "arrow up"],
        ["arrow_down", "arrow down"],
        ["check", "check"],
        ["cross", "cross"],
        ["lock", "lock"],
        ["unlock", "unlock"],

["house_v2", "House v2"],
["tree", "Tree"],
["bolt_v2", "Bolt v2"],
["warning", "warning"],
["heart", "heart"],
["battery_v2", "Battery v2"],
["arrows_lr", "Left/right arrows"],
["arrows_ud", "Up/down arrows"],
["arrows_ud_v2", "Up/down arrows v2"],
["happy", "happy"],
["sad", "sad"],
["skull", "skull"],
["dollar", "$"],
["pound", "£"],
["euro", "€"],
["amp", "&"],
["at", "@"],
["question", "?"],
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


      const secTimer = mkSection("Timer (slide)");
      this._slideTimerMode = mkSelect("Timer display", "__slide_timer_mode", [
        ["remaining", "Remaining (counts down)"],
        ["duration", "Total duration"],
        ["finishes_at", "Finishes at (local time)"],
        ["finishes_in", "Finishes in (same as remaining)"],
        ["state", "State (idle/active/paused)"],
      ]);
      secTimer.appendChild(this._slideTimerMode);
      this._slideEditor.appendChild(secTimer);

      // Dot-matrix progress bar
      const secProg = mkSection("Dot-matrix progress bar (slide)");
      const { wrap: pbWrap, sw: pbSw } = mkSwitch("Render numeric value as a progress bar (fills dots)", "__slide_matrix_progress");
      this._slideMatrixProgress = pbSw;
      secProg.appendChild(pbWrap);

      this._slideProgMin = mkText("Progress min", "__slide_progress_min", "number", "0");
      tuneNumericTextfield(this._slideProgMin, { allowNegative: true, allowDecimal: true });
      secProg.appendChild(this._slideProgMin);
      this._slideProgMax = mkText("Progress max", "__slide_progress_max", "number", "100");
      tuneNumericTextfield(this._slideProgMax, { allowNegative: true, allowDecimal: true });
      secProg.appendChild(this._slideProgMax);

      this._slideProgColorMode = mkSelect("Progressbar colors", "__slide_progress_color_mode", [
        ["active", "Use active interval color"],
        ["intervals", "Use all interval colors"],
      ]);
      secProg.appendChild(this._slideProgColorMode);

      const btnPreset = mkButton("Create Progressbar (preset)", () => this._applyProgressPreset());
      btnPreset.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        // Apply a safe preset to the current slide: enable matrix_progress and set common defaults.
        const slides = (this._config.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
        const idx = clampInt(this._activeSlide || 0, 0, slides.length - 1);
        slides[idx] = {
          ...slides[idx],
          matrix_progress: true,
          progress_min: 0,
          progress_max: 100,
          progress_color_mode: "active",
        };
        const next = { ...this._config, slides };
        // keep row mirror
        if (Array.isArray(next.rows) && next.rows[next.rows.length ? this._activeRow : 0]) {
          const r = next.rows[this._activeRow] || {};
          const rs = (r.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
          rs[idx] = { ...rs[idx], ...slides[idx] };
          const rows = [...next.rows];
          rows[this._activeRow] = { ...r, slides: rs };
          next.rows = rows;
        }
        this._commitFull(next);
        this._sync();
      });
      secProg.appendChild(btnPreset);

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
      tuneNumericTextfield(this._slideStay, { allowNegative: false, allowDecimal: true });
      secSwitch.appendChild(this._slideStay);
      this._slideOut = mkText("Out seconds", "__slide_out_s", "number", "0.5");
      tuneNumericTextfield(this._slideOut, { allowNegative: false, allowDecimal: true });
      secSwitch.appendChild(this._slideOut);
      this._slideIn = mkText("In seconds", "__slide_in_s", "number", "0.5");
      tuneNumericTextfield(this._slideIn, { allowNegative: false, allowDecimal: true });
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
        ["fade", "Fade (calm)"],
      ]);
      secSwitch.appendChild(this._slideShowStyle);

      this._slideHideStyle = mkSelect("Hide style", "__slide_hide_style", [
        ["run_left", "Left"],
        ["run_top", "Top"],
        ["run_right", "Right"],
        ["run_bottom", "Bottom"],
        ["billboard", "Billboard"],
        ["matrix", "Matrix"],
        ["fade", "Fade (calm)"],
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
        

        .colorRow { display:grid; grid-template-columns: 1fr 44px; align-items:end; gap:10px; }
        .colorRow ha-textfield { width: 100%; }

        .colorBtn{
          width: 44px;
          height: 44px;
          padding: 0;
          border: 1px solid rgba(0,0,0,0.25);
          border-radius: 8px;
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
          display:flex;
          flex-direction:column;
          gap:10px;
        }
        .intervalRow1{
          display:grid;
          grid-template-columns: minmax(90px, 120px) minmax(90px, 120px) minmax(140px, 1fr) minmax(220px, 2fr) minmax(90px, 110px) minmax(170px, 1fr);
          gap:10px;
          align-items:end;
        }
        .intervalSpacer{ min-height:1px; }

        .intervalRow2{
          display:grid;
          grid-template-columns: minmax(170px, 1fr) minmax(170px, 1fr) auto;
          gap:10px;
          align-items:end;
        }
        .intervalRow ha-select { width: 100%; }
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
      .badgeSymGrid{ display:grid; grid-template-columns: 1fr; gap: 2px; }
      .badgeSymRow{ display:grid; grid-template-columns: 140px 1fr 60px; gap: 10px; align-items:center; padding: 3px 8px; border-radius:10px;
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
      
        .hint{ font-size:12px; opacity:.75; }
        .actionRow{ display:grid; grid-template-columns: 1fr 1fr; gap:10px; align-items:end; }
        .actionExtra{ }
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
      this._isSyncing = true;
      try {

      // Global
      this._elRenderStyle.value = this._config.render_style || "segment";
      this._elSize.value = String(this._config.size_px ?? 0);

      this._elItalic.checked = !!this._config.italic;
      this._elCenter.checked = !!this._config.center_text;

      this._elShowTitle.checked = (this._config.show_title !== false);

      // Title inline + reserved width + char gap
      this._elTitleInline.checked = !!this._config.title_inline;
      if (this._elTitleReserve) this._elTitleReserve.value = String(this._config.title_reserve_px ?? 0);
      if (this._elCharGap) this._elCharGap.value = String(this._config.char_gap_px ?? DEFAULTS_GLOBAL.char_gap_px);

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

      // Actions (global)
      const syncAct = (rowEl, act, prefix) => {
        if (!rowEl) return;
        const sel = rowEl._sel;
        const nav = rowEl._nav;
        const url = rowEl._url;
        const svc = rowEl._svc;
        const svcData = rowEl._svcData;

        const actionType = (act && act.action) ? String(act.action) : "none";
        sel.value = actionType;

        // Store helper values so _commit can map them
        this._config[`${prefix}_action_type`] = actionType;
        this._config[`${prefix}_navigation_path`] = (act && act.navigation_path) ? String(act.navigation_path) : "";
        this._config[`${prefix}_url`] = (act && (act.url_path || act.url)) ? String(act.url_path || act.url) : "";
        this._config[`${prefix}_service`] = (act && act.service) ? String(act.service) : "";
        this._config[`${prefix}_service_data`] = (act && act.service_data) ? JSON.stringify(act.service_data) : "";

        nav.value = this._config[`${prefix}_navigation_path`] || "";
        url.value = this._config[`${prefix}_url`] || "";
        svc.value = this._config[`${prefix}_service`] || "";
        svcData.value = this._config[`${prefix}_service_data`] || "";

        const showNav = actionType === "navigate";
        const showUrl = actionType === "url";
        const showSvc = actionType === "call-service" || actionType === "fire-dom-event";

        nav.style.display = showNav ? "" : "none";
        url.style.display = showUrl ? "" : "none";
        svc.style.display = showSvc ? "" : "none";
        svcData.style.display = showSvc ? "" : "none";
      };

      syncAct(this._tapActRow, this._config.tap_action, "tap");
      syncAct(this._holdActRow, this._config.hold_action, "hold");
      syncAct(this._dblActRow, this._config.double_tap_action, "double");

      this._renderIntervals();

      this._config.rows = normalizeRowsConfig(this._config.rows, this._config.slides);

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
      } finally {
        this._isSyncing = false;
      }
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

      const _rs = String(this._config.render_style || "segment").toLowerCase();
      const _isPlain = (_rs === "plain");
      const _isSegOrMat = (_rs === "segment" || _rs === "matrix");

      intervals.forEach((it, idx) => {
        const wrap = document.createElement("div");
        wrap.className = "intervalRow";

        const row = document.createElement("div");
        row.className = "intervalRow1";

        const row2 = document.createElement("div");
        row2.className = "intervalRow2";

        wrap.appendChild(row);
        wrap.appendChild(row2);

        const from = document.createElement("ha-textfield");
        from.label = "Value from";
        tuneNumericTextfield(from, { allowNegative: true, allowDecimal: true });
        from.value = (typeof it.from === "number" || typeof it.from === "string") ? String(it.from) : "";
        from.dataset.slideIntervalIndex = String(idx);
        from.dataset.slideIntervalKey = "from";
        from.addEventListener("change", (e) => this._onSlideIntervalChange(e));
        from.addEventListener("value-changed", (e) => this._onSlideIntervalChange(e));

        const to = document.createElement("ha-textfield");
        to.label = "To";
        tuneNumericTextfield(to, { allowNegative: true, allowDecimal: true });
        to.value = (typeof it.to === "number" || typeof it.to === "string") ? String(it.to) : "";
        to.dataset.slideIntervalIndex = String(idx);
        to.dataset.slideIntervalKey = "to";
        to.addEventListener("change", (e) => this._onSlideIntervalChange(e));
        to.addEventListener("value-changed", (e) => this._onSlideIntervalChange(e));

        const match = document.createElement("ha-textfield");
        match.label = "Match value";
        match.placeholder = "e.g. on, off, open, closed";
        match.value = (typeof it.match === "string") ? it.match : "";
        match.dataset.slideIntervalIndex = String(idx);
        match.dataset.slideIntervalKey = "match";
        match.addEventListener("change", (e) => this._onSlideIntervalChange(e));
        match.addEventListener("value-changed", (e) => this._onSlideIntervalChange(e));

        const newValue = document.createElement("ha-textfield");
        newValue.label = "NewValue (optional)";
        newValue.placeholder = "e.g. <value>°C <thermometer> or Too hot!";
        newValue.value = (typeof it.new_value === "string") ? it.new_value : "";
        newValue.dataset.slideIntervalIndex = String(idx);
        newValue.dataset.slideIntervalKey = "new_value";
        newValue.addEventListener("change", (e) => this._onSlideIntervalChange(e));
        newValue.addEventListener("value-changed", (e) => this._onSlideIntervalChange(e));

        const neonStrength = document.createElement("ha-textfield");
        neonStrength.label = "Neon %";
        tuneNumericTextfield(neonStrength, { allowNegative: false, allowDecimal: false });
        neonStrength.step = "1";
        neonStrength.placeholder = "0";
        neonStrength.value = (typeof it.neon_strength === "number" || typeof it.neon_strength === "string") ? String(it.neon_strength) : "";
        neonStrength.dataset.slideIntervalIndex = String(idx);
        neonStrength.dataset.slideIntervalKey = "neon_strength";
        neonStrength.addEventListener("change", (e) => this._onSlideIntervalChange(e));
        neonStrength.addEventListener("value-changed", (e) => this._onSlideIntervalChange(e));


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

        // Gradient (only for Segment + Matrix). Enabled when Color To is set.
        const colorToRow = document.createElement("div");
        colorToRow.className = "colorRow";
        const tfTo = document.createElement("ha-textfield");
        tfTo.label = "Color To (gradient)";
        tfTo.value = String(it.color_to || "").toUpperCase();
        tfTo.dataset.slideIntervalIndex = String(idx);
        tfTo.dataset.slideIntervalKey = "color_to";
        tfTo.addEventListener("change", (e) => this._onSlideIntervalChange(e));
        tfTo.addEventListener("value-changed", (e) => this._onSlideIntervalChange(e));

        const btnTo = document.createElement("input");
        btnTo.type = "color";
        btnTo.className = "colorBtn";
        btnTo.value = (tfTo.value && /^#/.test(tfTo.value)) ? tfTo.value : "#000000";
        btnTo.addEventListener("input", (e) => {
          const v = String(e.target.value || "").toUpperCase();
          tfTo.value = v;
        });
        btnTo.addEventListener("change", (e) => {
          const v = String(e.target.value || "").toUpperCase();
          tfTo.value = v;
          this._setSlideIntervalValue(idx, "color_to", v, /*noSync*/ true);
        });
        colorToRow.appendChild(tfTo);
        colorToRow.appendChild(btnTo);

        const gradStyle = document.createElement("ha-select");
        gradStyle.label = "Gradient style";
        gradStyle.dataset.slideIntervalIndex = String(idx);
        gradStyle.dataset.slideIntervalKey = "gradient_style";
        const gs = String(it.gradient_style || "linear").toLowerCase();

        // Use .value to keep HA editor in sync (selected attr is unreliable across versions)
        gradStyle.innerHTML = `
          <mwc-list-item value="linear">Linear</mwc-list-item>
          <mwc-list-item value="two-tone">Two-tone</mwc-list-item>
          <mwc-list-item value="inside-out">Inside-out</mwc-list-item>
          <mwc-list-item value="outside-in">Outside-in</mwc-list-item>
        `;
        gradStyle.value = gs || "linear";
                // IMPORTANT: ha-select/mwc-select can close the HA visual editor if we emit config-changed
        // while the dropdown menu is still closing, or if events bubble to HA's dialog handlers.
        // Strategy: stop propagation + capture on change + commit on "closed".
        const _stopGS = (e) => { try { e.stopPropagation(); } catch(_){} };
        ["click","mousedown","mouseup","keydown","opened"].forEach((ev) => gradStyle.addEventListener(ev, _stopGS));
        gradStyle.__asdcPending = null;

        const _captureGS = (val) => {
          const next = String(val || "linear").trim().toLowerCase() || "linear";
          const cur = String(it?.gradient_style || gradStyle.value || "linear").trim().toLowerCase() || "linear";
          if (next === cur) { gradStyle.__asdcPending = null; return; }
          gradStyle.__asdcPending = next;
        };

        gradStyle.addEventListener("value-changed", (e) => {
          if (this._isSyncing) return;
          _stopGS(e);
          _captureGS(this._eventValue(e, gradStyle));
        });

        gradStyle.addEventListener("selected", (e) => {
          if (this._isSyncing) return;
          _stopGS(e);
          _captureGS(e?.detail?.value ?? gradStyle.value);
        });

        gradStyle.addEventListener("closed", (e) => {
          if (this._isSyncing) return;
          _stopGS(e);
          const next = gradStyle.__asdcPending;
          if (!next) return;
          gradStyle.__asdcPending = null;
          try {
            this._setSlideIntervalValue(idx, "gradient_style", next, /*noSync*/ true);
          } catch (err) {
            console.error("ASDC editor: gradient_style update failed", err);
          }
        });

// Show/Hide per render style
        if (_isSegOrMat) {
          // ok
        } else {
          colorToRow.style.display = "none";
          gradStyle.style.display = "none";
        }

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
        row.appendChild(match);
        row.appendChild(newValue);

        // Neon % only for Plain text
        if (_isPlain) {
          row.appendChild(neonStrength);
        } else {
          const spacer = document.createElement("div");
          spacer.className = "intervalSpacer";
          row.appendChild(spacer);
        }

        row.appendChild(colorRow);

        // Gradient inputs only for Segment + Matrix (enabled if Color To is set)
        if (_isSegOrMat) {
          row2.appendChild(colorToRow);
          row2.appendChild(gradStyle);
        }

        row2.appendChild(del);
        list.appendChild(wrap);
      });
    }

    _onSlideIntervalChange(ev) {
      if (this._isSyncing) return;
      const target = ev.currentTarget || ev.target;
      const idx = Number(target?.dataset?.slideIntervalIndex);
      const key = String(target?.dataset?.slideIntervalKey || "");
      if (!Number.isFinite(idx) || !key) return;

      const raw = this._eventValue(ev, target);
      if (key === "color" || key === "color_to") {
        const norm = this._rowText._normalizeHex(raw, false);
        if (norm === null) return;
        this._setSlideIntervalValue(idx, key, norm, /*noSync*/ true);
        return;
      }

      // String keys
      if (key === "match" || key === "new_value" || key === "gradient_style") {
        this._setSlideIntervalValue(idx, key, String(raw ?? ""), /*noSync*/ true);
        return;
      }

      const num = parseEditorNumber(raw);
      let val = Number.isFinite(num) ? num : null;

      // Neon is integer percent (0..100), step 1 in editor.
      if (key === "neon_strength" && val !== null) {
        val = Math.round(val);
      }

      this._setSlideIntervalValue(idx, key, val, /*noSync*/ true);
    }

    _setSlideIntervalValue(idx, key, value, noSync = false) {
      const next = { ...this._config };

      // Intervals can be defined globally (legacy) or per slide (preferred).
      const hasSlides = Array.isArray(next.slides) && next.slides.length > 0;

      let intervals;
      let slides = null;
      let si = 0;
      let s = null;

      if (hasSlides) {
        slides = (next.slides || []).map(sl => ({ ...DEFAULT_SLIDE, ...(sl || {}) }));
        si = clampInt(this._activeSlide || 0, 0, slides.length - 1);
        s = { ...slides[si] };
        intervals = Array.isArray(s.color_intervals) ? [...s.color_intervals] : [];
      } else {
        intervals = Array.isArray(next.color_intervals) ? [...next.color_intervals] : [];
      }

      const it = { ...(intervals[idx] || {}) };

      if (key === "from" || key === "to") {
        const num = parseEditorNumber(value);
        it[key] = Number.isFinite(num) ? num : 0;
      } else if (key === "match") {
        it.match = String(value || "").trim();
      } else if (key === "new_value") {
        it.new_value = String(value || "");
      } else if (key === "neon_strength") {
        const num = parseEditorNumber(value);
        it.neon_strength = Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : null;
      } else if (key === "color") {
        const s2 = String(value || "").trim();
        if (/^#([0-9a-fA-F]{3}){1,2}$/.test(s2)) it.color = s2.toUpperCase();
        else it.color = s2;
      } else if (key === "color_to") {
        const s2 = String(value || "").trim();
        if (/^#([0-9a-fA-F]{3}){1,2}$/.test(s2)) it.color_to = s2.toUpperCase();
        else it.color_to = s2;
      } else if (key === "gradient_style") {
        const nextGs = String(value || "linear").trim().toLowerCase() || "linear";
        const prevGs = String(it.gradient_style || "linear").trim().toLowerCase() || "linear";
        if (nextGs === prevGs) {
          // Avoid redundant commits triggered by duplicate select events
          return;
        }
        it.gradient_style = nextGs;
      } else {
        it[key] = value;
      }

      intervals[idx] = it;

      if (hasSlides) {
        s.color_intervals = intervals;
        slides[si] = s;
        next.slides = slides;
      } else {
        next.color_intervals = intervals;
      }

      this._commitFull(next);
      if (!noSync) this._sync();
    }

    _renderIntervals() {
      const list = this._intervalList;
      if (!list) return;
      list.innerHTML = "";

      // Intervals can exist globally (legacy) and/or per-slide.
      // Prefer per-slide if it has any intervals, otherwise fall back to global.
      const hasSlides = Array.isArray(this._config?.slides) && this._config.slides.length > 0;
      const slides = hasSlides ? this._config.slides : null;
      const si = hasSlides ? clampInt(this._activeSlide || 0, 0, slides.length - 1) : 0;
      const slideObj = hasSlides ? (slides[si] || {}) : null;

      const slideIntervals = (hasSlides && Array.isArray(slideObj.color_intervals)) ? slideObj.color_intervals : [];
      const globalIntervals = Array.isArray(this._config.color_intervals) ? this._config.color_intervals : [];

      const useSlideIntervals = slideIntervals.length > 0 || globalIntervals.length === 0;
      this._intervalSource = useSlideIntervals ? "slide" : "global";
      const intervals = useSlideIntervals ? slideIntervals : globalIntervals;

      const rs = String(this._config.render_style || "segment").toLowerCase();
      const isPlain = (rs === "plain");
      const isSegOrMat = (rs === "segment" || rs === "matrix");

      const setFieldMeta = (el, idx, key) => {
        el.dataset.intervalIndex = String(idx);
        el.dataset.intervalKey = String(key);
      };

      intervals.forEach((it, idx) => {
        const wrap = document.createElement("div");
        wrap.className = "intervalRow";

        const row1 = document.createElement("div");
        row1.className = "intervalRow1";

        const row2 = document.createElement("div");
        row2.className = "intervalRow2";

        wrap.appendChild(row1);
        wrap.appendChild(row2);

        // --- Row 1: from / to / match / new_value / neon (plain only) / color ---
        const from = document.createElement("ha-textfield");
        from.label = "Value from";
        tuneNumericTextfield(from, { allowNegative: true, allowDecimal: true });
        from.value = (it?.from !== undefined && it?.from !== null) ? String(it.from) : "";
        setFieldMeta(from, idx, "from");
        from.addEventListener("change", (e) => this._onIntervalChange(e));
        from.addEventListener("value-changed", (e) => this._onIntervalChange(e));

        const to = document.createElement("ha-textfield");
        to.label = "To";
        tuneNumericTextfield(to, { allowNegative: true, allowDecimal: true });
        to.value = (it?.to !== undefined && it?.to !== null) ? String(it.to) : "";
        setFieldMeta(to, idx, "to");
        to.addEventListener("change", (e) => this._onIntervalChange(e));
        to.addEventListener("value-changed", (e) => this._onIntervalChange(e));

        const match = document.createElement("ha-textfield");
        match.label = "Match (optional)";
        match.value = (typeof it?.match === "string") ? it.match : "";
        setFieldMeta(match, idx, "match");
        match.addEventListener("change", (e) => this._onIntervalChange(e));
        match.addEventListener("value-changed", (e) => this._onIntervalChange(e));

        const newVal = document.createElement("ha-textfield");
        newVal.label = "New value";
        newVal.value = (typeof it?.new_value === "string") ? it.new_value : "";
        setFieldMeta(newVal, idx, "new_value");
        newVal.addEventListener("change", (e) => this._onIntervalChange(e));
        newVal.addEventListener("value-changed", (e) => this._onIntervalChange(e));

        const neon = document.createElement("ha-textfield");
        neon.label = "Neon %";
        tuneNumericTextfield(neon, { allowNegative: false, allowDecimal: false });
        neon.step = "1";
        neon.value = (it?.neon_strength !== undefined && it?.neon_strength !== null) ? String(it.neon_strength) : "0";
        setFieldMeta(neon, idx, "neon_strength");
        neon.addEventListener("change", (e) => this._onIntervalChange(e));
        neon.addEventListener("value-changed", (e) => this._onIntervalChange(e));

        const colorRow = document.createElement("div");
        colorRow.className = "colorRow";
        const color = document.createElement("ha-textfield");
        color.label = "Color";
        color.value = String(it?.color || this._config.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase();
        setFieldMeta(color, idx, "color");
        color.addEventListener("change", (e) => this._onIntervalChange(e));
        color.addEventListener("value-changed", (e) => this._onIntervalChange(e));

        const colorBtn = document.createElement("input");
        colorBtn.type = "color";
        colorBtn.className = "colorBtn";
        colorBtn.value = (/^#([0-9a-f]{6})$/i.test(color.value)) ? color.value : "#000000";
        colorBtn.addEventListener("input", (e) => { color.value = String(e.target.value || "").toUpperCase(); });
        colorBtn.addEventListener("change", (e) => {
          color.value = String(e.target.value || "").toUpperCase();
          // commit immediately (no dropdown menu lifecycle to fight)
          this._setIntervalValue(idx, "color", color.value, /*noSync*/ true);
        });

        colorRow.appendChild(color);
        colorRow.appendChild(colorBtn);

        row1.appendChild(from);
        row1.appendChild(to);
        row1.appendChild(match);
        row1.appendChild(newVal);
        if (isPlain) {
          row1.appendChild(neon);
        } else {
          const spacer = document.createElement("div");
          spacer.className = "intervalSpacer";
          row1.appendChild(spacer);
        }
        row1.appendChild(colorRow);

        // --- Row 2: Color To + Gradient style (segment/matrix only) + Delete ---
        if (isSegOrMat) {
          const colorToRow = document.createElement("div");
          colorToRow.className = "colorRow";

          const colorTo = document.createElement("ha-textfield");
          colorTo.label = "Color To";
          colorTo.value = String(it?.color_to || "").toUpperCase();
          setFieldMeta(colorTo, idx, "color_to");
          colorTo.addEventListener("change", (e) => this._onIntervalChange(e));
          colorTo.addEventListener("value-changed", (e) => this._onIntervalChange(e));

          const colorToBtn = document.createElement("input");
          colorToBtn.type = "color";
          colorToBtn.className = "colorBtn";
          colorToBtn.value = (/^#([0-9a-f]{6})$/i.test(colorTo.value)) ? colorTo.value : "#000000";
          colorToBtn.addEventListener("input", (e) => { colorTo.value = String(e.target.value || "").toUpperCase(); });
          colorToBtn.addEventListener("change", (e) => {
            colorTo.value = String(e.target.value || "").toUpperCase();
            this._setIntervalValue(idx, "color_to", colorTo.value, /*noSync*/ true);
          });

          colorToRow.appendChild(colorTo);
          colorToRow.appendChild(colorToBtn);

          const gradStyle = document.createElement("ha-select");
          gradStyle.label = "Gradient style";
          // IMPORTANT: use dataset keys expected by _onIntervalChange (and set .value)
          setFieldMeta(gradStyle, idx, "gradient_style");
          gradStyle.innerHTML = `
            <mwc-list-item value="linear">Linear</mwc-list-item>
            <mwc-list-item value="two-tone">Two-tone</mwc-list-item>
            <mwc-list-item value="inside-out">Inside-out</mwc-list-item>
            <mwc-list-item value="outside-in">Outside-in</mwc-list-item>
          `;
          gradStyle.value = String(it?.gradient_style || "linear").toLowerCase();

                    // IMPORTANT: ha-select/mwc-select can close the HA visual editor if we emit config-changed
          // while the dropdown menu is still closing, or if events bubble to HA's dialog handlers.
          // Strategy:
          // 1) Stop propagation for the select's interaction events.
          // 2) Capture chosen value on value-changed/selected (no commit).
          // 3) Commit on "closed" (menu teardown finished).
          const _stopGS = (e) => { try { e.stopPropagation(); } catch(_){} };
          ["click","mousedown","mouseup","keydown","opened"].forEach((ev) => gradStyle.addEventListener(ev, _stopGS));
          gradStyle.__asdcPending = null;

          const _captureGS = (val) => {
            const next = String(val || "linear").trim().toLowerCase() || "linear";
            const cur = String((it && it.gradient_style) || gradStyle.value || "linear").trim().toLowerCase() || "linear";
            if (next === cur) { gradStyle.__asdcPending = null; return; }
            gradStyle.__asdcPending = next;
          };

          gradStyle.addEventListener("value-changed", (e) => {
            if (this._isSyncing) return;
            _stopGS(e);
            _captureGS(this._eventValue(e, gradStyle));
          });

          gradStyle.addEventListener("selected", (e) => {
            if (this._isSyncing) return;
            _stopGS(e);
            _captureGS(e?.detail?.value ?? gradStyle.value);
          });

          gradStyle.addEventListener("closed", (e) => {
            if (this._isSyncing) return;
            _stopGS(e);
            const next = gradStyle.__asdcPending;
            if (!next) return;
            gradStyle.__asdcPending = null;
            try {
              this._setIntervalValue(idx, "gradient_style", next, /*noSync*/ true);
            } catch (err) {
              console.error("ASDC editor: gradient_style update failed", err);
            }
          });

row2.appendChild(colorToRow);
          row2.appendChild(gradStyle);
        } else {
          const spacer = document.createElement("div");
          spacer.className = "spacer";
          row2.appendChild(spacer);
        }

        const del = document.createElement("button");
        del.className = "btnDelete";
        del.innerText = "Delete";
        del.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          this._delInterval(idx);
        });
        row2.appendChild(del);

        list.appendChild(wrap);
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
      const isTimer = (String(s.entity || "").split(".")[0] === "timer");
      if (this._slideTimerMode) {
        this._slideTimerMode.value = String(s.timer_mode || (isTimer ? "remaining" : "remaining"));
        this._slideTimerMode.disabled = !isTimer;
      }


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
      // Map flat action editor fields -> HA action config objects
      const applyAction = (prefix, targetKey) => {
        const t = next[`${prefix}_action_type`];
        if (!t) return;
        const act = { action: t };
        if (t === "navigate" && next[`${prefix}_navigation_path`]) act.navigation_path = next[`${prefix}_navigation_path`];
        if (t === "url" && next[`${prefix}_url`]) act.url_path = next[`${prefix}_url`];
        if ((t === "call-service" || t === "fire-dom-event") && next[`${prefix}_service`]) act.service = next[`${prefix}_service`];
        if (t === "call-service" || t === "fire-dom-event") {
          const raw = next[`${prefix}_service_data`];
          if (raw) {
            try { act.service_data = JSON.parse(raw); } catch (e) { /* ignore parse errors */ }
          }
        }
        next[targetKey] = act;
      };

      applyAction("tap", "tap_action");
      applyAction("hold", "hold_action");
      applyAction("double", "double_tap_action");

      // Keep helper keys in the *editor* state (so UI can react instantly),
      // but strip them from the emitted Lovelace config.
      const _stripActionHelpers = (obj) => {
        const out = { ...obj };
        ["tap","hold","double"].forEach(p => {
          delete out[`${p}_action_type`];
          delete out[`${p}_navigation_path`];
          delete out[`${p}_url`];
          delete out[`${p}_service`];
          delete out[`${p}_service_data`];
        });
        return out;
      };

      next.color_intervals = this._config.color_intervals || [];

      // Preserve / normalize rows
      next.rows = normalizeRowsConfig(this._config.rows, this._config.slides || [{ ...DEFAULT_SLIDE, title:"Slide 1" }]);

      // Canonical top-level slides mirrors Row 1
      next.slides = next.rows[0].slides;

      // Keep internal editor state (with helper keys) so conditional fields stay visible while editing
      this._config = next;

      // Emit a clean config (without helper keys)
      const emitCfg = _stripActionHelpers(next);

      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: emitCfg },
        bubbles: true,
        composed: true,
      }));

      // Refresh editor UI so extra fields appear/disappear immediately
      try { this._sync(); } catch (e) {}
    }

    _commitFull(nextConfig) {
      if (this._origType && !nextConfig.type) nextConfig.type = this._origType;

      // Ensure rows exist
      let rows = normalizeRowsConfig(
        nextConfig.rows,
        (Array.isArray(nextConfig.slides) && nextConfig.slides.length)
          ? nextConfig.slides
          : [{ ...DEFAULT_SLIDE, title:"Slide 1" }]
      );

      // Ensure exactly one default row flag exists (movable but not deletable)
      if (!rows.some(r => r && r.is_default)) {
        if (rows[0]) rows[0].is_default = true;
      }
      const ar = clampInt(this._activeRow || 0, 0, rows.length - 1);
      const activeSlides = normalizeSlidesConfig(
        (Array.isArray(nextConfig.slides) && nextConfig.slides.length)
          ? nextConfig.slides
          : [{ ...DEFAULT_SLIDE, title:"Slide 1" }]
      );

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

      // ha-select / mwc-select: value handling can differ between events
      const t = target;
      try {
        const name = (t && (t.localName || t.tagName || "")).toString().toLowerCase();
        if (name === "ha-select" || name === "mwc-select") {
          if (typeof t.value !== "undefined" && t.value !== null && String(t.value) !== "") return t.value;
          // Fallback: resolve from selected index and items
          const sel = (typeof t.selected !== "undefined") ? Number(t.selected) : NaN;
          const items = t.items || t.querySelectorAll?.("mwc-list-item");
          if (Number.isFinite(sel) && items && items.length && items[sel]) {
            const v = items[sel].getAttribute?.("value") ?? items[sel].value;
            if (typeof v !== "undefined") return v;
          }
        }
      } catch (e) {}

      return t ? t.value : undefined;
    }

    _onChange(ev) {
      if (this._isSyncing) return;
      const target = ev.currentTarget || ev.target;
      const key = target.configValue || target.dataset?.configValue;
      if (!key) return;

      // Route slide-scoped editor fields through the slide handler
      if (String(key).startsWith("__slide_")) {
        return this._onSlideChange(String(key), ev);
      }

      if (typeof target.checked !== "undefined") {
        if (key === "italic" || key === "center_text" || key === "show_unused" || key === "show_title" || key === "title_inline") {
          return this._commit(key, !!target.checked);
        }
      }

      let value = this._eventValue(ev, target);

      if (key === "size_px" || key === "max_chars" || key === "title_reserve_px" || key === "char_gap_px") {
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
      // Action editor fields (tap/hold/double): commit and re-sync so conditional fields show immediately
      if (String(key).startsWith("tap_") || String(key).startsWith("hold_") || String(key).startsWith("double_")) {
        this._commit(key, value);
        this._sync();
        return;
      }

      // Default commit for simple text/select fields
      this._commit(key, value);
      this._sync();
      return;

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

      if (key === "__slide_timer_mode") {
        const vv = String(v || "remaining");
        const ok = ["remaining","duration","finishes_at","finishes_in","state"];
        this._slideCommitField("timer_mode", ok.includes(vv) ? vv : "remaining");
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
        const num = parseEditorNumber(v);
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
        const num = parseEditorNumber(v);
        const val = Number.isFinite(num) ? num : null;
        const field = (key === "__slide_progress_min") ? "progress_min" : "progress_max";
        this._slideCommitField(field, (val === null ? (field === "progress_min" ? 0 : 100) : val));
        return;
      }


      if (key === "__slide_decimals" || key === "__slide_auto_decimals") {
        const num = parseEditorNumber(v);
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
        const num = parseEditorNumber(v);
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

      const hasSlides = Array.isArray(next.slides) && next.slides.length > 0;
      const useSlide = (this._intervalSource === "slide") && hasSlides;

      if (useSlide) {
        const slides = (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
        const si = clampInt(this._activeSlide || 0, 0, slides.length - 1);
        const s = { ...slides[si] };
        const ints = Array.isArray(s.color_intervals) ? [...s.color_intervals] : [];
        ints.push({ from: 0, to: 0, color: (next.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase() });
        s.color_intervals = ints;
        slides[si] = s;
        next.slides = slides;
      } else {
        const ints = Array.isArray(next.color_intervals) ? [...next.color_intervals] : [];
        ints.push({ from: 0, to: 0, color: (next.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase() });
        next.color_intervals = ints;
      }

      this._commitFull(next);
      this._sync();
    }

    _deleteInterval(idx) {
      const next = { ...this._config };

      const hasSlides = Array.isArray(next.slides) && next.slides.length > 0;
      const useSlide = (this._intervalSource === "slide") && hasSlides;

      if (useSlide) {
        const slides = (next.slides || []).map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) }));
        const si = clampInt(this._activeSlide || 0, 0, slides.length - 1);
        const s = { ...slides[si] };
        const ints = Array.isArray(s.color_intervals) ? [...s.color_intervals] : [];
        ints.splice(idx, 1);
        s.color_intervals = ints;
        slides[si] = s;
        next.slides = slides;
      } else {
        const ints = Array.isArray(next.color_intervals) ? [...next.color_intervals] : [];
        ints.splice(idx, 1);
        next.color_intervals = ints;
      }

      this._commitFull(next);
      this._sync();
    }

    _setIntervalValue(idx, key, value, noSync) {
      const next = { ...this._config };

      const hasSlides = Array.isArray(next.slides) && next.slides.length > 0;
      const useSlide = (this._intervalSource === "slide") && hasSlides;

      let ints = [];
      let slides = null;
      let si = 0;
      let s = null;

      if (useSlide) {
        slides = (next.slides || []).map(sl => ({ ...DEFAULT_SLIDE, ...(sl || {}) }));
        si = clampInt(this._activeSlide || 0, 0, slides.length - 1);
        s = { ...slides[si] };
        ints = Array.isArray(s.color_intervals) ? [...s.color_intervals] : [];
      } else {
        ints = Array.isArray(next.color_intervals) ? [...next.color_intervals] : [];
      }

      const it = { ...(ints[idx] || {}) };

      if (key === "from" || key === "to") {
        const num = parseEditorNumber(value);
        it[key] = Number.isFinite(num) ? num : 0;
      } else if (key === "match") {
        it.match = String(value || "").trim();
      } else if (key === "new_value") {
        it.new_value = String(value || "");
      } else if (key === "neon_strength") {
        const num = parseEditorNumber(value);
        it.neon_strength = Number.isFinite(num) ? Math.max(0, Math.min(100, Math.round(num))) : null;
      } else if (key === "color" || key === "color_to") {
        const norm = this._rowText._normalizeHex(String(value || ""), false);
        if (norm === null) return;
        it[key] = norm.toUpperCase();
      } else if (key === "gradient_style") {
        const gs = String(value || "linear").trim().toLowerCase() || "linear";
        it.gradient_style = gs;
      } else {
        it[key] = value;
      }

      ints[idx] = it;

      if (useSlide) {
        s.color_intervals = ints;
        slides[si] = s;
        next.slides = slides;
      } else {
        next.color_intervals = ints;
      }

      this._commitFull(next);
      if (!noSync) this._sync();
    }

    _onIntervalChange(ev) {
      if (this._isSyncing) return;
      const t = ev.currentTarget || ev.target;
      const idx = Number(t?.dataset?.intervalIndex);
      const key = String(t?.dataset?.intervalKey || "");
      if (!Number.isFinite(idx) || !key) return;
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
