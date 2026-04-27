import * as vscode from 'vscode';

class Logger implements vscode.Disposable {
  private readonly channel: vscode.OutputChannel;

  constructor() {
    this.channel = vscode.window.createOutputChannel('MarkFlow Pro');
  }

  log(message: string): void {
    this.channel.appendLine(`[MarkFlow Pro] ${message}`);
  }

  dispose(): void {
    this.channel.dispose();
  }
}

export const logger = new Logger();
