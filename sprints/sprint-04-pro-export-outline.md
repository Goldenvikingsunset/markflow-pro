# Sprint 4 — Pro Tier: Export + Outline Sidebar

**Status:** COMPLETE
**Depends on:** Sprint 3 complete

## Goal
Ship the two most-requested missing features in the markdown preview ecosystem (both flagged as "extension-candidate" by MS and heavily upvoted). These are the main Pro revenue drivers.

## Deliverables

### src/pro/exportManager.ts

#### Export to HTML
- Command: `markflowPro.exportHtml`
- Takes current document, renders to self-contained HTML
- Applies current Pro theme CSS inline
- Saves to same directory as .md file (with .html extension)
- Shows "Open in browser" button on success

#### Export to PDF  
- Command: `markflowPro.exportPdf`
- Uses VS Code's built-in print-to-PDF approach via Webview
- Or headless Chromium if bundled (evaluate size impact)
- Saves to same directory as .md file

### src/pro/outlineManager.ts
TreeDataProvider for a custom sidebar view showing the document outline:
- Registers view: `markflowPro.outline` in the Explorer sidebar
- Shows all headings (H1–H6) as tree items
- Click a heading → jumps to that line in the editor
- Drag and drop to reorder sections (moves the actual markdown content)
  - This is the gap that made someone build a whole separate extension
- Updates on document change (debounced 300ms)

### src/pro/statsBar.ts
Enhanced status bar for Pro users:
- Word count: `$(markdown) 1,204 words`
- Reading time: `~6 min read`
- Updates on document change (debounced 500ms)
- Only shown on active .md files

### package.json Updates
- New view container for outline sidebar
- New commands: exportHtml, exportPdf
- Keybinding-free (all via Command Palette or right-click context menu)

## Done When
- HTML export produces valid self-contained file that opens in browser
- PDF export produces readable PDF
- Outline sidebar shows headings and updates on edit
- Click-to-jump works
- Drag-to-reorder moves content correctly (with undo support)
- Word count / reading time accurate and updates live
