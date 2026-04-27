import * as vscode from 'vscode';
import { getLayout } from '../utils/config';

export class LayoutManager {
  /**
   * Returns the ViewColumn to use when creating the preview panel,
   * based on the markflowPro.layout setting.
   */
  static getColumn(): vscode.ViewColumn {
    switch (getLayout()) {
      case 'tab':
        // Open preview as a tab in the active column (no split)
        return vscode.ViewColumn.Active;
      case 'below':
        // VS Code doesn't expose a native "below" split for editor webviews.
        // Use column Two as the closest approximation; users can drag the tab.
        return vscode.ViewColumn.Two;
      case 'sideBySide':
      default:
        return vscode.ViewColumn.Beside;
    }
  }
}
