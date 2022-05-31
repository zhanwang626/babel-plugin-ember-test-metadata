const { Scenarios, Project } = require('scenario-tester');
const { dirname, join } = require('path');
const { readFileSync } = require('fs');
const { merge } = require('lodash');
const { getTestFiles, EMBROIDER_DEPENDENCIES } = require('./helpers/utils');

jest.setTimeout(500000);

function getEmberCliBuildSrc(isEmbroider = false, isAddInRepo = false) {
  let maybeEmbroiderConfig = '';
  let appReturn = 'return app.toTree();';
  let maybeAddInRepoImport = '';
  let maybeTrees = '';

  if (isEmbroider) {
    maybeEmbroiderConfig = 'isUsingEmbroider: true,';
    appReturn = `const { Webpack } = require('@embroider/webpack');
      return require('@embroider/compat').compatBuild(app, Webpack);`;
  }

  if (isAddInRepo) {
    maybeAddInRepoImport = `const { addInRepoTestsToHost } = require('ember-add-in-repo-tests');`;
    maybeTrees = `trees: {
        tests: addInRepoTestsToHost({
          project: defaults.project,
          shouldIncludeTestsInHost: () => true,
          projectRoot: '../..',
        }),
      },`;
  }

  return `'use strict';

    const EmberApp = require('ember-cli/lib/broccoli/ember-app');
    ${maybeAddInRepoImport}

    module.exports = function (defaults) {
      let app = new EmberApp(defaults, {
        babel: {
          plugins: [
            [
              require.resolve('babel-plugin-ember-test-metadata'),
              {
                enabled: true,
                packageName: defaults.project.pkg.name,
                ${maybeEmbroiderConfig}
                projectRoot: '../..',
              },
            ],
          ],
        },
        ${maybeTrees}
      });

      ${appReturn}
    };`;
}

function workspaceAddInRepoAddon(project, { name, version = '0.0.0', isEmbroider = false }) {
  project.linkDependency('ember-add-in-repo-tests', {
    baseDir: __dirname,
  });

  const appPackageJson = JSON.parse(project.files.packages['nonstandard-workspaces-app']['package.json']);
  appPackageJson['ember-addon'] = {
    paths: [`../addons/${name}`],
  };

  merge(project.files, {
    packages: {
      'nonstandard-workspaces-app': {
        'ember-cli-build.js': getEmberCliBuildSrc(isEmbroider, true),
        'package.json': JSON.stringify(appPackageJson),
      },
      addons: {
        [name]: {
          'index.js': `module.exports = {
            name: require('./package').name,
            babel: [
              [
                require.resolve('babel-plugin-ember-test-metadata'),
                {
                  enabled: true,
                  packageName: 'nonstandard-workspaces-app',
                  projectRoot: '../..',
                },
              ],
            ],
          };`,
          'package.json': `{
            "name": "${name}",
            "version": "${version}",
            "keywords": ["ember-addon"]
          }`,
          tests: {
            unit: getTestFiles('with-hooks-assert-includes-ns-workspace-test.js'),
          },
        },
      },
    },
  });
}

function nonStandardWorkspaceClassic(project) {
  merge(project.files, {
    packages: {
      'nonstandard-workspaces-app': {
        'ember-cli-build.js': getEmberCliBuildSrc(),
        tests: {
          unit: getTestFiles(
            'with-hooks-ns-workspace-test.js',
            'without-hooks-ns-workspace-test.js',
            'with-multiple-modules-ns-workspace-test.js'
          ),
        },
      },
    },
  });
}

function nonStandardWorkspaceEmbroider(project) {
  const scenarioPackageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), { encoding: 'utf-8' }));
  const appPackageJson = JSON.parse(project.files.packages['nonstandard-workspaces-app']['package.json']);

  EMBROIDER_DEPENDENCIES.forEach((dependency) => {
    project.linkDependency(dependency, {
      baseDir: __dirname,
    });
    appPackageJson.devDependencies[dependency] = scenarioPackageJson.devDependencies[dependency];
  });

  merge(project.files, {
    packages: {
      'nonstandard-workspaces-app': {
        'ember-cli-build.js': getEmberCliBuildSrc(true),
        'package.json': JSON.stringify(appPackageJson),
        tests: {
          unit: getTestFiles(
            'with-hooks-ns-workspace-test.js',
            'without-hooks-ns-workspace-test.js',
            'with-multiple-modules-ns-workspace-test.js'
          ),
        },
      },
    },
  });
}

function nonStandardWorkspaceClassicInRepoAddon(project) {
  nonStandardWorkspaceClassic(project);
  workspaceAddInRepoAddon(project, { name: 'fake-addon' });
}

function nonStandardWorkspaceEmbroiderInRepoAddon(project) {
  nonStandardWorkspaceEmbroider(project);
  workspaceAddInRepoAddon(project, { name: 'fake-addon', isEmbroider: true });
}

function nonStandardWorkspaceApp() {
  // eslint-disable-next-line node/no-unpublished-require
  const dir = dirname(require.resolve('@babel-plugin-ember-test-metadata/nonstandard-workspaces-template/package.json'));
  return Project.fromDir(dir, { linkDeps: true })
}

Scenarios.fromProject(nonStandardWorkspaceApp)
  .expand({
    nonStandardWorkspaceClassic,
    nonStandardWorkspaceClassicInRepoAddon,
    nonStandardWorkspaceEmbroider,
    nonStandardWorkspaceEmbroiderInRepoAddon,
  })
  .map('app scenarios', (project) => {
    project.linkDependency('babel-plugin-ember-test-metadata', {
      baseDir: __dirname,
    });
  })
  .forEachScenario((scenario) => {
    const { name } = scenario;

    describe(name, () => {
      let app;

      beforeAll(async () => {
        app = await scenario.prepare();
      });

      it('runs tests', async () => {
        const { exitCode, output } = await app.execute('node ./node_modules/ember-cli/bin/ember test --test-port 0');

        if (name.includes('InRepoAddon')) {
          expect(output).toMatch(`# tests 6`);
          expect(output).toMatch(`# pass  6`);
        } else {
          expect(output).toMatch(`# tests 5`);
          expect(output).toMatch(`# pass  5`);
        }

        expect(exitCode).toEqual(0);
      });
    });
  });
