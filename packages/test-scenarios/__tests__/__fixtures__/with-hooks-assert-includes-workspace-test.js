import { module, test } from 'qunit';
import { getTestMetadata } from '@ember/test-helpers';

module('Acceptance | with-hooks-workspace-test', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.equal(getTestMetadata(this).filePath, 'packages/addons/fake-addon/tests/unit/with-hooks-assert-includes-workspace-test.js');
  });
});
