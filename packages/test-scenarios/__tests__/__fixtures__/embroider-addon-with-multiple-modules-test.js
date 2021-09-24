import { module, test } from 'qunit';
import { getTestMetadata } from '@ember/test-helpers';

module('Acceptance | with-multiple-modules-test', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.equal(getTestMetadata(this).filePath, 'lib/example-addon/tests/unit/embroider-addon-with-multiple-modules-test.js');
  });
});

module('Acceptance | with-multiple-modules-test 2', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.equal(getTestMetadata(this).filePath, 'lib/example-addon/tests/unit/embroider-addon-with-multiple-modules-test.js');
  });
});
