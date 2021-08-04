import {module, test} from 'qunit';
import { click } from '@ember/test-helpers';

module('Acceptance | example test', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    click();
    assert(true)
  });
});
