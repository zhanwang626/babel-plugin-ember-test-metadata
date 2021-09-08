const { Scenarios, Project } = require('scenario-tester');
const { dirname, delimiter } = require('path');
const { merge } = require('lodash');

jest.setTimeout(500000);

// https://github.com/volta-cli/volta/issues/702
// We need this because we're launching node in child processes and we want
// those children to respect volta config per project.
(function restoreVoltaEnvironment() {
  let voltaHome = process.env['VOLTA_HOME'];
  if (!voltaHome) return;
  let paths = process.env['PATH'].split(delimiter);
  while (/\.volta/.test(paths[0])) {
    paths.shift();
  }
  paths.unshift(`${voltaHome}/bin`);
  process.env['PATH'] = paths.join(delimiter);
})();

// eslint-disable-next-line node/no-unpublished-require
const babelPluginPath = require.resolve('../../babel-plugin-ember-test-metadata/dist/index');

async function classic(project) {
  merge(project.files, {
    'ember-cli-build.js': `'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      plugins: [
        [
          '${babelPluginPath}',
          { enabled: true }
        ]
      ],
    }
  });

  return app.toTree();
};
`,
  });
}

// async function embroider(project) {}

function supportMatrix(scenarios) {
  return scenarios.expand({
    classic,
    // embroider,
  });
}

function baseApp() {
  return Project.fromDir(
    // eslint-disable-next-line node/no-unpublished-require
    dirname(require.resolve('@babel-plugin-ember-test-metadata/app-template/package.json')),
    {
      linkDeps: true,
    }
  );
}

supportMatrix(Scenarios.fromProject(baseApp))
  .map('app scenarios', (project) => {
    merge(project.files, {
      tests: {
        unit: {
          'with-hooks-test.js': `import { module, test } from 'qunit';
import { getTestMetadata } from '@ember/test-helpers';

module('Acceptance | with-hooks-test', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.equal(getTestMetadata(this).filePath, '@babel-plugin-ember-test-metadata/app-template/tests/unit/with-hooks-test.js');
  });
});
`,
          'without-hooks-test.js': `import { module, test } from 'qunit';
import { getTestMetadata } from '@ember/test-helpers';

module('Acceptance | without-hooks-test', function () {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.equal(getTestMetadata(this).filePath, '@babel-plugin-ember-test-metadata/app-template/tests/unit/without-hooks-test.js');
  });
});
`,
          'with-multiple-modules-test.js': `import {module, test} from 'qunit';
import { getTestMetadata } from '@ember/test-helpers';

module('Acceptance | with-multiple-modules-test', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.equal(getTestMetadata(this).filePath, '@babel-plugin-ember-test-metadata/app-template/tests/unit/with-multiple-modules-test.js');
  });
});

module('Acceptance | with-multiple-modules-test 2', function (hooks) {
  hooks.beforeEach(function () {
    // noop
  });

  test('example', async function (assert) {
    assert.equal(getTestMetadata(this).filePath, '@babel-plugin-ember-test-metadata/app-template/tests/unit/with-multiple-modules-test.js');
  });
});
`,
        },
      },
    });
  })
  .forEachScenario((scenario) => {
    describe(scenario.name, () => {
      let app;

      beforeEach(async () => {
        app = await scenario.prepare();
      });

      it('runs tests', async () => {
        let result = await app.execute('yarn test:ember');

        expect(result.exitCode).toEqual(0);
        expect(result.output).toMatch('# tests 5');
        expect(result.output).toMatch('# pass  5');
      });
    });
  });
