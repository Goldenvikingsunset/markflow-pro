# Rule: Extension Architecture

## Activation
- Activate ONLY on `onLanguage:markdown` — never eagerly
- Register all commands in `extension.ts` activate()
- Dispose all subscriptions in deactivate()

## Preview Manager (core logic — free tier)
The PreviewManager is the heart of the extension. It MUST:
1. Listen to `vscode.window.onDidChangeActiveTextEditor` GLOBALLY across all editor groups
2. When a .md file becomes active, show/restore the preview panel
3. When a non-.md file becomes active, optionally hide preview (configurable)
4. If the preview WebviewPanel is disposed (user closed it), recreate it on next .md activation
5. Track which .md file the preview is currently showing — update when editor switches
6. Handle the split group case: preview must update even when focus moves between editor groups

## Layout Modes (configurable via markflowPro.layout)
- `sideBySide` (default): Ctrl+K V style
- `below`: preview opens in bottom panel
- `tab`: preview opens as a tab (no split)

## Pro Gate Pattern
Every Pro feature entry point must follow this pattern:
```typescript
if (!licenceManager.isActivated()) {
  const choice = await vscode.window.showInformationMessage(
    'This feature requires MarkFlow Pro.',
    'Activate Pro', 'Learn More'
  );
  if (choice === 'Activate Pro') commands.executeCommand('markflowPro.activateLicence');
  return;
}
// ... pro feature logic
```

## Settings Schema
All settings defined in package.json contributes.configuration:
- `markflowPro.enabled` (boolean, default: true)
- `markflowPro.layout` (enum: sideBySide|below|tab, default: sideBySide)
- `markflowPro.autoClose` (boolean, default: false) — close preview when leaving .md
- `markflowPro.pro.licenceKey` (string) — stored in SecretStorage, not plain settings
- `markflowPro.pro.theme` (enum: github|githubDark|notion|bear|default)

## No Keybinding Conflicts
- Do NOT register Tab, Ctrl+Enter, Ctrl+B, Alt+C, or Ctrl+Shift+V bindings
- Only register commands accessible via Command Palette and status bar
