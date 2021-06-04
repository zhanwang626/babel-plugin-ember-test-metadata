const pluginTester = require('babel-plugin-tester').default;
const addMetadata = require('../src/index');
const path = require('path');

pluginTester({
  plugin: addMetadata,
  pluginName: 'addMetadata',
  // snapshot: true,
  tests: [
    {
      title: 'adds import statement for getTestMetadata',
      fixture: path.join(__dirname, '__fixtures__/test-metadata', 'code.js'),
      outputFixture: path.join(__dirname, '__fixtures__/test-metadata', 'output.js'),
    },
  ]
})
