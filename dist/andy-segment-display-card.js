/* Andy Segment Display Card (Home Assistant Lovelace Custom Card)
 * v1.2.5
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
 * Changelog 1.2.5 - 2026-01-08
 * - Added support for Danish / Norwegian characters
 * - Added Decimal management
 * - Added Leading Zero function if value is without leading zero it will be added
 */

const CARD_TAG = "andy-segment-display-card";
const EDITOR_TAG = "andy-segment-display-card-editor";

const DEFAULTS = {
  entity: "",
  title: "",
  size_px: 0,

  text_color: "#00FF66",
  background_color: "#0B0F0C",

  show_unused: true,
  unused_color: "#2A2F2C",

  // Manual decimals (wins over auto_decimals)
  decimals: null,

  // Auto-limit decimals if sensor provides too many (null = disabled)
  auto_decimals: null,

  // Add leading zero for values like .5 / -.5
  leading_zero: true,

  show_unit: false,
  max_chars: 10,

  render_style: "segment",

  matrix_dot_off_color: "#1C211E",
  matrix_dot_on_color: "", // empty => use text_color
  matrix_cols: 5,
  matrix_rows: 7,
  matrix_gap: 2,
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
};

// 5x7 dot-matrix font (rows, each row is 5 bits)
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

  // Segment mode: keep digits + dot + minus
  if ((cfg.render_style || "segment") === "segment") {
    s = s
      .replace(",", ".")
      .split("")
      .map((ch) => {
        if (ch >= "0" && ch <= "9") return ch;
        if (ch === "." || ch === "-") return ch;
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

class AndySegmentDisplayCard extends HTMLElement {
  constructor() {
    super();
    this._uid = `asdc-${Math.random().toString(36).slice(2, 10)}`;
  }

  static getConfigElement() {
    return document.createElement(EDITOR_TAG);
  }

  static getStubConfig() {
    return { ...DEFAULTS };
  }

  setConfig(config) {
    this._config = { ...DEFAULTS, ...(config || {}) };
    if (!this._config.entity) throw new Error("Du måste ange en entity.");
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 2;
  }

  _render() {
    if (!this._config || !this._hass) return;

    const cfg = this._config;
    const stateObj = cfg.entity ? this._hass.states[cfg.entity] : null;
    const text = toDisplayString(stateObj, cfg);

    const sizePx = Number(cfg.size_px ?? 0);
    const isAuto = !Number.isFinite(sizePx) || sizePx <= 0;

    const style = cfg.render_style || "segment";

    const chars = text
      .split("")
      .map((ch) => {
        if (style === "segment") return svgForSegmentChar(ch, cfg);
        return svgForMatrixChar(ch, cfg);
      })
      .join("");

    const showUnused = !!cfg.show_unused;

    const titleHtml = cfg.title
      ? `<div class="title">${cfg.title}</div>`
      : "";

    const dotOn =
      cfg.matrix_dot_on_color && String(cfg.matrix_dot_on_color).trim() !== ""
        ? cfg.matrix_dot_on_color
        : cfg.text_color;

    this.innerHTML = `
      <div id="${this._uid}" class="asdc-root">
        <ha-card class="asdc-card">
          ${titleHtml}
          <div class="wrap ${isAuto ? "auto" : "fixed"} ${style}">
            <div class="display" role="img" aria-label="${cfg.entity} value ${text}">
              ${chars}
            </div>
          </div>
        </ha-card>

        <style>
          #${this._uid} .asdc-card {
            background: ${cfg.background_color};
            overflow: hidden;
          }

          #${this._uid} .title{
            padding: 10px 12px 0 12px;
            font-size: 14px;
            opacity: 0.85;
          }

          #${this._uid} .wrap {
            width: 100%;
            padding: 10px 12px 12px 12px;
            box-sizing: border-box;
          }

          #${this._uid} .wrap.auto.segment .display {
            width: 100%;
            aspect-ratio: ${clampInt(cfg.max_chars ?? DEFAULTS.max_chars, 1, 40)} / 2.2;
          }
          #${this._uid} .wrap.auto.matrix .display {
            width: 100%;
            aspect-ratio: ${clampInt(cfg.max_chars ?? DEFAULTS.max_chars, 1, 40)} / 2.8;
          }

          #${this._uid} .wrap.fixed .display {
            height: ${clampInt(sizePx, 18, 300)}px;
          }

          #${this._uid} .display {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px;
            width: 100%;
          }

          #${this._uid} .char {
            height: 100%;
            width: auto;
            flex: 0 0 auto;
          }

          #${this._uid} .wrap.segment .char.dot { width: 26px; }

          #${this._uid} .wrap.segment .seg.on {
            fill: ${cfg.text_color};
            filter: drop-shadow(0 0 6px rgba(0,0,0,0.35));
          }
          #${this._uid} .wrap.segment .seg.off {
            fill: ${showUnused ? cfg.unused_color : "transparent"};
          }

          #${this._uid} .wrap.matrix .dot.on {
            fill: ${dotOn};
            filter: drop-shadow(0 0 6px rgba(0,0,0,0.25));
          }
          #${this._uid} .wrap.matrix .dot.off {
            fill: ${cfg.matrix_dot_off_color};
          }
        </style>
      </div>
    `;
  }
}

customElements.define(CARD_TAG, AndySegmentDisplayCard);

/* -------- Editor (UI) -------- */
class AndySegmentDisplayCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...DEFAULTS, ...(config || {}) };
    this._buildOnce();
    this._sync();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._built) this._sync();
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
        this._commit(key, val);
        this._sync();
      });

      row._tf = tf;
      row._btn = btn;
      row._allowEmpty = allowEmpty;
      row._normalizeHex = normalizeHex;

      row.appendChild(tf);
      row.appendChild(btn);
      return row;
    };

    const mkEntityControl = () => {
      const hasSelector = !!customElements.get("ha-selector");
      if (hasSelector) {
        const sel = document.createElement("ha-selector");
        sel.label = "Entity";
        sel.configValue = "entity";
        sel.selector = { entity: {} };
        sel.addEventListener("value-changed", (e) => this._onChange(e));
        this._entityIsSelector = true;
        return sel;
      }
      const ep = document.createElement("ha-entity-picker");
      ep.label = "Entity";
      ep.allowCustomEntity = true;
      ep.configValue = "entity";
      ep.addEventListener("value-changed", (e) => this._onChange(e));
      this._entityIsSelector = false;
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
        if (sel.value) this._commit(key, sel.value);
      });

      return sel;
    };

    // ---------- UI ----------
    this._elEntity = mkEntityControl();
    root.appendChild(this._elEntity);

    this._elTitle = mkText("Title (optional)", "title");
    root.appendChild(this._elTitle);

    this._elRenderStyle = mkSelect("Render style", "render_style", [
      ["segment", "7-segment (digits)"],
      ["matrix", "Dot-matrix (text)"],
    ]);
    root.appendChild(this._elRenderStyle);

    this._elSize = mkText("Size (px) — 0 = Auto", "size_px", "number");
    root.appendChild(this._elSize);

    this._rowText = mkColor("Text color", "text_color");
    root.appendChild(this._rowText);

    this._rowBg = mkColor("Background color", "background_color");
    root.appendChild(this._rowBg);

    this._elMaxChars = mkText("Max chars", "max_chars", "number");
    root.appendChild(this._elMaxChars);

    const secNum = mkSection("Numeric formatting");

    // Manual decimals
    this._elDecimals = mkText("Decimals (manual) (empty = keep original)", "decimals", "number", "");
    secNum.appendChild(this._elDecimals);

    // Auto decimals (new)
    this._elAutoDecimals = mkText("Auto limit decimals (empty = disabled)", "auto_decimals", "number", "");
    secNum.appendChild(this._elAutoDecimals);

    // Leading zero (new)
    const { wrap: lzWrap, sw: lzSw } = mkSwitch("Leading zero (e.g. .5 → 0.5)", "leading_zero");
    this._elLeadingZero = lzSw;
    secNum.appendChild(lzWrap);

    const { wrap: unitWrap, sw: unitSw } = mkSwitch("Show unit (e.g. °C)", "show_unit");
    this._elShowUnit = unitSw;
    secNum.appendChild(unitWrap);

    root.appendChild(secNum);

    const secSeg = mkSection("7-segment options");
    const { wrap: unusedWrap, sw: unusedSw } = mkSwitch("Show unused segments (faint)", "show_unused");
    this._elShowUnused = unusedSw;
    secSeg.appendChild(unusedWrap);
    this._rowUnused = mkColor("Unused segments color", "unused_color");
    secSeg.appendChild(this._rowUnused);
    root.appendChild(secSeg);

    const secMat = mkSection("Dot-matrix options");
    this._rowDotOff = mkColor("Dot OFF color", "matrix_dot_off_color");
    secMat.appendChild(this._rowDotOff);
    this._rowDotOn = mkColor("Dot ON color (empty = use Text color)", "matrix_dot_on_color", true);
    secMat.appendChild(this._rowDotOn);
    root.appendChild(secMat);

    const style = document.createElement("style");
    style.textContent = `
      .form { display:flex; flex-direction:column; gap:12px; padding:8px 0; }
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
    if (!this._hass || !this._config) return;

    this._elEntity.hass = this._hass;
    this._elEntity.value = this._config.entity || "";

    this._elTitle.value = this._config.title || "";
    this._elSize.value = String(this._config.size_px ?? 0);
    this._elMaxChars.value = String(this._config.max_chars ?? DEFAULTS.max_chars);

    this._elRenderStyle.value = this._config.render_style || "segment";

    this._elShowUnit.checked = !!this._config.show_unit;
    this._elShowUnused.checked = !!this._config.show_unused;

    this._elLeadingZero.checked = this._config.leading_zero !== false;

    this._elDecimals.value =
      this._config.decimals === null || this._config.decimals === undefined ? "" : String(this._config.decimals);

    this._elAutoDecimals.value =
      this._config.auto_decimals === null || this._config.auto_decimals === undefined ? "" : String(this._config.auto_decimals);

    this._syncColor(this._rowText, this._config.text_color);
    this._syncColor(this._rowBg, this._config.background_color);
    this._syncColor(this._rowUnused, this._config.unused_color);
    this._syncColor(this._rowDotOff, this._config.matrix_dot_off_color);
    this._syncColor(this._rowDotOn, this._config.matrix_dot_on_color || "");
  }

  _commit(key, value) {
    const next = { ...(this._config || DEFAULTS), [key]: value };
    this._config = next;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      })
    );
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
      return this._commit(key, target.checked);
    }

    let value = this._eventValue(ev, target);

    if (key === "size_px" || key === "max_chars") {
      value = value === "" ? 0 : Number(value);
      return this._commit(key, value);
    }

    if (key === "decimals" || key === "auto_decimals") {
      value = value === "" ? null : Number(value);
      if (!Number.isFinite(value)) value = null;
      return this._commit(key, value);
    }

    if (key === "entity" || key === "render_style" || key === "title") {
      return this._commit(key, value);
    }

    const allowEmpty = (key === "matrix_dot_on_color");
    const norm = (this._rowText._normalizeHex)(value, allowEmpty);
    if (norm === null) {
      this._sync();
      return;
    }
    return this._commit(key, norm);
  }
}

customElements.define(EDITOR_TAG, AndySegmentDisplayCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TAG,
  name: "Andy Segment Display Card",
  description: "7-segment (digits) or 5x7 dot-matrix (text) display for an entity value.",
});
