import * as vscode from 'vscode';
import { PreviewManager } from './preview/previewManager';
import { logger } from './utils/logger';
import { Strings } from './utils/strings';
import { getLayout, getAutoClose, isEnabled } from './utils/config';
import { initLicenceManager } from './pro/licenceManager';
import { exportHtml, exportPdf } from './pro/exportManager';
import { OutlineManager } from './pro/outlineManager';
import { StatsBar } from './pro/statsBar';

interface SettingsItem extends vscode.QuickPickItem {
  action?: () => Thenable<void>;
}

function computeStatusBarText(isPro: boolean): string {
  if (isPro) { return Strings.statusBarPro; }
  const labels: Record<string, string> = {
    sideBySide: Strings.statusBarSideBySide,
    below: Strings.statusBarBelow,
    tab: Strings.statusBarTab,
  };
  return labels[getLayout()] ?? Strings.statusBarText;
}

async function showQuickSettings(): Promise<void> {
  const layout = getLayout();
  const autoClose = getAutoClose();
  const enabled = isEnabled();
  const cfg = vscode.workspace.getConfiguration('markflowPro');

  const items: SettingsItem[] = [
    {
      label: '$(split-horizontal) Layout: Side by Side',
      description: layout === 'sideBySide' ? '$(check) active' : '',
      action: () => cfg.update('layout', 'sideBySide', vscode.ConfigurationTarget.Global),
    },
    {
      label: '$(split-vertical) Layout: Below',
      description: layout === 'below' ? '$(check) active' : '',
      action: () => cfg.update('layout', 'below', vscode.ConfigurationTarget.Global),
    },
    {
      label: '$(multiple-windows) Layout: Tab',
      description: layout === 'tab' ? '$(check) active' : '',
      action: () => cfg.update('layout', 'tab', vscode.ConfigurationTarget.Global),
    },
    { label: '', kind: vscode.QuickPickItemKind.Separator },
    {
      label: '$(eye) Auto-close when leaving .md',
      description: autoClose ? 'On — click to turn off' : 'Off — click to turn on',
      action: () => cfg.update('autoClose', !autoClose, vscode.ConfigurationTarget.Global),
    },
    {
      label: enabled ? '$(check) Extension enabled' : '$(circle-slash) Extension disabled',
      description: enabled ? 'Click to disable' : 'Click to enable',
      action: () => cfg.update('enabled', !enabled, vscode.ConfigurationTarget.Global),
    },
  ];

  const pick = await vscode.window.showQuickPick(items, {
    title: Strings.quickSettingsTitle,
    placeHolder: Strings.quickSettingsPlaceholder,
  });

  if (pick?.action) {
    await pick.action();
  }
}

export function activate(context: vscode.ExtensionContext): void {
  logger.log('MarkFlow Pro activated');

  const licenceManager = initLicenceManager(context);
  const previewManager = new PreviewManager();
  const outlineManager = new OutlineManager();
  const statsBar = new StatsBar();

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'markflowPro.quickSettings';
  statusBar.text = computeStatusBarText(licenceManager.isActivated());
  statusBar.tooltip = Strings.statusBarTooltip;
  statusBar.show();

  // Expose Pro activation state as a VS Code context variable so package.json
  // viewsWelcome `when` clauses can react to it.
  vscode.commands.executeCommand('setContext', 'markflowPro.proActive', licenceManager.isActivated());

  const treeView = vscode.window.createTreeView('markflowPro.outline', {
    treeDataProvider: outlineManager,
    dragAndDropController: outlineManager,
    showCollapseAll: false,
  });

  context.subscriptions.push(
    licenceManager,
    previewManager,
    outlineManager,
    statsBar,
    treeView,
    statusBar,
    logger,

    licenceManager.onActivationChanged(activated => {
      vscode.commands.executeCommand('setContext', 'markflowPro.proActive', activated);
      statusBar.text = computeStatusBarText(activated);
      statsBar.refresh();
      // Refresh preview so theme change takes effect immediately
      const editor = vscode.window.activeTextEditor;
      if (editor?.document.languageId === 'markdown') {
        previewManager.update(editor.document);
      }
    }),

    vscode.commands.registerCommand('markflowPro.openPreview', () => {
      previewManager.openPreview();
    }),

    vscode.commands.registerCommand('markflowPro.closePreview', () => {
      previewManager.closePreview();
    }),

    vscode.commands.registerCommand('markflowPro.activateLicence', async () => {
      const key = await vscode.window.showInputBox({
        prompt: Strings.licenceKeyPrompt,
        placeHolder: Strings.licenceKeyPlaceholder,
        ignoreFocusOut: true,
        password: false,
      });
      if (key !== undefined) {
        await licenceManager.activate(key);
      }
    }),

    vscode.commands.registerCommand('markflowPro.deactivateLicence', async () => {
      const choice = await vscode.window.showWarningMessage(
        Strings.licenceDeactivateConfirm,
        { modal: true },
        Strings.licenceDeactivateYes,
      );
      if (choice === Strings.licenceDeactivateYes) {
        await licenceManager.deactivate();
        vscode.window.showInformationMessage(Strings.licenceDeactivated);
      }
    }),

    vscode.commands.registerCommand('markflowPro.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', Strings.settingsFilter);
    }),

    vscode.commands.registerCommand('markflowPro.quickSettings', () => {
      showQuickSettings();
    }),

    vscode.commands.registerCommand('markflowPro.exportHtml', (uri?: vscode.Uri) => {
      exportHtml(uri);
    }),

    vscode.commands.registerCommand('markflowPro.exportPdf', (uri?: vscode.Uri) => {
      exportPdf(uri);
    }),

    vscode.commands.registerCommand('markflowPro.outline.jumpTo', (line: number) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }
      const position = new vscode.Position(line, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.AtTop);
    }),

    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('markflowPro.layout') || e.affectsConfiguration('markflowPro.pro.theme')) {
        statusBar.text = computeStatusBarText(licenceManager.isActivated());
        // Re-render preview when theme setting changes
        if (e.affectsConfiguration('markflowPro.pro.theme')) {
          const editor = vscode.window.activeTextEditor;
          if (editor?.document.languageId === 'markdown') {
            previewManager.update(editor.document);
          }
        }
      }
    }),
  );

  // Validate licence on startup (async — don't block activation)
  licenceManager.validateOnStartup().catch(err => logger.log(`Licence startup check error: ${err}`));

  // Auto-open preview if a .md file is already active when the extension loads
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor?.document.languageId === 'markdown') {
    previewManager.show(activeEditor.document);
  }
}

export function deactivate(): void {
  // Subscriptions in context.subscriptions are disposed automatically by VS Code
}
