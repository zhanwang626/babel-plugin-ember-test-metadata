const { Scenarios, Project } = require('scenario-tester');
const { dirname, join } = require('path');
const { readJsonSync } = require('fs-extra');
const { merge } = require('lodash');
const { getFixtureFile, getTestFiles, EMBROIDER_DEPENDENCIES } = require('./helpers/utils');

jest.setTimeout(500000);

function workspaceClassic(project) {
  merge(project.files, {
    packages: {
      'workspaces-app': {
        'ember-cli-build.js': getFixtureFile('ember-cli-build-classic-workspace.js'),
        tests: {
          unit: getTestFiles(
            'with-hooks-workspace-test.js',
            'without-hooks-workspace-test.js',
            'with-multiple-modules-workspace-test.js'
          ),
        },
      },
    },
  });
}

function workspaceEmbroider(project) {
  const scenarioPackageJson = readJsonSync(join(__dirname, '..', 'package.json'));
  const appPackageJson = JSON.parse(project.files.packages['workspaces-app']['package.json']);

  EMBROIDER_DEPENDENCIES.forEach((dependency) => {
    project.linkDependency(dependency, {
      baseDir: __dirname,
    });
    appPackageJson.devDependencies[dependency] = scenarioPackageJson.devDependencies[dependency];
  });

  merge(project.files, {
    packages: {
      'workspaces-app': {
        'ember-cli-build.js': getFixtureFile('ember-cli-build-embroider-workspace.js'),
        'package.json': JSON.stringify(appPackageJson),
        tests: {
          unit: getTestFiles(
            'with-hooks-workspace-test.js',
            'without-hooks-workspace-test.js',
            'with-multiple-modules-workspace-test.js'
          ),
        },
      },
    },
  });
}

function workspaceAddInRepoAddon(project, { name, version = '0.0.0', isEmbroider = false }) {
  const emberCliBuildFileName = isEmbroider
    ? 'ember-cli-build-embroider-inrepo-workspace.js'
    : 'ember-cli-build-classic-inrepo-workspace.js';

  project.linkDependency('ember-add-in-repo-tests', {
    baseDir: __dirname,
  });

  const appPackageJson = JSON.parse(project.files.packages['workspaces-app']['package.json']);
  appPackageJson['ember-addon'] = {
    paths: [`../addons/${name}`],
  };

  merge(project.files, {
    packages: {
      'workspaces-app': {
        'ember-cli-build.js': getFixtureFile(emberCliBuildFileName),
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
                  packageName: 'workspaces-app',
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
            unit: getTestFiles('with-hooks-assert-includes-workspace-test.js'),
          },
        },
      },
    },
  });
}

function workspaceClassicInRepoAddon(project) {
  workspaceClassic(project);
  workspaceAddInRepoAddon(project, { name: 'fake-addon' });
}

function workspaceEmbroiderInRepoAddon(project) {
  workspaceEmbroider(project);
  workspaceAddInRepoAddon(project, { name: 'fake-addon', isEmbroider: true });
}

function workspacesApp() {
  // eslint-disable-next-line node/no-unpublished-require
  const dir = dirname(require.resolve('@babel-plugin-ember-test-metadata/workspaces-template/package.json'));
  return Project.fromDir(dir, { linkDeps: true });
}

Scenarios.fromProject(workspacesApp)
  .expand({
    workspaceClassic,
    workspaceClassicInRepoAddon,
    workspaceEmbroider,
    workspaceEmbroiderInRepoAddon,
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
          expect(output).toMatch('# tests 6');
          expect(output).toMatch('# pass  6');
        } else {
          expect(output).toMatch('# tests 5');
          expect(output).toMatch('# pass  5');
        }

        expect(exitCode).toEqual(0);
      });
    });
  });
