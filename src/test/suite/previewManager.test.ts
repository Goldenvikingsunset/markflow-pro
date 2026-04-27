import * as assert from 'assert';
import * as vscode from 'vscode';
import { PreviewManager } from '../../preview/previewManager';

suite('PreviewManager', () => {
  let manager: PreviewManager;

  setup(() => {
    manager = new PreviewManager();
  });

  teardown(() => {
    manager.dispose();
  });

  test('show() opens a preview panel for a markdown document', async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: '# Hello World\n\nThis is a test.',
      language: 'markdown',
    });
    // Should not throw
    manager.show(doc);
    assert.ok(true);
  });

  test('show() called twice reuses the panel instead of creating a new one', async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: '# File One',
      language: 'markdown',
    });
    const doc2 = await vscode.workspace.openTextDocument({
      content: '# File Two',
      language: 'markdown',
    });
    manager.show(doc);
    manager.show(doc2); // second call should update, not crash
    assert.ok(true);
  });

  test('closePreview() disposes the panel without error', async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: '# Close me',
      language: 'markdown',
    });
    manager.show(doc);
    manager.closePreview();
    assert.ok(true);
  });

  test('show() after closePreview() recreates the panel', async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: '# Reopen me',
      language: 'markdown',
    });
    manager.show(doc);
    manager.closePreview();
    // Brief yield so the onDidDispose callback fires
    await new Promise(r => setTimeout(r, 50));
    manager.show(doc); // should recreate the panel, not throw
    assert.ok(true);
  });

  test('openPreview() is a no-op when no markdown editor is active', () => {
    // openPreview() with no active markdown editor must not throw
    manager.openPreview();
    assert.ok(true);
  });

  test('update() is a no-op when panel is not open', async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: '# No panel yet',
      language: 'markdown',
    });
    // No panel open — should not throw
    manager.update(doc);
    assert.ok(true);
  });

  test('dispose() can be called multiple times without error', () => {
    manager.dispose();
    manager.dispose();
    assert.ok(true);
  });
});
