const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const sourcePath = "dist/andy-segment-display-card.js";
const source = fs.readFileSync(sourcePath, "utf8").replace(
  /\}\)\(\);\s*$/,
  ";globalThis.__asdcTest = { migrateConfig }; })();"
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

const { migrateConfig } = sandbox.__asdcTest;

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

console.log("Config normalization tests passed.");
