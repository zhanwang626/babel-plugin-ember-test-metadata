const { Scenarios, Project } = require('scenario-tester');
const { dirname, join } = require('path');
const { readFileSync } = require('fs');
const { merge } = require('lodash');

jest.setTimeout(500000);

async function classic(project) {
  project.pkg.scenarioTesterTests = {
    tests: {
      unit: getTestFiles([
        'with-hooks-test.js',
        'without-hooks-test.js',
        'with-multiple-modules-test.js',
      ]),
    },
  };
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
  });
}

async function classicInRepoAddon(project) {
  await classic(project);
  await addInRepoAddon(project, ['fake-addon']);
}

async function embroider(project) {
  project.pkg.scenarioTesterTests = {
    tests: {
      unit: getTestFiles([
        'with-hooks-test.js',
        'without-hooks-test.js',
        'with-multiple-modules-test.js',
      ]),
    },
  };
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
  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack);
};
`,
  });
}

async function embroiderInRepoAddon(project) {
  await embroider(project);
  await addInRepoAddon(project, ['fake-addon']);
}

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
      'package.json': JSON.stringify({
        name,
        version,
        keywords: ['ember-addon'],
      }),
      'index.js': `module.exports = {
        name: require("./package").name,
        isDevelopingAddon() {
          return true;
        },
        includeTestsInHost: true,
      };`,
    };
  });

  project.pkg.scenarioTesterTests = {
    lib: {},
  };

  project.pkg.scenarioTesterTests.lib[names[0]] = {
    tests: {
      unit: getTestFiles(
        ['with-hooks-test.js', 'without-hooks-test.js', 'with-multiple-modules-test.js'],
        `lib/${names[0]}/`
      ),
    },
  };

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

function getTestFiles(files, scenarioPrefix = '') {
  return files.reduce((testFiles, file) => {
    const tmpFile = readFileSync(join(__dirname, '__fixtures__', file), { encoding: 'utf-8' });
    testFiles[file] = tmpFile.replace(/build-scenario-prefix\//g, scenarioPrefix);

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
    embroiderInRepoAddon,
  })
  .map('app scenarios', (project) => {
    project.linkDependency('babel-plugin-ember-test-metadata', {
      baseDir: __dirname,
    });

    merge(project.files, project.pkg.scenarioTesterTests);
  })
  .forEachScenario((scenario) => {
    describe(scenario.name, () => {
      let app;

      beforeAll(async () => {
        app = await scenario.prepare();
      });

      it('runs tests', async () => {
        let result = await app.execute('node ./node_modules/ember-cli/bin/ember test');

        expect(result.output).toMatch('# tests 5');
        expect(result.output).toMatch('# pass  5');
        expect(result.exitCode).toEqual(0);
      });
    });
  });
