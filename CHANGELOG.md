# Changelog

All notable changes to MarkFlow Pro will be documented here.

## [1.0.2] — 2026-05-01

### Fixed
- `autoClose` now closes the preview instantly when the markdown tab is closed, without requiring a click on another file

## [1.0.1] — 2026-04-27

### Fixed
- README demo now uses animated GIF (plays inline on Marketplace)

## [1.0.0] — 2026-04-27

### Added
- **Export to HTML** (Pro) — renders current document to a self-contained `.html` file with your active theme CSS inlined; "Open in Browser" shortcut on success
- **Export to PDF** (Pro) — opens a print-ready Webview and triggers the OS print dialog; save as PDF from there
- **Outline sidebar** (Pro) — Explorer panel showing all H1–H6 headings; click to jump to any heading; drag-and-drop to reorder sections (moves actual content, fully undoable)
- **Word count + reading time** (Pro) — live status bar item showing word count and estimated reading time, updated as you type

## [0.3.0] — 2026-04-26

### Added
- **Pro licence activation** — enter a MarkFlow Pro licence key via Command Palette; validated against LemonSqueezy; stored securely in VS Code SecretStorage
- **Pro licence deactivation** — remove your licence key from this machine
- **Custom preview themes** (Pro) — GitHub Light, GitHub Dark, Notion-style, Bear; applied live to the preview panel
- Re-validates licence every 7 days; 3-day offline grace period if network is unavailable
- Pro badge in status bar when licence is active

## [0.2.0] — 2026-04-26

### Added
- **Getting Started walkthrough** — three-step onboarding guide in the VS Code welcome tab
- **Quick Settings picker** — click the status bar item to change layout and auto-close without opening Settings
- **Status bar layout indicator** — shows current layout mode (Side-by-Side / Below / Tab)
- Improved status bar tooltip

## [0.1.0] — 2026-04-26

### Added
- Auto-open markdown preview when opening `.md` files
- Preview follows active editor across all split groups
- Preview re-opens automatically after manual close
- Smart auto-close when leaving markdown (optional, off by default)
- Layout modes: side-by-side, below, tab
- Status bar indicator
- Zero conflicts with GitHub Copilot or Prettier
