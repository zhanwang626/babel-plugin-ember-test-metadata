const { Scenarios, Project } = require('scenario-tester');
const { dirname } = require('path');
const { merge } = require('lodash');
const { getFixtureFile, getTestFiles, EMBROIDER_DEPENDENCIES } = require('./helpers/utils');

jest.setTimeout(500000);

function classic(project) {
  merge(project.files, {
    'ember-cli-build.js': getFixtureFile('ember-cli-build-classic.js'),
    tests: {
      unit: getTestFiles(
        'with-hooks-test.js',
        'without-hooks-test.js',
        'with-multiple-modules-test.js'
      ),
    },
  });
}

function embroider(project) {
  EMBROIDER_DEPENDENCIES.forEach((dependency) => {
    project.linkDependency(dependency, {
      baseDir: __dirname,
    });
  });

  merge(project.files, {
    'ember-cli-build.js': getFixtureFile('ember-cli-build-embroider.js'),
    tests: {
      unit: getTestFiles(
        'with-hooks-test.js',
        'without-hooks-test.js',
        'with-multiple-modules-test.js'
      ),
    },
  });
}

function addInRepoAddon(project, { name, version = '0.0.0', isEmbroider = false }) {
  const emberCliBuildFileName = isEmbroider
    ? 'ember-cli-build-embroider-inrepo.js'
    : 'ember-cli-build-classic-inrepo.js';

  project.linkDependency('ember-add-in-repo-tests', {
    baseDir: __dirname,
  });

  project.pkg['ember-addon'] = {
    paths: [`lib/${name}`],
  };

  merge(project.files, {
    'ember-cli-build.js': getFixtureFile(emberCliBuildFileName),
    lib: {
      [name]: {
        'package.json': `{
          "name": "${name}",
          "version": "${version}",
          "keywords": ["ember-addon"]
        }`,
        'index.js': `module.exports = {
          name: require('./package').name,
          babel: [
            [
              require.resolve('babel-plugin-ember-test-metadata'),
              {
                enabled: true,
                packageName: '${project.pkg.name}',
              },
            ],
          ],
        };`,
        tests: {
          unit: getTestFiles('with-hooks-assert-includes-test.js'),
        },
      },
    },
  });
}

function classicInRepoAddon(project) {
  classic(project);
  addInRepoAddon(project, { name: 'fake-addon' });
}

function embroiderInRepoAddon(project) {
  embroider(project);
  addInRepoAddon(project, { name: 'fake-addon', isEmbroider: true });
}

function baseApp() {
  // eslint-disable-next-line node/no-unpublished-require
  const dir = dirname(require.resolve('@babel-plugin-ember-test-metadata/app-template/package.json'));
  return Project.fromDir(dir, { linkDevDeps: true });
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
  })
  .forEachScenario((scenario) => {
    const { name } = scenario;

    describe(scenario.name, () => {
      let app;

      beforeAll(async () => {
        app = await scenario.prepare();
      });

      it('runs tests', async () => {
        const { exitCode, output } = await app.execute('node ./node_modules/ember-cli/bin/ember test  --test-port 0');

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
