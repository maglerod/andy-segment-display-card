/* Andy Segment Display Card (Home Assistant Lovelace Custom Card)
 * v2.0
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
 * 2.0 - 2026-01-22
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
  console.info("Andy Segment Display Card loaded: v2.0.0");

  const CARD_TAG = "andy-segment-display-card";
  const EDITOR_TAG = `${CARD_TAG}-editor`;

  // -------------------- Defaults --------------------
  const DEFAULTS_GLOBAL = {
    // Global render settings (apply to ALL slides)
    render_style: "segment", // "segment" | "matrix" | "plain"
    size_px: 0,              // 0 = auto
    italic: false,           // segment/plain only (disabled for matrix)
    center_text: false,      // center the display (otherwise right align like v1)

    show_title: true,

    background_color: "#0B0F0C",
    text_color: "#00FF66",

    // Dot-matrix only
    matrix_dot_off_color: "#221B1B",

    // Legacy support: if set (from old configs), overrides matrix dot-on color.
    // v2 editor no longer exposes this; dot-on uses text_color / interval color.
    matrix_dot_on_color: "",

    // 7-seg only
    show_unused: true,
    unused_color: "#2A2F2C",

    // sizing (auto aspect ratio uses this unless /* auto_max_chars removed in v2.0.23 */ = true)
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

    // Numeric formatting
    decimals: null,      // manual (wins over auto_decimals)
    auto_decimals: null, // auto limit decimals
    leading_zero: true,
    show_unit: false,

    // Text template (matrix/plain only): use "<value>" placeholder
    value_template: "<value>",

    // Slide switching
    stay_s: 3,
    out_s: 0.5,
    in_s: 0.5,
    fade: true,
    show_style: "run_left", // run_left | run_right | run_top | run_bottom | billboard | matrix
    hide_style: "run_right",
    hide_prev_first: true,
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
};
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
    .toUpperCase();
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

  const pattern = FONT_5X7[ch] || FONT_5X7[" "];

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

    // If already v2-like
    if (Array.isArray(cfg.slides)) {
      const global = { ...DEFAULTS_GLOBAL, ...(cfg.global || cfg) };
      global.color_intervals = Array.isArray(cfg.color_intervals) ? cfg.color_intervals : (global.color_intervals || []);
      const slides = cfg.slides.length > 0 ? cfg.slides : [{ ...DEFAULT_SLIDE }];
      return { ...(_type ? { type: _type } : {}), ...global, slides: slides.map(s => ({ ...DEFAULT_SLIDE, ...(s || {}) })) };
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

    return { ...(_type ? { type: _type } : {}), ...global, slides: [slide] };
  }

  // -------------------- Card --------------------
  class AndySegmentDisplayCard extends HTMLElement {
    constructor() {
      super();
      this._uid = `asdc-${Math.random().toString(36).slice(2, 10)}`;
      this._built = false;
      this._els = null;
      this._lastText = null;
      this._raf = 0;

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
      this._clearTimer();
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

    _clearTimer() {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = 0;
      }
      this._isSwitching = false;
    }

    _resetScheduler(force) {
      if (force) {
        this._clearTimer();
        this._slideIndex = 0;
        this._startLoop();
      } else {
        this._startLoop();
      }
    }

    _startLoop() {
      const cfg = this._config;
      const slides = Array.isArray(cfg?.slides) ? cfg.slides : [];
      // Single-slide: do not auto-animate unless explicitly enabled
      if (slides.length === 1 && !slides[0]?.animate_single) {
        this._clearTimer();
        return;
      }
      if (!cfg || !slides || slides.length < 1) {
        this._clearTimer();
        return;
      }
      if (!this._timer && !this._isSwitching) {
        const s = slides[this._slideIndex] || DEFAULT_SLIDE;
        const stay = Math.max(0, Number(s.stay_s) || 0);
        this._timer = setTimeout(() => this._nextSlide(), stay * 1000);
      }
    }

    async _nextSlide() {
      const cfg = this._config;
      const slides = Array.isArray(cfg?.slides) ? cfg.slides : [];
      // Single-slide: only animate if enabled
      if (slides.length === 1 && !slides[0]?.animate_single) {
        this._clearTimer();
        this._isSwitching = false;
        return;
      }
      if (!cfg || slides.length < 1 || !this._els) {
        this._clearTimer();
        return;
      }
      this._clearTimer();
      this._isSwitching = true;

      const current = slides[this._slideIndex] || DEFAULT_SLIDE;
      const nextIndex = (this._slideIndex + 1) % slides.length;
      const next = slides[nextIndex] || DEFAULT_SLIDE;

      const outS = Math.max(0, Number(current.out_s) || 0);
      const inS  = Math.max(0, Number(next.in_s) || 0);
      const isRunning = (current.show_style === "running");
      const isSingle = (slides.length === 1);
      const runOut = (outS > 0) && (isRunning ? true : (isSingle ? true : !!current.hide_prev_first));

      if (runOut) {
        const outStyle = isRunning ? "running" : (isSingle ? current.hide_style : current.hide_style);
        applyAnim(this._els.display, outStyle, "out", outS, !!current.fade);
        await new Promise((res) => setTimeout(res, outS * 1000));
        clearAnim(this._els.display);
      }

      this._slideIndex = nextIndex;
      this._lastText = null;
      this._render();

      if (inS > 0) {
        applyAnim(this._els.display, next.show_style, "in", inS, !!next.fade);
        await new Promise((res) => setTimeout(res, inS * 1000));
        clearAnim(this._els.display);
      }

      this._isSwitching = false;

      const stay = Math.max(0, Number(next.stay_s) || 0);
      this._timer = setTimeout(() => this._nextSlide(), stay * 1000);
    }

    _effectiveMaxChars(renderedText) {
      const cfg = this._config;
      return clampInt(cfg.max_chars ?? DEFAULTS_GLOBAL.max_chars, 1, 40);
    }

    _computeActiveTextColor(stateObj) {
      const cfg = this._config;
      const n = toNumberOrNull(stateObj);
      const intervalColor = (n === null) ? null : pickIntervalColor(cfg.color_intervals, n);
      return (intervalColor || cfg.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase();
    }

    _render() {
      if (!this._config) return;

      const cfg = this._config;
      const slides = Array.isArray(cfg.slides) ? cfg.slides : [{ ...DEFAULT_SLIDE }];
      const slide = slides[this._slideIndex] || slides[0] || DEFAULT_SLIDE;

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

      let displayStr = valueStr;
      if ((cfg.render_style || "segment") !== "segment") {
        const tpl = String(slide.value_template || "<value>");
        if (tpl.includes("<value>")) displayStr = tpl.replaceAll("<value>", valueStr);
        else displayStr = tpl + valueStr;

        if ((cfg.render_style || "matrix") === "matrix") {
          displayStr = normalizeForMatrix(displayStr);
        }
      }

      const effMax = this._effectiveMaxChars(displayStr);
      if (displayStr.length > effMax) displayStr = displayStr.slice(displayStr.length - effMax);

      const sizePx = Number(cfg.size_px ?? 0);
      const isAuto = !Number.isFinite(sizePx) || sizePx <= 0;
      const style = cfg.render_style || "segment"; // segment|matrix|plain

      if (!this._built) {
        this._built = true;

        this.innerHTML = `
          <div id="${this._uid}" class="asdc-root">
            <ha-card class="asdc-card">
              <div class="title"></div>
              <div class="wrap">
                <div class="display" role="img"></div>
              </div>
            </ha-card>

            <style>
              #${this._uid} .asdc-card {
                overflow: hidden;
              }
              #${this._uid} .title{
                padding: 10px 12px 0 12px;
                font-size: 14px;
                opacity: 0.85;
                display: none;
              }
              #${this._uid} .wrap {
                width: 100%;
                padding: 10px 12px 12px 12px;
                box-sizing: border-box;
              }
              #${this._uid} .display {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
                width: 100%;
                transform-origin: center;
              }
              #${this._uid} .char {
                height: 100%;
                width: auto;
                flex: 0 0 auto;
              }
              #${this._uid} .wrap.segment .char.dot { width: 26px; }

              /* Segment mode (kept from v1) */
              #${this._uid} .wrap.segment .seg.on {
                fill: var(--asdc-text-color);
                filter: drop-shadow(0 0 6px rgba(0,0,0,0.35));
              }
              #${this._uid} .wrap.segment .seg.off {
                fill: var(--asdc-unused-fill);
              }

              /* Matrix mode (kept from v1) */
              #${this._uid} .wrap.matrix .dot.on {
                fill: var(--asdc-dot-on);
                filter: drop-shadow(0 0 6px rgba(0,0,0,0.25));
              }
              #${this._uid} .wrap.matrix .dot.off {
                fill: var(--asdc-dot-off);
              }

              /* Plain text mode */
              #${this._uid} .wrap.plain .plainText {
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
              #${this._uid} .display.asdc-italic {
                transform: skewX(-10deg);
              }
              #${this._uid} .wrap.plain .plainText.asdc-italic {
                font-style: italic;
                transform: none;
              }

              /* Animation base */
              #${this._uid} .display.asdc-anim {
                will-change: transform, opacity, filter;
              }

              /* Keyframes */
              @keyframes asdc-in-run-left {
                0% { transform: translateX(-25%); opacity: calc(1 - var(--asdc-anim-fade)); }
                100% { transform: translateX(0); opacity: 1; }
              }
              @keyframes asdc-out-run-left {
                0% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(-25%); opacity: calc(1 - var(--asdc-anim-fade)); }
              }
              @keyframes asdc-in-run-right {
                0% { transform: translateX(25%); opacity: calc(1 - var(--asdc-anim-fade)); }
                100% { transform: translateX(0); opacity: 1; }
              }
              @keyframes asdc-out-run-right {
                0% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(25%); opacity: calc(1 - var(--asdc-anim-fade)); }
              }
              
              @keyframes asdc-in-run-top {
                0% { transform: translateY(-25%); opacity: calc(1 - var(--asdc-anim-fade)); }
                100% { transform: translateY(0); opacity: 1; }
              }
              @keyframes asdc-out-run-top {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-25%); opacity: calc(1 - var(--asdc-anim-fade)); }
              }
              @keyframes asdc-in-run-bottom {
                0% { transform: translateY(25%); opacity: calc(1 - var(--asdc-anim-fade)); }
                100% { transform: translateY(0); opacity: 1; }
              }
              @keyframes asdc-out-run-bottom {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(25%); opacity: calc(1 - var(--asdc-anim-fade)); }
              }
@keyframes asdc-in-billboard {
                0% { transform: perspective(600px) rotateX(75deg); opacity: calc(1 - var(--asdc-anim-fade)); filter: blur(1px); }
                100% { transform: perspective(600px) rotateX(0deg); opacity: 1; filter: blur(0px); }
              }
              @keyframes asdc-out-billboard {
                0% { transform: perspective(600px) rotateX(0deg); opacity: 1; filter: blur(0px); }
                100% { transform: perspective(600px) rotateX(-75deg); opacity: calc(1 - var(--asdc-anim-fade)); filter: blur(1px); }
              }
              @keyframes asdc-in-matrix {
                0% { transform: translateY(-10%) skewX(-8deg); opacity: calc(1 - var(--asdc-anim-fade)); filter: blur(1px); }
                100% { transform: translateY(0) skewX(0); opacity: 1; filter: blur(0px); }
              }
              @keyframes asdc-out-matrix {
                0% { transform: translateY(0) skewX(0); opacity: 1; filter: blur(0px); }
                100% { transform: translateY(10%) skewX(8deg); opacity: calc(1 - var(--asdc-anim-fade)); filter: blur(1px); }
              }
            </style>
          </div>
        `;

        const root = this.querySelector(`#${this._uid}`);
        this._els = {
          card: root.querySelector("ha-card"),
          title: root.querySelector(".title"),
          wrap: root.querySelector(".wrap"),
          display: root.querySelector(".display"),
        };
      }

      // Alignment
      this._els.display.style.justifyContent = cfg.center_text ? "center" : "flex-end";

      // Italic toggle
      const italicAllowed = (style !== "matrix") && !!cfg.italic;
      this._els.display.classList.toggle("asdc-italic", italicAllowed);

      // Update layout classes & sizing (no rebuild)
      this._els.wrap.className = `wrap ${isAuto ? "auto" : "fixed"} ${style}`;

      const maxChars = this._effectiveMaxChars(displayStr);

      if (isAuto) {
        const ratio =
          (style === "segment") ? (maxChars / 2.2) :
          (style === "matrix")  ? (maxChars / 2.8) :
          (maxChars / 1.6); // plain
        this._els.display.style.width = "100%";
        this._els.display.style.height = "";
        this._els.display.style.aspectRatio = `${ratio}`;
      } else {
        this._els.display.style.aspectRatio = "";
        this._els.display.style.height = `${clampInt(sizePx, 18, 300)}px`;
      }

      // Title
      const titleText = (cfg.show_title !== false) ? (slide.title || "") : "";
      if (titleText) {
        this._els.title.textContent = titleText;
        this._els.title.style.display = "block";
      } else {
        this._els.title.textContent = "";
        this._els.title.style.display = "none";
      }

      this._els.card.style.setProperty("--ha-card-background", cfg.background_color);

      const activeTextColor = this._computeActiveTextColor(stateObj);

      const baseTextColor = (cfg.text_color || DEFAULTS_GLOBAL.text_color).toUpperCase();
      const dotOnLegacy =
        cfg.matrix_dot_on_color && String(cfg.matrix_dot_on_color).trim() !== ""
          ? String(cfg.matrix_dot_on_color).trim().toUpperCase()
          : "";

      const dotOn = (activeTextColor !== baseTextColor) ? activeTextColor : (dotOnLegacy || activeTextColor);

      const showUnused = !!cfg.show_unused;
      this._els.card.style.setProperty("--asdc-text-color", activeTextColor);
      this._els.card.style.setProperty("--asdc-dot-on", dotOn);
      this._els.card.style.setProperty("--asdc-dot-off", (cfg.matrix_dot_off_color || DEFAULTS_GLOBAL.matrix_dot_off_color).toUpperCase());
      this._els.card.style.setProperty("--asdc-unused-fill", showUnused ? (cfg.unused_color || DEFAULTS_GLOBAL.unused_color).toUpperCase() : "transparent");

      if (displayStr !== this._lastText) {
        this._lastText = displayStr;

        if (style === "plain") {
          this._els.display.innerHTML = `<div class="plainText ${italicAllowed ? "asdc-italic" : ""}">${displayStr}</div>`;
          this._els.display.setAttribute("aria-label", `${slide.entity || "entity"} value ${displayStr}`);

          requestAnimationFrame(() => {
            const pt = this._els.display.querySelector(".plainText");
            if (!pt) return;

            // Respect manual size if provided
            const manual = Number(cfg.size_px) || 0;
            if (manual > 0) {
              pt.style.fontSize = `${manual}px`;
            } else {
              // Autosize based on the wrapper height (not affected by in/out animations on the display element)
              const wrapBox = this._els.wrap?.getBoundingClientRect?.() || this._els.display.getBoundingClientRect();
              const fs = Math.max(12, Math.min(180, wrapBox.height * 0.85));
              pt.style.fontSize = `${fs}px`;
            }

            pt.style.justifyContent = cfg.center_text ? "center" : "flex-end";
          });
          return;
        }

        const chars = displayStr
          .split("")
          .map((ch) => {
            if (style === "segment") return svgForSegmentChar(ch, cfg);
            return svgForMatrixChar(ch, cfg);
          })
          .join("");

        this._els.display.innerHTML = chars;
        this._els.display.setAttribute("aria-label", `${slide.entity || "entity"} value ${displayStr}`);
      }

      this._startLoop();
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
        tf.placeholder = allowEmpty ? "(empty = auto)" : "#RRGGBB";
        tf.configValue = key;
        tf.addEventListener("change", (e) => this._onChange(e));
        tf.addEventListener("value-changed", (e) => this._onChange(e));

        const btn = document.createElement("input");
        btn.type = "color";
        btn.className = "colorBtn";
        btn.dataset.configValue = key;

        btn.addEventListener("input", (e) => {
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

      // Slide editor fields
      this._slideEntity = mkEntityControl("__slide_entity");
      this._slideEditor.appendChild(this._slideEntity);

      this._slideTitle = mkText("Title (required)", "__slide_title");
      this._slideEditor.appendChild(this._slideTitle);

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
        .section-title { font-size:12px; opacity:.75; letter-spacing:.2px; }

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
      this._syncColor(this._rowBg, this._config.background_color);
      this._syncColor(this._rowUnused, this._config.unused_color);
      this._syncColor(this._rowDotOff, this._config.matrix_dot_off_color);

      // Show/hide sections based on style
      const st = this._config.render_style || "segment";
      this._elShowUnused.closest(".section").style.display = (st === "segment") ? "flex" : "none";
      this._rowDotOff.closest(".section").style.display = (st === "matrix") ? "flex" : "none";

      // Intervals + Slides
      this._renderIntervals();

      if (!Array.isArray(this._config.slides) || this._config.slides.length === 0) {
        this._config.slides = [{ ...DEFAULT_SLIDE, title: "Slide 1" }];
      }
      if (typeof this._activeSlide !== "number") this._activeSlide = 0;
      this._activeSlide = clampInt(this._activeSlide, 0, this._config.slides.length - 1);

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

      this._slideDecimals.value = (s.decimals === null || s.decimals === undefined) ? "" : String(s.decimals);
      this._slideAutoDecimals.value = (s.auto_decimals === null || s.auto_decimals === undefined) ? "" : String(s.auto_decimals);

      this._slideLeadingZero.checked = s.leading_zero !== false;
      this._slideShowUnit.checked = !!s.show_unit;

      this._slideTpl.value = s.value_template || "<value>";

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
    }

    _commit(key, value) {
      const next = { ...(this._config || DEFAULTS_GLOBAL), ...(this._origType ? { type: this._origType } : {}), [key]: value };
      next.slides = this._config.slides || [{ ...DEFAULT_SLIDE, title:"Slide 1" }];
      next.color_intervals = this._config.color_intervals || [];
      this._config = next;

      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      }));
    }

    _commitFull(nextConfig) {
      if (this._origType && !nextConfig.type) nextConfig.type = this._origType;
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
