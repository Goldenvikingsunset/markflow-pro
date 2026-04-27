# MarkFlow Pro — Claude Operating Guide

## What This Is
MarkFlow Pro is a premium VS Code extension for Markdown writers, built and sold under the **Ginger Turtle** brand.

It displaces the abandoned "Auto-Open Markdown Preview" (639k installs, unmaintained since 2017) by solving the exact problems users complain about, then monetises a Pro tier via LemonSqueezy.

**Publisher ID:** gingerturtleapps
**Extension ID:** gingerturtleapps.markflow-pro
**Marketplace slug:** markflow-pro

## Core Value Proposition
- Free tier: rock-solid preview tracking (the thing everyone else breaks)
- Pro tier: export, themes, outline sidebar — features Microsoft flagged as "extension-candidate" and refuses to build

## Tech Stack
- Language: TypeScript
- Runtime: VS Code Extension API (v1.85+)
- Bundler: esbuild
- Test framework: @vscode/test-electron + Mocha
- Pro licence check: LemonSqueezy licence key API
- LemonSqueezy Store ID: 179829 (same store as SaveFlow)

## Project Structure
```
src/
  extension.ts          # Activation, command registration
  preview/
    previewManager.ts   # Core: smart preview tracking logic
    layoutManager.ts    # Split/below/tab layout modes
  pro/
    licenceManager.ts   # LemonSqueezy licence validation
    exportManager.ts    # PDF/HTML export (Pro)
    themeManager.ts     # Custom preview themes (Pro)
    outlineManager.ts   # Drag-drop outline sidebar (Pro)
  utils/
    config.ts           # All settings/config access
    logger.ts           # Output channel logging
sprints/                # Sprint definitions
.claude/                # Claude Code operating layer
```

## Key Commands (dev)
- `npm run compile`    — compile TypeScript
- `npm run watch`      — watch mode
- `npm run package`    — bundle with esbuild → produces extension.js
- `npm run vsix`       — package VSIX for distribution
- `npm test`           — run extension tests
- `vsce publish`       — publish to VS Code Marketplace

## Broad Conventions
- Never use `require()` — always ES module imports in TS
- All user-facing strings go through a central `strings.ts` (i18n-ready)
- Settings namespace: `markflowPro.*`
- Commands namespace: `markflowPro.*`
- All Pro-gated features call `licenceManager.isActivated()` before executing
- No keybinding conflicts with Copilot (Tab, Ctrl+Enter) or Prettier

## Critical Rules
- The preview panel MUST follow the active editor across ALL split groups — this is our #1 differentiator
- Preview must re-open if user manually closes it and then opens another .md file
- Extension must activate lazily (onLanguage:markdown) — never on startup
- Zero external runtime dependencies in the free tier

## Sprint Cadence
See sprints/ folder. Complete each sprint fully before starting the next.
Current sprint: Sprint 1
