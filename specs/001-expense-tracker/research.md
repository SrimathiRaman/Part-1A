# Research: Personal Expense Tracker

## Status

All technology choices are supplied by the user. No unresolved technical decisions remain.
The decisions below use browser-native APIs and preserve the user-owned test and harness
configuration.

## Decisions

### Browser Modules and Runtime

- **Decision**: Use relative `.js` ES-module imports from a static `index.html`; add no
  framework, bundler, or runtime dependency.
- **Rationale**: Native browser modules meet the no-build constraint and keep the shipped
  application small. Modules need a valid URL origin and JavaScript MIME type, so local
  browser checks use a static HTTP server rather than relying on `file://`.
- **Alternatives considered**: A bundler or framework would add configuration and build
  steps that the user explicitly excluded.
- **Source**: [MDN: JavaScript modules on the web](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules/Modules_on_the_web)

### Storage Format and Failure Handling

- **Decision**: Store the complete collection as one JSON document under a namespaced key.
  Include a format identifier and schema version in the envelope. Validate the entire
  parsed envelope and every record before using or rewriting it.
- **Rationale**: `localStorage` stores strings, is scoped to an origin, and can fail with
  access or quota errors. JSON parsing alone does not validate application data. A
  versioned envelope makes the persisted contract explicit and a single-key write avoids
  coordinating multiple storage items.
- **Failure policy**: A missing key means first-run empty state. Malformed JSON, an
  unsupported schema version, or an invalid record produces a visible recovery error;
  never treat it as empty, drop invalid records, or overwrite the raw value. A storage
  getter/read/write exception is surfaced. Prepare a candidate state, persist it, and
  publish it to the UI only after the write succeeds.
- **Alternatives considered**: Silently resetting corrupt data or salvaging selected
  records could discard records on the next save. A backup key or IndexedDB would add
  storage complexity and is unnecessary for the specified small, single-user scope.
- **Sources**: [WHATWG Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html),
  [MDN: `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage),
  [MDN: `Storage.setItem()`](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem),
  [MDN: Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria),
  [MDN: `JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)

### Validation and Money Arithmetic

- **Decision**: Store each expense amount as a positive safe integer number of rupees.
  Calculate list and category totals using exact integer arithmetic (`BigInt`) and convert
  only for display.
- **Rationale**: The specified per-expense maximum is JavaScript's maximum safe integer,
  while the total of multiple valid expenses can exceed that maximum. Exact aggregation
  prevents rounding in totals. `BigInt` values are derived state only and are not written
  to JSON.
- **Alternatives considered**: Floating-point totals can round large rupee sums. Storing
  amounts as strings would weaken the specified integer record format and complicate
  validation.

### Test Boundaries

- **Decision**: Keep validation and calculation tests environment-free; use Vitest with
  jsdom for form/list/filter interactions; use jsdom's real localStorage for normal
  contract round trips when the supplied environment has a non-opaque URL, and inject a
  Storage-compatible double for deterministic failures. Run a small real-browser smoke
  check for native module loading, visual responsiveness, and keyboard behavior.
- **Rationale**: jsdom exposes DOM behavior but does not implement visual layout or prove
  native browser module loading. Unit tests isolate business rules, while contract tests
  exercise the persisted shape and failure policy.
- **Alternatives considered**: Testing all behavior in jsdom would not validate layout or
  browser module URL/MIME behavior. Adding browser-test tooling or modifying Vitest
  configuration is unnecessary unless the user-supplied harness already provides it. If
  the configured jsdom origin does not expose localStorage, use a supported per-test
  environment option or the injected storage double without changing supplied config.
- **Configuration boundary**: Use the supplied `vitest.config.mjs`, ESLint configuration,
  package manifest, and harness as provided. Do not create or alter them.
- **Sources**: [Vitest environments](https://vitest.dev/guide/environment.html),
  [Vitest environment configuration](https://vitest.dev/config/environment),
  [jsdom documentation](https://github.com/jsdom/jsdom#readme),
  [MDN: JavaScript modules on the web](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules/Modules_on_the_web)

## Risks and Scope Notes

- Browser storage is best-effort, not a backup or security boundary. The app must report
  failures and must not claim saved data is durable after the browser clears it.
- `localStorage` does not provide a cross-tab transaction or locking mechanism. The plan
  assumes one active application tab; multi-tab conflict resolution is not part of the
  approved specification.
- No migration is implemented for version 1. Future schema changes require an explicit,
  separately tested migration; an unknown version remains untouched and blocks writes.
- User data is untrusted even after loading from localStorage. Render descriptions only
  through safe text APIs.
