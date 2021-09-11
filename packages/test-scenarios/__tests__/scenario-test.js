const { Scenarios, Project } = require('scenario-tester');
const { dirname, join } = require('path');
const { merge } = require('lodash');
const { realpathSync } = require('fs-extra');
const tmp = require('tmp');

jest.setTimeout(500000);

const rootTmpDir = createTmpDir();

function createTmpDir() {
  return realpathSync(tmp.dirSync({ unsafeCleanup: true }).name);
}

async function classic(project) {
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
  assert.ok(getTestMetadata(this).filePath.includes('tests/unit/with-hooks-test.js'));
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
  assert.ok(getTestMetadata(this).filePath.includes('tests/unit/without-hooks-test.js'));
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
`,
      },
    },
    'ember-cli-build.js': `'use strict';
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      plugins: [
        [
          require.resolve('babel-plugin-ember-test-metadata'),
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

async function embroider(project) {
  project.linkDependency('@embroider/core', {
    baseDir: __dirname,
  });
  project.linkDependency('@embroider/compat', {
    baseDir: __dirname,
  });
  project.linkDependency('@embroider/webpack', {
    baseDir: __dirname,
  });
  project.linkDependency('webpack', {
    baseDir: __dirname,
  });

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
  assert.equal(getTestMetadata(this).filePath, 'tests/unit/with-hooks-test.js');
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
  assert.equal(getTestMetadata(this).filePath, 'tests/unit/without-hooks-test.js');
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
  assert.equal(getTestMetadata(this).filePath, 'tests/unit/with-multiple-modules-test.js');
});
});

module('Acceptance | with-multiple-modules-test 2', function (hooks) {
hooks.beforeEach(function () {
  // noop
});

test('example', async function (assert) {
  assert.equal(getTestMetadata(this).filePath, 'tests/unit/with-multiple-modules-test.js');
});
});
`,
      },
    },
    'ember-cli-build.js': `'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      plugins: [
        [
          require.resolve('babel-plugin-ember-test-metadata'),
          { enabled: true }
        ]
      ],
    }
  });

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack);
};
`,
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

Scenarios.fromProject(baseApp)
  .expand({
    classic,
    embroider,
  })
  .map('app scenarios', (project) => {
    project.linkDependency('babel-plugin-ember-test-metadata', {
      baseDir: __dirname,
    });
  })
  .forEachScenario((scenario) => {
    describe(scenario.name, () => {
      const EMBROIDER = 'embroider';
      const EMBROIDER_PATH_SEGMENT = '999999';
      let app;
      let appTmp;

      beforeAll(async () => {
        if (scenario.name.includes('embroider-app')) {
          appTmp = join(rootTmpDir, EMBROIDER, EMBROIDER_PATH_SEGMENT);
        }

        app = await scenario.prepare(appTmp);
      });

      it('runs tests', async () => {
        let result = await app.execute('node ./node_modules/ember-cli/bin/ember test');

        expect(result.output).toMatch('# tests 5');
        expect(result.output).toMatch('# pass  5');
        expect(result.exitCode).toEqual(0);
      });
    });
  });
