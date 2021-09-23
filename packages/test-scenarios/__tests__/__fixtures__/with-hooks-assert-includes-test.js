import { module, test } from 'qunit';
import { getTestMetadata } from '@ember/test-helpers';

module('Acceptance | with-hooks-test', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    const matcher = /^tests\/unit\/with-hooks-assert-includes-test\.js$/g;

    assert.notEqual(getTestMetadata(this).filePath.match(matcher), null);
  });
});
