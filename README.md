# PHP Finance Tracker

Offline-first personal finance tracker prototype for Android/PWA use.

## What is included

- Mobile-first PWA shell
- Summary dashboard with income, expenses, budget group bars, calendar view, and selected-date transactions
- Quick entry flow: amount, category, optional note, date, time, save
- Expense, income, and savings transaction types
- Monthly budget groups with category budgets
- Automatic month setup by copying the previous month when available
- Asset tracker with account balances
- CSV transaction export
- JSON backup export and import
- Offline app shell via service worker

## Run locally

For a quick desktop preview, open this file directly in your browser:

```text
C:\Users\Admin\Documents\App Development\index.html
```

This is enough to test the screens, local saving, CSV export, and backup/import.

Use a local server only when testing installable PWA behavior, service-worker offline caching, or phone access over Wi-Fi.

```powershell
& 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 5173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:5173/
```

## Current checkpoint

This is the first working prototype. The next checkpoint should focus on whether the phone flow feels right:

- Is `Amount -> Category -> Save` fast enough?
- Is the Budget tab detailed enough without feeling cluttered?
- Do budget groups make switching between groups intuitive?
- Does the Asset tracker match the kind of account/balance list you want?
- Which fields should be hidden under optional details?
- Should transaction edit/delete be added before visual polish?
