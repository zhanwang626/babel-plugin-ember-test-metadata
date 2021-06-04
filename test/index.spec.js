const pluginTester = require('babel-plugin-tester').default;
const logger = require('../src/index');
const path = require('path');

pluginTester({
  plugin: logger,
  pluginName: 'logger',
  snapshot: true,
  tests: [
    {
      title: 'changes this code',
      // input to the plugin
      fixture: path.join(__dirname, '__fixtures__/logger', 'code.js'),
      // expected output
      // outputFixture: path.join(__dirname, '__fixtures__/logger', 'output.js'),
    },
  ]
})
