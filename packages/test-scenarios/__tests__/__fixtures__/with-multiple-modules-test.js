import { module, test } from 'qunit';
import { getTestMetadata } from '@ember/test-helpers';

module('Acceptance | with-multiple-modules-test', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.ok(getTestMetadata(this).filePath.includes('tests/unit/with-multiple-modules-test.js'));
  });
});

module('Acceptance | with-multiple-modules-test 2', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.ok(getTestMetadata(this).filePath.includes('tests/unit/with-multiple-modules-test.js'));
  });
});
