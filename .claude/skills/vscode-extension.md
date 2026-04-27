# Skill: VS Code Extension Development

## Extension Anatomy
Every VS Code extension needs:
- `package.json` — manifest: commands, settings, activation events, contributes
- `src/extension.ts` — entry point with `activate()` and `deactivate()`
- `tsconfig.json` — TypeScript config targeting ES2020, module: commonjs
- `.vscodeignore` — controls what's excluded from VSIX

## Activation Events
Use specific activation events, never `*`:
```json
"activationEvents": ["onLanguage:markdown"]
```

## WebviewPanel (Preview Panel)
```typescript
const panel = vscode.window.createWebviewPanel(
  'markflowPreview',          // viewType
  'MarkFlow Preview',          // title
  vscode.ViewColumn.Beside,    // column
  { enableScripts: true, retainContextWhenHidden: true }
);
```
- `retainContextWhenHidden: true` — keeps panel alive when not visible (avoid re-render)
- Use `panel.onDidDispose()` to detect when user closes it

## Tracking Active Editor Across Groups
```typescript
vscode.window.onDidChangeActiveTextEditor((editor) => {
  if (!editor) return;
  if (editor.document.languageId === 'markdown') {
    // update/show preview
  }
}, null, context.subscriptions);
```
This fires for ALL editor groups — the fix everyone else missed.

## SecretStorage (for licence keys)
```typescript
// Store
await context.secrets.store('markflowPro.licenceKey', key);
// Retrieve
const key = await context.secrets.get('markflowPro.licenceKey');
// Delete
await context.secrets.delete('markflowPro.licenceKey');
```

## Status Bar Item
```typescript
const statusBar = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right, 100
);
statusBar.command = 'markflowPro.openSettings';
statusBar.text = '$(markdown) MarkFlow';
statusBar.tooltip = 'MarkFlow Pro — click to open settings';
statusBar.show();
```

## esbuild Bundle Config
```javascript
// esbuild.js
const esbuild = require('esbuild');
esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node16',
  minify: true,
  sourcemap: false,
});
```
`vscode` must always be external — it's provided by the host.

## Common Pitfalls
- Never import `vscode` at module level in tests — mock it
- `vscode.window.activeTextEditor` can be undefined — always null-check
- WebviewPanel columns: Beside = right of current, One/Two/Three = specific columns
- `panel.reveal()` to bring existing panel to foreground without recreating it
