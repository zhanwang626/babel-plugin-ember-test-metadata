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

module('Acceptance | example test 2', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    click();
    assert(true)
  });
});
