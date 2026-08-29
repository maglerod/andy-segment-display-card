const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const sourcePath = "dist/andy-segment-display-card.js";
const source = fs.readFileSync(sourcePath, "utf8").replace(
  /\}\)\(\);\s*$/,
  ";globalThis.__asdcTest = { migrateConfig, AndySegmentDisplayCard }; })();"
);

const registered = new Map();
const sandbox = {
  console: { info() {}, error() {} },
  HTMLElement: class {},
  customElements: {
    get: (name) => registered.get(name),
    define: (name, value) => registered.set(name, value),
  },
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.runInNewContext(source, sandbox, { filename: sourcePath });

const { migrateConfig, AndySegmentDisplayCard } = sandbox.__asdcTest;

const shorthand = migrateConfig({
  type: "custom:andy-segment-display-card",
  rows: [{ entity: "sensor.power_cost", title: "Accumulated cost", value_template: "<value> kr" }],
});
assert.equal(shorthand.rows[0].slides.length, 1);
assert.equal(shorthand.rows[0].slides[0].entity, "sensor.power_cost");
assert.equal(shorthand.rows[0].slides[0].value_template, "<value> kr");

const explicit = migrateConfig({
  rows: [{ is_default: true, slides: [{ entity: "sensor.temperature" }] }],
});
assert.equal(explicit.rows[0].is_default, true);
assert.equal(explicit.rows[0].slides[0].entity, "sensor.temperature");

const singleObjectRows = migrateConfig({
  render_style: "plain",
  slides: { entity: "sensor.trygg_stromregning_justert", value_template: "<value> kr" },
  rows: {
    slides: { entity: "sensor.trygg_stromregning_justert", value_template: "<value> kr" },
    is_default: true,
  },
});
assert.equal(singleObjectRows.rows[0].slides[0].entity, "sensor.trygg_stromregning_justert");
assert.equal(singleObjectRows.rows[0].slides[0].value_template, "<value> kr");
assert.equal(singleObjectRows.rows[0].is_default, true);

const Card = registered.get("andy-segment-display-card");
const card = new Card();
let forceRender;
card._scheduleRender = (force) => { forceRender = force; };
card.hass = { states: {} };
assert.equal(forceRender, true, "Home Assistant state updates must bypass visibility throttling");

const reconnectCard = new AndySegmentDisplayCard();
const savedConfig = { rows: [{ slides: [{ entity: "sensor.power_cost" }] }] };
const savedHass = { states: { "sensor.power_cost": { state: "257.16" } } };
const savedRowEls = [{ display: {} }];
const savedRowStates = [{ lastText: "257.16" }];
reconnectCard._config = savedConfig;
reconnectCard._hass = savedHass;
reconnectCard._rowEls = savedRowEls;
reconnectCard._rowStates = savedRowStates;
reconnectCard.disconnectedCallback();
assert.equal(reconnectCard._config, savedConfig, "Reconnects must retain card configuration");
assert.equal(reconnectCard._hass, savedHass, "Reconnects must retain Home Assistant state");
assert.equal(reconnectCard._rowEls, savedRowEls, "Reconnects must retain built row elements");
assert.equal(reconnectCard._rowStates, savedRowStates, "Reconnects must retain row state");

console.log("Config normalization and state-render tests passed.");
