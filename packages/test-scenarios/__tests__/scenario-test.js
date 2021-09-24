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
  project.pkg.scenarioTesterTests = {
    tests: {
      unit: getTestFiles([
        'with-hooks-test.js',
        'without-hooks-test.js',
        'with-multiple-modules-test.js',
      ]),
    },
  };
  project.linkDependency('ember-add-in-repo-tests', {
    baseDir: __dirname,
  });

  if (!project.pkg['ember-addon']) {
    project.pkg['ember-addon'] = {
      paths: [],
    };
  }
  project.pkg['ember-addon'].paths.push(`lib/example-addon`);

  project.pkg.scenarioTesterTests = {
    lib: {
      "example-addon": {
        tests: {
          unit: getTestFiles(
            [
              'classic-addon-with-hooks-test.js',
              'classic-addon-without-hooks-test.js',
              'classic-addon-with-multiple-modules-test.js'
            ],
            `lib/example-addon/`
          ),
        },
      },
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
          tests: addInRepoTestsToHost({
            project: defaults.project,
            shouldIncludeTestsInHost: (addon) => addon.includeTestsInHost,
          }),
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
    lib: {
      "example-addon": {
        'package.json': JSON.stringify({
          name: "example-addon",
          version: "0.0.0",
          keywords: ['ember-addon'],
        }),
        'index.js': `module.exports = {
          name: require("./package").name,
          isDevelopingAddon() {
            return true;
          },
          includeTestsInHost: true,
        };`,
      },
    },
  });
}

async function embroider(project) {
  project.pkg.scenarioTesterTests = {
    tests: {
      unit: getTestFiles([
        'embroider-with-hooks-test.js',
        'embroider-without-hooks-test.js',
        'embroider-with-multiple-modules-test.js',
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
  project.pkg.scenarioTesterTests = {
    tests: {
      unit: getTestFiles([
        'embroider-with-hooks-test.js',
        'embroider-without-hooks-test.js',
        'embroider-with-multiple-modules-test.js',
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
  project.linkDependency('ember-add-in-repo-tests', {
    baseDir: __dirname,
  });

  if (!project.pkg['ember-addon']) {
    project.pkg['ember-addon'] = {
      paths: [],
    };
  }
  project.pkg['ember-addon'].paths.push(`lib/example-addon`);

  project.pkg.scenarioTesterTests = {
    lib: {
      "example-addon": {
        tests: {
          unit: getTestFiles(
            [
              'embroider-addon-with-hooks-test.js',
              'embroider-addon-without-hooks-test.js',
              'embroider-addon-with-multiple-modules-test.js'
            ],
            'lib/example-addon/'
          ),
        },
      },
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
          tests: addInRepoTestsToHost({
            project: defaults.project,
            shouldIncludeTestsInHost: (addon) => addon.includeTestsInHost,
          }),
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
      const { Webpack } = require('@embroider/webpack');
      return require('@embroider/compat').compatBuild(app, Webpack);
    };
    `,
    lib: {
      "example-addon": {
        'package.json': JSON.stringify({
          name: "example-addon",
          version: "0.0.0",
          keywords: ['ember-addon'],
        }),
        'index.js': `module.exports = {
          name: require("./package").name,
          isDevelopingAddon() {
            return true;
          },
          includeTestsInHost: true,
        };`,
      },
    },
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
