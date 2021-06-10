const pluginTester = require('babel-plugin-tester').default;
const { addMetadata } = require('../src/index');
const path = require('path');

pluginTester({
  plugin: addMetadata,
  pluginName: 'addMetadata',
  tests: [
    {
      title: 'for a single beforeEach in a single module, it adds a new import and getTestMetadata statements',
      fixture: path.join(__dirname, '__fixtures__/', 'one-module-one-beforeeach-new-import-code.js'),
      outputFixture: path.join(__dirname, '__fixtures__/', 'one-module-one-beforeeach-new-import-output.js'),
    },
    {
      title: 'for a single hooks.beforeEach in a single module, it adds a new import and getTestMetadata statements',
      fixture: path.join(__dirname, '__fixtures__/', 'one-module-one-hooks-beforeeach-new-import-code.js'),
      outputFixture: path.join(__dirname, '__fixtures__/', 'one-module-one-hooks-beforeeach-new-import-output.js'),
    },
    {
      title: 'for beforeEach in multiple modules, it adds a new import and multiple getTestMetadata statements',
      fixture: path.join(__dirname, '__fixtures__/', 'multiple-module-one-beforeeach-new-import-code.js'),
      outputFixture: path.join(__dirname, '__fixtures__/', 'multiple-module-one-beforeeach-new-import-output.js'),
    },
    {
      title: 'for hooks.beforeEach in multiple modules, it adds a new import and multiple getTestMetadata statements',
      fixture: path.join(__dirname, '__fixtures__/', 'multiple-module-one-hooks-beforeeach-new-import-code.js'),
      outputFixture: path.join(__dirname, '__fixtures__/', 'multiple-module-one-hooks-beforeeach-new-import-output.js'),
    },
    {
      title: 'for a module that already imports from @ember/test-helpers, it adds getTestMetadata to the import',
      fixture: path.join(__dirname, '__fixtures__/', 'one-module-one-beforeeach-import-exists-code.js'),
      outputFixture: path.join(__dirname, '__fixtures__/', 'one-module-one-beforeeach-import-exists-output.js'),
    },
  ]
})
