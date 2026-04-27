# Sprint 3 — Pro Tier: Licence + Themes

**Status:** COMPLETE
**Depends on:** Sprint 2 complete, LemonSqueezy product created

## Goal
Wire up Pro licence validation and ship the first Pro feature (custom themes) to start generating revenue.

## LemonSqueezy Setup (manual, before coding)
- Create new product in Store 179829: "MarkFlow Pro"
- Set pricing: £2.99/mo, £19.99/yr, £39.99 lifetime
- Enable licence keys
- Note Product ID for licenceManager.ts

## Deliverables

### src/pro/licenceManager.ts
- `activate(key: string): Promise<boolean>` — validates with LemonSqueezy API, stores in SecretStorage
- `deactivate()` — clears stored key
- `isActivated(): boolean` — sync check (cached from last validation)
- `validateOnStartup()` — called from extension.ts activate(), validates if key exists
- Re-validates every 7 days (store timestamp in globalState)
- Offline grace: if network error, allow 3 days before showing warning
- Emits `onActivationChanged` event so UI can update

### Commands to Add
- `markflowPro.activateLicence` — shows input box for licence key, calls licenceManager.activate()
- `markflowPro.deactivateLicence` — confirms then clears key

### src/pro/themeManager.ts
Custom CSS themes injected into the preview WebviewPanel:
- `github` — matches GitHub.com markdown rendering
- `githubDark` — dark variant
- `notion` — Notion-style (serif font, comfortable padding)
- `bear` — Bear app-inspired (clean, warm)
- `default` — VS Code default

Themes are CSS files bundled in assets/themes/*.css
ThemeManager applies selected theme to the Webview via postMessage or direct CSS injection.

### Settings Added
- `markflowPro.pro.theme` — enum of theme options, default: "default"
- Theme picker only shown/active when Pro is activated

### package.json Updates
- New commands with Pro badge in title where applicable
- Theme setting with enum descriptions

## Done When
- Licence key input flow works end-to-end with real LemonSqueezy key
- Invalid key shows clear error message
- Valid key persists across VS Code restarts
- Theme switching works in preview panel
- Pro badge shows in status bar when activated
- LemonSqueezy product live and payment flow tested
