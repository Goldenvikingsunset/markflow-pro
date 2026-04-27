import * as vscode from 'vscode';

type Layout = 'sideBySide' | 'below' | 'tab';
export type Theme = 'default' | 'github' | 'githubDark' | 'notion' | 'bear';

function cfg() {
  return vscode.workspace.getConfiguration('markflowPro');
}

export function isEnabled(): boolean {
  return cfg().get<boolean>('enabled', true);
}

export function getLayout(): Layout {
  return cfg().get<Layout>('layout', 'sideBySide');
}

export function getAutoClose(): boolean {
  return cfg().get<boolean>('autoClose', false);
}

export function getTheme(): Theme {
  return cfg().get<Theme>('pro.theme', 'default');
}
