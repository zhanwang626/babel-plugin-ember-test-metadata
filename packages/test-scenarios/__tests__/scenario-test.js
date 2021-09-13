const { Scenarios, Project } = require('scenario-tester');
const { dirname, join } = require('path');
const { readFileSync } = require('fs');
const { merge } = require('lodash');

jest.setTimeout(500000);

async function classic(project) {
  merge(project.files, {
    'ember-cli-build.js': `'use strict';
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { getProjectConfiguration } = require('babel-plugin-ember-test-metadata/utils');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      plugins: [
        [
          require.resolve('babel-plugin-ember-test-metadata'),
          {
            enabled: true,
            projectConfiguration: getProjectConfiguration(defaults.project)
          }
        ]
      ],
    }
  });
  return app.toTree();
};
`,
    tests: {
      unit: getTestFiles(
        'with-hooks-test.js',
        'without-hooks-test.js',
        'with-multiple-modules-test.js'
      ),
    },
  });
}

async function classicInRepoAddon(project) {
  await classic(project);
  await addInRepoAddon(project, ['fake-addon', 'fake-addon-two']);
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
    tests: {
      unit: getTestFiles(
        'with-hooks-assert-includes-test.js',
        'without-hooks-assert-includes-test.js',
        'with-multiple-modules-assert-includes-test.js'
      ),
    },
  });
}

// async function embroiderInRepoAddon(project) {
//   await embroider(project);
//   await addInRepoAddon(project, 'fake-addon');
// }

async function addInRepoAddon(project, names, version = '0.0.0') {
  project.linkDependency('ember-add-in-repo-tests', {
    baseDir: __dirname,
  });

  project.pkg['ember-addon'] = {
    paths: [],
  };

  const lib = {};

  names.forEach((name) => {
    project.pkg['ember-addon'].paths.push(`lib/${name}`);
    lib[name] = {
      'package.json': `{
        "name": "${name}",
        "version": "${version}",
        "keywords": ["ember-addon"]
      }`,
      'index.js': `module.exports = {
        name: '${name}',
        isDevelopingAddon() {
          return true;
        },
        includeTestsInHost: true,
      };`,
      tests: {
        unit: getAddonTestFile('with-hooks-in-repo-addon-test.js', name),
      },
    };
  });

  merge(project.files, {
    'ember-cli-build.js': `'use strict';

    const EmberApp = require('ember-cli/lib/broccoli/ember-app');
    const { addInRepoTestsToHost } = require('ember-add-in-repo-tests');
    const { getProjectConfiguration } = require('babel-plugin-ember-test-metadata/utils');

    module.exports = function (defaults) {
      let app = new EmberApp(defaults, {
        trees: {
          tests: addInRepoTestsToHost(
            defaults.project,
            addon => addon.includeTestsInHost
          ),
        },
        babel: {
          plugins: [
            [
              require.resolve('babel-plugin-ember-test-metadata'),
              {
                enabled: true,
                projectConfiguration: getProjectConfiguration(defaults.project)
              }
            ]
          ],
        }
      });

      return app.toTree();
    };
    `,
    lib,
  });
}

function getAddonTestFile(file, addonName) {
  const result = {};
  const tmpFile = readFileSync(join(__dirname, '__fixtures__', file), { encoding: 'utf-8' });

  result[file] = tmpFile.replace('addon-name-placeholder', addonName);
  return result;
}

function getTestFiles(...files) {
  return files.reduce((testFiles, file) => {
    testFiles[file] = readFileSync(join(__dirname, '__fixtures__', file), { encoding: 'utf-8' });

    return testFiles;
  }, {});
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
    classicInRepoAddon,
    embroider,
    // embroiderInRepoAddon,
  })
  .map('app scenarios', (project) => {
    project.linkDependency('babel-plugin-ember-test-metadata', {
      baseDir: __dirname,
    });
  })
  .forEachScenario((scenario) => {
    describe(scenario.name, () => {
      const numberOfTests = scenario.name.includes('classicInRepoAddon-app') ? '7' : '5';
      let app;

      beforeAll(async () => {
        app = await scenario.prepare();
      });

      it('runs tests', async () => {
        let result = await app.execute('node ./node_modules/ember-cli/bin/ember test');

        expect(result.output).toMatch(`# tests ${numberOfTests}`);
        expect(result.output).toMatch(`# pass  ${numberOfTests}`);
        expect(result.exitCode).toEqual(0);
      });
    });
  });
