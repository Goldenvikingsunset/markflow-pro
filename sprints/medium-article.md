# Why VS Code's Markdown Preview Keeps Breaking (And How to Fix It)

*Target keywords: "vscode markdown preview not working", "auto open markdown preview vscode", "vscode markdown extension"*

---

If you've ever opened a Markdown file in VS Code and wondered why the preview panel stubbornly shows the wrong file — or disappeared entirely — you're not alone.

The top search result for "VS Code markdown preview" is a 639,000-install extension that hasn't been updated since **2017**. Its issues list reads like a support ticket graveyard. The core problems have never been fixed.

This article explains what's broken, why it breaks, and how MarkFlow Pro solves each issue from the ground up.

---

## The three things broken in VS Code's default Markdown preview

### 1. The preview doesn't follow your active file

This is the complaint you'll find repeated across Stack Overflow, Reddit, and the original extension's GitHub issues:

> "I have two .md files open. I click between them. The preview stays stuck on the first one."

The fix sounds simple — listen for the active editor to change and update the preview. But the devil is in one word: *globally*.

VS Code fires `onDidChangeActiveTextEditor` for every editor group. The abandoned extension only listens in the context of a single group. The moment you open a split panel, the event wiring breaks.

MarkFlow Pro registers the listener at the extension host level:

```typescript
vscode.window.onDidChangeActiveTextEditor((editor) => {
  if (editor?.document.languageId === 'markdown') {
    previewManager.show(editor.document);
  }
}, null, context.subscriptions);
```

This fires for **all editor groups** — every split, every tab. That's the fix. One line that every other extension gets wrong by omission.

### 2. The preview dies if you close it

Close the preview panel once — even by accident — and reopen a Markdown file. In the original extension, nothing happens. The preview is gone until you manually invoke it again.

The fix requires tracking panel disposal. When a `WebviewPanel` is closed by the user, it fires an `onDidDispose` event. The correct pattern:

```typescript
panel.onDidDispose(() => {
  this.panel = null; // clear the reference
});
```

Now the next time a `.md` file becomes active, the panel reference is null, so we recreate it. The preview comes back automatically. This is behaviour users expect and have always expected.

### 3. It conflicts with Copilot and Prettier

The original extension registered keybindings that overlap with GitHub Copilot's Tab-completion and Prettier's format-on-save. MarkFlow Pro registers **zero custom keybindings**. Everything is accessible via the Command Palette and a status bar item. Your existing shortcuts stay exactly where they are.

---

## What MarkFlow Pro adds on top

Beyond fixing the broken behaviours, MarkFlow Pro ships a small set of genuinely useful features:

**Free tier (these fix the original extension):**
- Preview follows active editor across all split groups
- Preview re-opens after manual close
- Smart auto-close when you navigate away from `.md` (configurable)
- Layout modes: side-by-side, below, or tab
- One-click quick settings from the status bar

**Pro tier (features Microsoft flagged as "extension-candidate" and declined to build):**
- Custom preview themes: GitHub Dark, Notion-style, Bear, Obsidian
- Export to PDF and standalone HTML
- Outline sidebar with drag-and-drop section reordering
- Word count + estimated reading time in the status bar
- Frontmatter / YAML metadata panel
- Focus / Zen writing mode

---

## Installing MarkFlow Pro

Search for **MarkFlow Pro** in VS Code's Extensions panel, or run:

```
ext install gingerturtleapps.markflow-pro
```

The free tier is unlimited and always free. Pro features unlock with a one-time licence key from [gingerturtleapps.github.io/markflow-pro](https://gingerturtleapps.github.io/markflow-pro).

---

## Why this matters

639,000 people installed an extension for a problem VS Code should solve natively. Microsoft knows — they've tagged dozens of Markdown preview issues as "extension-candidate" in their tracker, meaning they've explicitly decided *not* to build these features.

That's a gap. MarkFlow Pro fills it.

If you've been putting up with a broken Markdown preview, you don't have to anymore.

---

*Published by Ginger Turtle Apps. Questions or feedback? Open an issue on [GitHub](https://github.com/gingerturtleapps/markflow-pro).*
