# Sprint 1 — Core Preview Engine (Free Tier Foundation)

**Status:** COMPLETE
**Goal:** Ship the free tier to Marketplace ASAP to start accumulating installs. This sprint is the displacement of "Auto-Open Markdown Preview" with everything it breaks, fixed.

## The Problem We're Solving
The original (639k installs, dead since 2017) has these open issues we fix on day one:
- Preview doesn't follow active editor when switching between .md files
- Preview dies permanently if user closes it manually
- No smart auto-close when leaving .md files
- Breaks Copilot Tab / Prettier (by not doing anything that could conflict)

## Deliverables

### src/extension.ts
- activate() registers all commands and creates PreviewManager
- deactivate() disposes all subscriptions
- Commands to register:
  - `markflowPro.openPreview` — manually open preview
  - `markflowPro.closePreview` — close preview
  - `markflowPro.activateLicence` — stub for Sprint 3
  - `markflowPro.openSettings` — opens VS Code settings filtered to markflowPro

### src/preview/previewManager.ts
Core class. Must implement:
- `show(document: vscode.TextDocument)` — create or reveal preview panel
- `update(document: vscode.TextDocument)` — update panel content for new file
- `dispose()` — clean up
- Listen to `onDidChangeActiveTextEditor` globally
- When .md becomes active: call show/update
- When non-.md becomes active: if autoClose setting is true, hide panel
- When panel is disposed by user: set internal reference to null so next .md open recreates it
- Panel uses VS Code's built-in markdown preview rendering (command: markdown.showPreviewToSide) OR native WebviewPanel with markdown-it rendering

### src/preview/layoutManager.ts
- Reads `markflowPro.layout` setting
- Returns the correct ViewColumn for the layout mode

### src/utils/config.ts
- Typed wrapper around vscode.workspace.getConfiguration('markflowPro')
- Exports: `getLayout()`, `getAutoClose()`, `isEnabled()`

### src/utils/logger.ts
- OutputChannel named "MarkFlow Pro"
- `log(message: string)` — writes to channel

### package.json
Full manifest including:
- All commands with titles
- All settings with types, defaults, descriptions
- Activation event: onLanguage:markdown
- Categories: ["Other"]
- Keywords: ["markdown", "preview", "auto-open", "markdown preview", "markdown viewer"]

### .gitignore
Standard Node + VS Code extension gitignore

### .vscodeignore
Exclude src/, *.ts, node_modules/, .claude/, sprints/, CLAUDE.md

### tsconfig.json
Target ES2020, lib ["ES2020"], module commonjs, outDir ./out, strict true

### esbuild.js
Bundle script for production

### README.md (Marketplace listing)
- Hero section: "The Markdown preview that actually works"
- Feature table: what's free, what's Pro
- Screenshots section (placeholder)
- Installation instructions
- Settings reference
- Pro upgrade CTA with LemonSqueezy link

### CHANGELOG.md
0.1.0 — Initial release entry

## Tests to Write
- PreviewManager opens preview on .md activation
- PreviewManager updates preview when switching .md files
- PreviewManager handles panel disposal and re-creation
- Config reads defaults correctly

## Manual Test Checklist
- [ ] Install VSIX locally
- [ ] Open a .md file → preview appears automatically in side panel
- [ ] Switch to a .ts file → preview stays (autoClose: false default)
- [ ] Open another .md file → preview updates to new file
- [ ] Close preview panel → open another .md → preview reappears
- [ ] Two .md files in split groups → click each → preview tracks correctly
- [ ] Copilot Tab still works in .md files
- [ ] Prettier format on save still works in .md files

## Marketplace Listing Short Description
"Smart Markdown preview that follows your active file — automatically. Free."

## Done When
- VSIX packages without errors
- All tests pass
- Manual checklist complete
- Published to VS Code Marketplace
