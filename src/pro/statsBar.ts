import * as vscode from 'vscode';
import { isProActivated } from './licenceManager';

export class StatsBar implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;
  private readonly disposables: vscode.Disposable[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);

    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(e => this.update(e?.document)),
      vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document === vscode.window.activeTextEditor?.document) {
          this.scheduleUpdate(e.document);
        }
      }),
    );

    this.update(vscode.window.activeTextEditor?.document);
  }

  /** Called by extension.ts when the licence state changes, to show/hide immediately. */
  refresh(): void {
    this.update(vscode.window.activeTextEditor?.document);
  }

  private scheduleUpdate(document: vscode.TextDocument): void {
    if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
    this.debounceTimer = setTimeout(() => this.update(document), 500);
  }

  private update(document: vscode.TextDocument | undefined): void {
    if (!isProActivated() || !document || document.languageId !== 'markdown') {
      this.item.hide();
      return;
    }

    const wordCount = countWords(document.getText());
    const minutes = Math.max(1, Math.round(wordCount / 200));

    this.item.text = `$(markdown) ${wordCount.toLocaleString()} words · ~${minutes} min`;
    this.item.tooltip = new vscode.MarkdownString(
      `**MarkFlow Pro**\n\nWord count: ${wordCount.toLocaleString()}  \nReading time: ~${minutes} minute${minutes === 1 ? '' : 's'} (200 wpm)`,
    );
    this.item.show();
  }

  dispose(): void {
    if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
    this.item.dispose();
    this.disposables.forEach(d => d.dispose());
    this.disposables.length = 0;
  }
}

function countWords(text: string): number {
  const stripped = text
    .replace(/```[\s\S]*?```/g, ' ')         // fenced code blocks
    .replace(/`[^`\n]+`/g, ' ')              // inline code
    .replace(/!\[.*?\]\(.*?\)/g, ' ')        // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links: keep link text
    .replace(/^#{1,6}\s+/gm, '')             // heading markers
    .replace(/^[-*+]\s+/gm, '')              // unordered list markers
    .replace(/^\d+\.\s+/gm, '')              // ordered list markers
    .replace(/^>\s*/gm, '')                  // blockquote markers
    .replace(/[*_~]+/g, '')                  // emphasis / strikethrough markers
    .trim();

  if (!stripped) { return 0; }
  return stripped.split(/\s+/).filter(w => w.length > 0).length;
}
