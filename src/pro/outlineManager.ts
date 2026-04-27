import * as vscode from 'vscode';
import { isProActivated } from './licenceManager';
import { logger } from '../utils/logger';

const MIME_TYPE = 'application/vnd.code.tree.markflowOutline';

const HEADING_ICON: Record<number, string> = {
  1: 'symbol-class',
  2: 'symbol-method',
  3: 'symbol-field',
  4: 'symbol-property',
  5: 'symbol-key',
  6: 'symbol-key',
};

class OutlineItem extends vscode.TreeItem {
  constructor(
    public readonly headingText: string,
    public readonly level: number,
    public readonly lineNumber: number,
  ) {
    super(headingText, vscode.TreeItemCollapsibleState.None);
    this.id = `outline-${lineNumber}-${headingText}`;
    this.description = `H${level}`;
    this.tooltip = `H${level}: ${headingText} (line ${lineNumber + 1})`;
    this.command = {
      command: 'markflowPro.outline.jumpTo',
      title: 'Jump to Heading',
      arguments: [lineNumber],
    };
    this.iconPath = new vscode.ThemeIcon(HEADING_ICON[level] ?? 'symbol-key');
    this.contextValue = 'outlineHeading';
  }
}

export class OutlineManager
  implements
    vscode.TreeDataProvider<OutlineItem>,
    vscode.TreeDragAndDropController<OutlineItem>,
    vscode.Disposable
{
  private _items: OutlineItem[] = [];
  private _document: vscode.TextDocument | undefined;
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly _onDidChangeTreeData = new vscode.EventEmitter<OutlineItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  readonly dropMimeTypes = [MIME_TYPE];
  readonly dragMimeTypes = [MIME_TYPE];

  private readonly disposables: vscode.Disposable[] = [];

  constructor() {
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(e => this.onEditorChange(e)),
      vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document === this._document) {
          this.scheduleRefresh();
        }
      }),
    );
    this.onEditorChange(vscode.window.activeTextEditor);
  }

  // ── TreeDataProvider ────────────────────────────────────────────────────────

  getTreeItem(element: OutlineItem): vscode.TreeItem {
    return element;
  }

  getChildren(): OutlineItem[] {
    if (!isProActivated()) { return []; }
    return this._items;
  }

  // ── TreeDragAndDropController ────────────────────────────────────────────────

  handleDrag(source: readonly OutlineItem[], dataTransfer: vscode.DataTransfer): void {
    dataTransfer.set(MIME_TYPE, new vscode.DataTransferItem(source));
  }

  async handleDrop(
    target: OutlineItem | undefined,
    dataTransfer: vscode.DataTransfer,
  ): Promise<void> {
    const transferItem = dataTransfer.get(MIME_TYPE);
    if (!transferItem || !this._document) { return; }

    const [sourceItem] = transferItem.value as OutlineItem[];
    if (!sourceItem) { return; }

    await this.reorderSections(this._document, sourceItem, target);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private onEditorChange(editor: vscode.TextEditor | undefined): void {
    this._document = editor?.document.languageId === 'markdown' ? editor.document : undefined;
    this.refresh();
  }

  private scheduleRefresh(): void {
    if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
    this.debounceTimer = setTimeout(() => this.refresh(), 300);
  }

  private refresh(): void {
    this._items = this._document ? this.parseHeadings(this._document) : [];
    this._onDidChangeTreeData.fire();
  }

  private parseHeadings(document: vscode.TextDocument): OutlineItem[] {
    const items: OutlineItem[] = [];
    for (let i = 0; i < document.lineCount; i++) {
      const match = document.lineAt(i).text.match(/^(#{1,6})\s+(.+)/);
      if (match) {
        items.push(new OutlineItem(match[2].trim(), match[1].length, i));
      }
    }
    return items;
  }

  private async reorderSections(
    document: vscode.TextDocument,
    sourceItem: OutlineItem,
    targetItem: OutlineItem | undefined,
  ): Promise<void> {
    const items = this.parseHeadings(document);
    const srcIdx = items.findIndex(i => i.lineNumber === sourceItem.lineNumber);
    const tgtIdx = targetItem === undefined
      ? items.length
      : items.findIndex(i => i.lineNumber === targetItem.lineNumber);

    // Nothing to do: source not found, same position, or already directly before target
    if (srcIdx === -1 || tgtIdx === -1 || srcIdx === tgtIdx || srcIdx === tgtIdx - 1) { return; }

    // Build section text blocks — each from its heading line to the start of the next heading
    const sections = items.map((item, idx) => {
      const startPos = new vscode.Position(item.lineNumber, 0);
      const endPos = idx + 1 < items.length
        ? new vscode.Position(items[idx + 1].lineNumber, 0)
        : new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
      let text = document.getText(new vscode.Range(startPos, endPos));
      // Ensure each section ends with a newline so sections join cleanly
      if (!text.endsWith('\n')) { text += '\n'; }
      return text;
    });

    // Reorder: remove source, insert at adjusted target index
    const reordered = [...sections];
    const [moved] = reordered.splice(srcIdx, 1);
    const adjustedTgt = tgtIdx > srcIdx ? tgtIdx - 1 : tgtIdx;
    reordered.splice(adjustedTgt, 0, moved);

    // Replace from the first heading to end of document (preserves pre-heading content)
    const replaceRange = new vscode.Range(
      new vscode.Position(items[0].lineNumber, 0),
      new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length),
    );

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, replaceRange, reordered.join(''));
    await vscode.workspace.applyEdit(edit);
    logger.log(`Outline: moved "${sourceItem.headingText}" to position ${adjustedTgt}`);
  }

  dispose(): void {
    if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
    this._onDidChangeTreeData.dispose();
    this.disposables.forEach(d => d.dispose());
    this.disposables.length = 0;
  }
}
