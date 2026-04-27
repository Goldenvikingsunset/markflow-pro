import * as assert from 'assert';
import { isEnabled, getLayout, getAutoClose } from '../../utils/config';

suite('Config', () => {
  test('isEnabled() returns true by default', () => {
    assert.strictEqual(isEnabled(), true);
  });

  test('getLayout() returns sideBySide by default', () => {
    assert.strictEqual(getLayout(), 'sideBySide');
  });

  test('getAutoClose() returns false by default', () => {
    assert.strictEqual(getAutoClose(), false);
  });
});
