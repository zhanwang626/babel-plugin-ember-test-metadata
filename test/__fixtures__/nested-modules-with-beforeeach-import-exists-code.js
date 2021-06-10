import {module, test} from 'qunit';
import {setupApplicationTest} from 'ember-qunit';
import { click, visit } from '@ember/test-helpers';

const SELECTORS = Object.freeze({
  MOCK_SELECTOR: '[data-test-nav-bar-browse]',
});

module('Acceptance | browse acceptance test', function (hooks) {
  setupApplicationTest(hooks);

  some.otherThing(function () {
    noop();
  })

  beforeEach(function () {
    const myConst = 0;
    noop();
    // do some things here
  });

  module('nested module', () => {
    beforeEach(() => {
      // nested beforeEach should be left untouched
    })
    test('a test', () => {});
    module('nested module', () => {
      test('a test', () => {});
    });
  });

  test('it renders browse page', async function (assert) {
    await visit(BROWSE_URL);
    assert.dom(SELECTORS.MOCK_SELECTOR).exists();
  });
});
