const pluginTester = require('babel-plugin-tester').default;
const addMetadata = require('../src/index');
const path = require('path');

pluginTester({
  plugin: addMetadata,
  pluginName: 'addMetadata',
  tests: [
    {
      title: 'changes this code',
      fixture: path.join(__dirname, '__fixtures__/logger', 'code.js'),
      outputFixture: path.join(__dirname, '__fixtures__/logger', 'output.js'),
    },
  ]
})
