# Finance Tracker Project Brief

Source inspection: 2026-10-31. App/PWA version: v36. This document describes
the checked-in application, without copying personal records, balances, or secrets.

## 1. Purpose and Development Commands

Purpose: An offline-first, mobile-friendly personal finance PWA for recording
expenses and income, managing budgets, and reviewing recurring bills and assets.

- Repository: https://github.com/TimScottChu/Finance-Tracker
- Default working/deployment branch: `main` (configured tracking branch).
- Hosted app: https://timscottchu.github.io/Finance-Tracker/

Run commands from the repository root in PowerShell:

```powershell
# Quick preview; does not exercise service workers.
Start-Process .\index.html

# Optional localhost server for PWA development; requires Node.js/npm and
# network access on first use to obtain this pinned development tool.
npx --yes http-server@14.1.1 . -p 8080 -c-1
```

With the server running, open `http://localhost:8080/`. Stop it with Ctrl+C.
Use localhost or HTTPS for service-worker testing. File previews have a separate
storage context from the hosted app and should not be used to verify phone data.

Build: no command is required. The checked-in static files are the deployment
artifact; there is no bundler, transpiler, package manifest, or compiled output.

Available checks (not an automated functional test suite):

```powershell
node --check app.js
node --check service-worker.js
node -e "JSON.parse(require('node:fs').readFileSync('manifest.webmanifest','utf8')); console.log('Manifest JSON valid')"
git diff --check
```

There is no `npm test` or `npm run build` script.

## 2. Stack and Dependencies

| Component | Version / requirement |
| --- | --- |
| App release/cache | v36 |
| Markup | HTML Living Standard (`<!doctype html>`); no pinned release |
| Styling | Native CSS, Grid, Flexbox, media queries; no framework |
| Application | Native JavaScript; modern browser support required |
| Browser APIs | DOM, localStorage, Intl.NumberFormat, structuredClone, crypto.randomUUID, FileReader, Blob/download URLs, service workers, Cache Storage |
| Runtime libraries | None; no CDN libraries or third-party scripts |
| Dependency lockfile | None |
| Node.js | v24.22.1 observed for syntax checks; development only, not an app dependency |
| Optional static server | http-server 14.1.1 via the command above; not a repository dependency |
| Hosting | GitHub Pages static hosting; no application server |

Browser/OS versions are not pinned. A current browser supporting the listed APIs
is required; installed phone behavior still needs device testing.

## 3. Repository Tree and File Roles

Top two levels, excluding Git internal metadata:

```text
fin-tracker/
  .git/                    Git metadata (contents omitted)
  PROJECT_BRIEF.md          Technical handoff and current limitations
  README.md                 User guide, installation, exports, future ideas
  index.html                Screens, forms, modals, navigation, manifest link
  app.js                    State, migrations, calculations, UI, exports/import
  styles.css                Responsive layout and component styling
  manifest.webmanifest      Installable PWA metadata and icon declarations
  service-worker.js         App-shell installation, cache lifecycle, GET handling
  icons/
    finance-icon-192.png    Active manifest/precached 192 px icon
    finance-icon-512.png    Active manifest/precached 512 px icon
    icon.svg               Active scalable manifest/precached icon
    icon-192.png           Older icon asset, not in current manifest/precache
    icon-512.png           Older icon asset, not in current manifest/precache
```

There are no checked-in test directories, CI workflow files, or package files.

## 4. Data Model and Persistence

All application records are JSON in browser `localStorage`, scoped to the
site origin. There is no IndexedDB, SQLite, server database, or cloud sync.
Cache Storage holds fetched app resources, not the finance ledger database.

| Storage key | Contents |
| --- | --- |
| `php-finance-tracker-v1` | PHP ledger |
| `php-finance-tracker-jpy-v1` | Separate JPY ledger |
| `php-finance-tracker-currency-v1` | Selected currency code |
| `php-finance-tracker-feedback-v1` | Shared feedback text |

Each ledger has the following entities. Currency is determined by its ledger,
rather than stored on each transaction.

| Entity | Fields / shape |
| --- | --- |
| Ledger | `categories`, `transactions`, `budgets`, `goals`, `paymentMethods`, `creditCards`, `recurringExpenses`, `assets`, `assetUpdatedAt` |
| Category | Lists under `expense`, `income`, `saving`; `id`, `name`, `icon`, expense default `budget`; income `active` controls archiving |
| Transaction | `id`, `type` (`expense`, `income`, legacy `saving`), `amount`, `categoryId`, `clusterId`, `paymentMethod`, `note`, `date`, `time`, `createdAt` |
| Monthly budget | Map keyed by `YYYY-MM`, each containing `clusters[]` |
| Budget group | Internal name is cluster: `id`, `name`, `categories` map of category ID to budget amount |
| Payment method | `id`, `name`; transactions reference the saved method label |
| Credit card | `id`, `name`, `method` label, `cutoffDay` |
| Recurring expense | `id`, `name`, `amount`, `clusterId`, `categoryId`, `paymentMethod`, `dueDay`, `note` |
| Asset | `id`, `date`, `account`, `balance`; array order controls display order |
| Goal | `id`, `name`, `target`; legacy state retained, no dedicated current goal screen |
| Feedback | Plain text saved separately from ledger JSON |

Amounts use JavaScript numbers. PHP displays two decimals; JPY entry rounds to
whole yen. The ledgers do not convert or combine currencies. First JPY use copies
category/group names and payment settings, zeros budgets, and starts without
transactions, assets, or recurring items. PHP initialization includes predefined
asset/budget data; this brief intentionally omits those values.

Normalization handles older budget structures, missing transaction IDs/group
assignments, and a legacy category ID. Recurring charges are calculated on demand
for a month or card statement; they are not persisted as posted transactions.

Exports/imports:

- Transactions CSV: all stored transactions for the selected currency, with date,
  time, type, group, category, payment method, currency, amount, and note. The
  filename includes the selected month, but rows are not filtered to that month.
- Assets CSV: tracker date, account, currency, balance for the selected ledger.
- Backup JSON: `formatVersion: 2`, `activeCurrency`, `ledgers: { PHP, JPY }`.
  Import replaces both ledgers. Legacy single-ledger backups restore PHP.
- Feedback TXT: separate export; feedback is not included in the JSON backup.
- No CSV import, automatic backup, or automatic cross-device synchronization.

## 5. Features Present Today

- PHP and JPY ledger switch throughout the app.
- Income/expense entry with notes, date/time, calculator keypad, category,
  budget group, and payment method selection.
- Editable/deletable transactions from selected-date details.
- Summary income/expense privacy toggles and asset visibility toggle.
- Monthly budget groups and editable categories/budget amounts.
- Spending bars, remaining/overspent values, category totals and transaction detail.
- Group/category-filtered calendar with daily spending and expected recurring bills.
- Tap-to-open/close date details and swipe month/group navigation.
- Year history with monthly totals and saved/overspent category breakdowns.
- Recurring subscriptions/payables assigned to group, category, payment method,
  and monthly credit day; compact totals with expandable details and item editing.
- Credit-card statement periods, editable cutoff days, transaction details, and
  projected recurring card charges.
- Editable payment-method lists and custom cards.
- Asset balances with add/edit/remove/reorder controls.
- Monthly earnings by editable/archivable income category.
- CSV exports, JSON backup/restore, and saved feedback with TXT export.
- Installable app shell and offline access after successful caching.

## 6. PWA, Offline Behavior, and Deployment

`index.html` links `manifest.webmanifest`. The manifest uses a relative start URL,
standalone display, theme/background colors, and PNG/SVG icons marked for
`any maskable` use. `app.js` registers `service-worker.js` on HTTP/HTTPS.

The worker precaches the app root, HTML, versioned CSS/JS, manifest, and active
icons under `php-finance-tracker-v36`. It calls `skipWaiting()` on installation
and claims clients after activation. Activation deletes other caches on the same
origin, not only older Finance Tracker caches.

GET requests use network-first handling: try the network, cache the response,
and fall back to a matching cached request when the network fails. There is no
separate offline error page or fallback for resources never cached. An initial
online visit and successful worker installation are needed before offline use.
Local ledger operations and exports work without an application backend.

Deployment uses GitHub Pages from `main` at repository root, as configured for
this project. No custom build workflow is checked in. Standard release steps:

1. Run the checks above and manually verify affected workflows.
2. Update cache name and CSS/JS query versions in the worker and HTML together;
   update the Settings version label as well.
3. Commit and push: `git push origin main`.
4. Wait for Pages deployment, refresh the hosted app, and reopen the phone PWA.

The Pages branch setting is external GitHub configuration, not defined in a
repository workflow. Do not clear site data to refresh without a backup.

## 7. Known Bugs, TODOs, and Rough Edges

Code-observed limitations, not a full fresh functional audit:

- `normalizePaymentMethods` and `normalizeCreditCards` recreate built-in defaults
  on load, so deleting a default method/card can be undone by a reload.
- Recurring templates have no start/end month, posting status, or occurrence
  history. Editing/removing a template can change past projections. Recording
  the same bill manually can double-count it alongside the expected charge.
- Payment references use names rather than stable IDs; deleting/normalizing
  methods can alter how historical labels are resolved.
- localStorage is unencrypted, device/browser-specific, and quota-limited;
  writes have no comprehensive storage-error recovery. Clearing site data loses
  records unless a backup exists. Corrupt ledger JSON falls back to defaults.
- PHP defaults include prefilled asset balances. Review and replace those with
  neutral starter data before treating this as a general-purpose public app.
- Backup import has basic validation/normalization, not a formal schema or a
  transactional restore mechanism. Export a backup before importing.
- Service-worker activation deletes all origin caches, which could interfere
  with other PWAs hosted under the same GitHub Pages origin.
- GET responses are cached without checking status/type; a failed HTTP response
  can replace a previously useful cache entry.
- Calendar v36 constrains columns/tile content on small screens. Long amounts
  can be ellipsized; tap the date for complete details. Verify on actual phones.
- Currency support is PHP/JPY only; no exchange rates, USD, or TWD yet.
- Future ideas: recurring confirmation/reminders, animation polish, more device
  and accessibility testing, and optional native packaging after the PWA settles.

## 8. Authentication, Secrets, and Network Calls

There is no login, authentication provider, API key, financial API, analytics,
remote account connection, or telemetry in the app. No secrets belong in this
static repository. Feedback is stored locally and downloaded, not sent anywhere.

Browser network activity loads same-origin app files and registers/updates the
service worker. The worker fetches/cache-refreshes GET resources. GitHub Pages
serves the files; Git push/deploy is a development operation. The optional npx
server command downloads a development tool from the npm registry on first use.

## 9. Test Coverage and Verification Gaps

No committed unit/integration/end-to-end suite, test runner, coverage report,
or CI checks exist. Syntax/JSON/diff checks above are the repeatable checks.

Prior development used temporary headless Chromium/Playwright checks for currency
isolation, persistence, CSV, both backup formats, and narrow August calendar
layout. Those scripts were not retained; these checks are not maintained test
coverage and do not prove behavior on a physical phone.

Manual regression priorities: transaction create/edit/delete; group/category
isolation; monthly and year-boundary navigation; recurring/manual duplication;
card cutoff and short-month dates; payment-method deletion after reload; PHP/JPY
switching and restore; large-number layout; offline launch; and PWA updates that
preserve records. Native keyboard/touch, accessibility, storage failure, and
multiple-tab behavior need dedicated testing.
