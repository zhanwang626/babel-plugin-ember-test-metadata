'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { addInRepoTestsToHost } = require('ember-add-in-repo-tests');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      plugins: [
        [
          require.resolve('babel-plugin-ember-test-metadata'),
          {
            enabled: true,
            packageName: defaults.project.pkg.name,
            isUsingEmbroider: true,
          },
        ],
      ],
    },
    trees: {
      tests: addInRepoTestsToHost({
        project: defaults.project,
        shouldIncludeTestsInHost: () => true,
      }),
    },
  });

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    packagerOptions: {
      threadLoaderOptions: false,
    },
  });
}
