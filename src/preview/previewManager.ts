import * as vscode from 'vscode';
import * as path from 'path';
import { marked } from 'marked';
import { LayoutManager } from './layoutManager';
import { getAutoClose, isEnabled } from '../utils/config';
import { logger } from '../utils/logger';
import { Strings } from '../utils/strings';
import { getThemeCss } from '../pro/themeManager';

export class PreviewManager implements vscode.Disposable {
  private panel: vscode.WebviewPanel | null = null;
  private readonly disposables: vscode.Disposable[] = [];

  constructor() {
    // onDidChangeActiveTextEditor fires for ALL editor groups — this is the fix
    // that every other markdown preview extension misses.
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(editor => this.onEditorChange(editor))
    );
    // Close preview instantly when the markdown tab is closed (not just switched away from).
    this.disposables.push(
      vscode.workspace.onDidCloseTextDocument(doc => this.onDocumentClose(doc))
    );
  }

  private onEditorChange(editor: vscode.TextEditor | undefined): void {
    if (!isEnabled()) { return; }
    if (!editor) { return; }

    if (editor.document.languageId === 'markdown') {
      try {
        this.show(editor.document);
      } catch (err) {
        logger.log(`Error showing preview: ${err}`);
      }
    } else if (getAutoClose()) {
      this.panel?.dispose();
    }
  }

  private onDocumentClose(doc: vscode.TextDocument): void {
    if (!isEnabled() || !getAutoClose()) { return; }
    if (doc.languageId !== 'markdown') { return; }

    // Only close the preview if no other markdown editors remain open.
    const anyMdOpen = vscode.window.visibleTextEditors.some(
      e => e.document.languageId === 'markdown' && e.document !== doc
    );
    if (!anyMdOpen) {
      this.panel?.dispose();
    }
  }

  show(document: vscode.TextDocument): void {
    if (this.panel) {
      // Panel already exists — update content and bring it to the foreground
      // without stealing editor focus.
      this.panel.reveal(this.panel.viewColumn, true);
      this.update(document);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'markflowPreview',
        Strings.previewTitle,
        LayoutManager.getColumn(),
        {
          enableScripts: false,
          retainContextWhenHidden: true,
          localResourceRoots: [],
        }
      );

      // When user closes the panel, clear our reference so the next .md
      // activation recreates it — this is the "re-opens after close" feature.
      this.panel.onDidDispose(() => {
        this.panel = null;
        logger.log('Preview panel closed');
      });

      this.update(document);
      logger.log(`Preview opened: ${document.fileName}`);
    }
  }

  update(document: vscode.TextDocument): void {
    if (!this.panel) { return; }

    const content = document.getText();
    const bodyHtml = marked.parse(content) as string;
    const basename = path.basename(document.fileName, path.extname(document.fileName));

    this.panel.title = `${basename} — Preview`;
    this.panel.webview.html = this.buildHtml(bodyHtml, basename);
    logger.log(`Preview updated: ${path.basename(document.fileName)}`);
  }

  /** Opens preview for the currently active markdown editor (command handler). */
  openPreview(): void {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.languageId === 'markdown') {
      this.show(editor.document);
    }
  }

  /** Closes the preview panel (command handler). */
  closePreview(): void {
    this.panel?.dispose();
  }

  dispose(): void {
    this.panel?.dispose();
    this.disposables.forEach(d => d.dispose());
    this.disposables.length = 0;
  }

  // ---------------------------------------------------------------------------
  // HTML generation
  // ---------------------------------------------------------------------------

  private buildHtml(body: string, title: string): string {
    const themeCss = getThemeCss();
    // When a Pro theme is active it owns all body styles.
    // The default stylesheet uses VS Code CSS variables for light/dark sync.
    const activeCss = themeCss || `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.7;
      padding: 24px 40px;
      max-width: 860px;
      margin: 0 auto;
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      line-height: 1.25;
      margin-top: 24px;
      margin-bottom: 16px;
    }
    h1 { font-size: 2em; border-bottom: 1px solid var(--vscode-editorWidget-border); padding-bottom: .3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid var(--vscode-editorWidget-border); padding-bottom: .3em; }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background: var(--vscode-textCodeBlock-background);
      padding: .2em .4em;
      border-radius: 3px;
      font-size: 85%;
    }
    pre {
      background: var(--vscode-textCodeBlock-background);
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      line-height: 1.45;
    }
    pre code { background: none; padding: 0; font-size: 100%; }
    blockquote {
      margin: 0;
      padding: 0 1em;
      color: var(--vscode-textBlockQuote-foreground);
      border-left: .25em solid var(--vscode-textBlockQuote-border);
    }
    a { color: var(--vscode-textLink-foreground); text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
    th, td { border: 1px solid var(--vscode-editorWidget-border); padding: 6px 13px; }
    th { background: var(--vscode-editorWidget-background); font-weight: 600; }
    tr:nth-child(even) { background: var(--vscode-list-hoverBackground); }
    hr { border: none; border-top: 1px solid var(--vscode-editorWidget-border); margin: 24px 0; }
    ul, ol { padding-left: 2em; }
    li { margin: 4px 0; }`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
  <title>${escapeHtml(title)}</title>
  <style>${activeCss}</style>
</head>
<body>
${body}
</body>
</html>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
