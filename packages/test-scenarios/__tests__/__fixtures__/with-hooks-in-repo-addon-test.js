import { module, test } from 'qunit';
import { getTestMetadata } from '@ember/test-helpers';

module('Acceptance | with-hooks-in-repo-addon-test', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.equal(
      getTestMetadata(this).filePath,
      'lib/addon-name-placeholder/tests/unit/with-hooks-in-repo-addon-test.js'
    );
  });
});
