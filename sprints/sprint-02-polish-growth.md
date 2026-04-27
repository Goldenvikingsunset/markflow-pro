# Sprint 2 — Status Bar, Settings UI & Install Growth

**Status:** COMPLETE
**Depends on:** Sprint 1 complete + published

## Goal
Polish the free tier to drive installs and reviews. Add visible status bar, improve settings discoverability, and set up the GitHub Pages landing page for the Pro upgrade funnel.

## Deliverables

### Status Bar Enhancement
- Show current layout mode: `$(markdown) Side-by-Side` / `$(markdown) Below` / `$(markdown) Tab`
- Click → command palette filtered to markflowPro commands
- Show `$(markdown) Pro ✓` if Pro licence is active (stub for now)

### Settings Quick-Pick Command
- `markflowPro.quickSettings` command
- Opens a QuickPick with toggle options:
  - Layout mode (cycle through options)
  - Auto-close toggle
  - Enable/disable extension
- Makes it easy to change settings without opening JSON

### Walkthrough / Onboarding
- VS Code Walkthroughs contribution in package.json
- 3 steps: "Preview auto-opens", "Switch between files", "Upgrade to Pro"
- Shows on first install only

### GitHub Pages Landing Page (gingerturtleapps.github.io/markflow-pro)
- Single HTML page under the existing GitHub Pages site
- Hero: "Markdown preview that works the way you expect"
- Pain points addressed (from issue research)
- Free vs Pro feature table
- LemonSqueezy buy button (placeholder until Sprint 3)
- Install from Marketplace button

### Medium SEO Article
Draft for Medium article targeting:
- "vscode markdown preview not working"
- "auto open markdown preview vscode"
- "vscode markdown extension"

## Done When
- Status bar shows and updates correctly
- Quick settings command works
- Walkthrough shows on first install
- GitHub Pages page is live
