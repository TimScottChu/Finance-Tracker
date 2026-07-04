# PHP Finance Tracker

Offline-first personal finance tracker built as a mobile-friendly PWA. It is designed for quick daily entry on an Android phone, with CSV/JSON exports for documentation and backup.

Live app:

```text
https://timscottchu.github.io/Finance-Tracker/
```

Local project folder:

```text
C:\Users\Admin\Documents\App Development\fin-tracker
```

## What The App Does

This app helps track personal income, expenses, budgets, credit-card spending, assets, and monthly history.

The main workflow is:

```text
Amount -> Budget group -> Category -> Payment method -> Save
```

Data is stored locally in the browser/PWA storage. There is no login and no hosted database.

## Main Features

- Summary dashboard with income, expenses, budget bars, calendar, and selected-date transactions
- Quick Add flow for expenses and income
- Budget groups with category budgets
- Budget bars that show spent progress and remaining amount
- Calendar view with daily expense totals
- Editable transaction details
- Payment methods: Cash, Credit Card - BPI, Credit Card - Metro, Digital Wallet
- Credit-card statement view with cutoff day, statement period, and transaction details
- History view with yearly month-by-month totals and overspending insights
- Asset tracker with editable balances and reorder controls
- Calculator-style amount input, such as `100+25`, `500-125`, or `1000/2`
- Auto-capitalized notes, group names, category names, and asset names
- Transaction CSV export
- Asset CSV export
- Backup JSON export/import
- Test feedback export as TXT
- Offline app shell through a service worker

## Install On Phone

1. Open this link in Chrome on your Android phone:

```text
https://timscottchu.github.io/Finance-Tracker/
```

2. Tap the Chrome menu.
3. Choose **Add to Home screen** or **Install app**.
4. Open the installed app from your home screen.

If the installed PWA still shows an old version, open the GitHub Pages link in Chrome, refresh it, then reopen the installed app.

Important: before clearing site data, export a backup JSON. Clearing site data deletes local app data.

## Use Locally

For a quick desktop preview, open:

```text
C:\Users\Admin\Documents\App Development\fin-tracker\index.html
```

This is enough to test most features. Service-worker/PWA behavior is best tested through GitHub Pages or a local server.

## How To Use

### Add An Expense

1. Go to **Add**.
2. Choose **Expense**.
3. Enter the amount.
4. Choose the budget group.
5. Choose the category.
6. Choose the payment method.
7. Add a note if useful.
8. Tap **Save**.

### Track Credit Cards

Use the real spending category first. For example, a meal paid by card should still be `Food`, with payment method `Credit Card - BPI` or `Credit Card - Metro`.

On **Summary**, tap the card under **Credit cards** to view:

- cutoff day
- statement period
- total for that statement period
- list of card transactions

When paying the credit-card bill, do not add another expense entry. The spending was already recorded when the purchase happened.

### Manage Budgets

Go to **Budget** to edit monthly category budgets. Use budget groups to separate sets of categories, such as personal expenses or condo expenses.

The Summary budget bars are read-only and show spending progress.

### Track Assets

Go to **Assets** to track account balances. Tap **Edit** to update balances, add/remove assets, or move assets up/down.

### Export And Backup

Go to **Settings**:

- Export transactions CSV for spreadsheet documentation
- Export assets CSV
- Export backup JSON before major changes or before clearing site data
- Import backup JSON to restore data
- Export feedback TXT after a test run

## Next Tasks

- Dry-run the app for daily use and record friction in Settings feedback
- Verify credit-card totals against BPI and Metro statements
- Confirm each card cutoff day is correct
- Check whether the Add flow still feels clean with payment method included
- Review whether History overspending insights are useful enough
- Decide where recurring monthly payables should live
- Decide whether recurring payables should generate reminders, expected entries, or just a checklist
- Later: consider category prediction based on previous notes or merchants
- Later: consider animation/polish once the workflow is stable
- Later: consider APK conversion after the PWA feels right

## Development Notes

This is a static HTML/CSS/JavaScript PWA. No build step is required.

Files:

- `index.html` - app structure
- `styles.css` - mobile UI styling
- `app.js` - app logic and local data handling
- `manifest.webmanifest` - PWA metadata
- `service-worker.js` - offline cache/update behavior
- `icons/` - PWA icons

After code changes, update `service-worker.js` cache name so installed PWAs pick up the new version.
