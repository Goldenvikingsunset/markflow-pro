import * as vscode from 'vscode';
import * as path from 'path';
import { marked } from 'marked';
import { isProActivated } from './licenceManager';
import { getThemeCss } from './themeManager';
import { logger } from '../utils/logger';
import { Strings } from '../utils/strings';

const DEFAULT_EXPORT_CSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 16px; line-height: 1.7;
  padding: 48px 64px; max-width: 860px; margin: 0 auto;
  color: #1a1a1a; background: #ffffff;
}
h1,h2,h3,h4,h5,h6 { font-weight: 600; line-height: 1.25; margin-top: 24px; margin-bottom: 16px; }
h1 { font-size: 2em; border-bottom: 1px solid #e1e4e8; padding-bottom: .3em; }
h2 { font-size: 1.5em; border-bottom: 1px solid #e1e4e8; padding-bottom: .3em; }
h3 { font-size: 1.25em; }
code { font-family: 'SFMono-Regular',Consolas,monospace; background:#f6f8fa; padding:.2em .4em; border-radius:3px; font-size:85%; }
pre { background:#f6f8fa; padding:16px; border-radius:6px; overflow-x:auto; line-height:1.45; }
pre code { background:none; padding:0; font-size:100%; }
blockquote { margin:0 0 16px; padding:0 1em; color:#6a737d; border-left:.25em solid #dfe2e5; }
a { color:#0366d6; text-decoration:none; }
a:hover { text-decoration:underline; }
img { max-width:100%; height:auto; }
table { border-collapse:collapse; width:100%; margin-bottom:16px; }
th,td { border:1px solid #dfe2e5; padding:6px 13px; }
th { background:#f6f8fa; font-weight:600; }
tr:nth-child(2n) { background:#fafafa; }
hr { border:none; border-top:1px solid #e1e4e8; margin:24px 0; }
ul,ol { padding-left:2em; margin-bottom:16px; }
li { margin:4px 0; }
`;

function buildHtml(body: string, title: string, forPrint = false): string {
  const css = getThemeCss() || DEFAULT_EXPORT_CSS;
  const printMedia = forPrint ? '@media print { body { margin: 0; } } ' : '';
  const printScript = forPrint
    ? '<script>window.addEventListener("load", function(){ window.print(); });</script>'
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${printMedia}${css}</style>
</head>
<body>
${body}
${printScript}</body>
</html>`;
}

async function getDocument(uri?: vscode.Uri): Promise<vscode.TextDocument | undefined> {
  if (uri) {
    return vscode.workspace.openTextDocument(uri);
  }
  const editor = vscode.window.activeTextEditor;
  if (editor?.document.languageId === 'markdown') {
    return editor.document;
  }
  vscode.window.showErrorMessage(Strings.exportNoMarkdown);
  return undefined;
}

function showProGate(): void {
  vscode.window.showInformationMessage(
    Strings.proGateMessage,
    Strings.proGateActivate,
    Strings.proGateLearnMore,
  ).then(choice => {
    if (choice === Strings.proGateActivate) {
      vscode.commands.executeCommand('markflowPro.activateLicence');
    } else if (choice === Strings.proGateLearnMore) {
      vscode.env.openExternal(vscode.Uri.parse('https://gingerturtleapps.github.io/markflow-pro'));
    }
  });
}

export async function exportHtml(uri?: vscode.Uri): Promise<void> {
  if (!isProActivated()) { showProGate(); return; }

  const document = await getDocument(uri);
  if (!document) { return; }

  const body = marked.parse(document.getText()) as string;
  const title = path.basename(document.fileName, path.extname(document.fileName));
  const html = buildHtml(body, title);
  const outUri = vscode.Uri.file(document.fileName.replace(/\.md$/i, '.html'));

  try {
    await vscode.workspace.fs.writeFile(outUri, Buffer.from(html, 'utf8'));
    logger.log(`HTML export: ${outUri.fsPath}`);
    const choice = await vscode.window.showInformationMessage(
      `${Strings.exportHtmlSuccess} ${path.basename(outUri.fsPath)}`,
      Strings.exportOpenInBrowser,
    );
    if (choice === Strings.exportOpenInBrowser) {
      await vscode.env.openExternal(outUri);
    }
  } catch (err) {
    logger.log(`HTML export error: ${err}`);
    vscode.window.showErrorMessage(Strings.exportError);
  }
}

export async function exportPdf(uri?: vscode.Uri): Promise<void> {
  if (!isProActivated()) { showProGate(); return; }

  const document = await getDocument(uri);
  if (!document) { return; }

  const body = marked.parse(document.getText()) as string;
  const title = path.basename(document.fileName, path.extname(document.fileName));

  const panel = vscode.window.createWebviewPanel(
    'markflowPdfExport',
    `PDF Export — ${title}`,
    vscode.ViewColumn.Beside,
    { enableScripts: true, retainContextWhenHidden: false },
  );

  panel.webview.html = buildHtml(body, title, true);
  logger.log(`PDF export panel: ${title}`);
  vscode.window.showInformationMessage(Strings.exportPdfHint);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
