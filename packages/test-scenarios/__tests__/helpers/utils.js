const { readFileSync } = require('fs');
const { join } = require('path');

const EMBROIDER_DEPENDENCIES = [
  '@embroider/compat',
  '@embroider/core',
  '@embroider/webpack',
  'webpack',
];

function getTestFiles(...files) {
  return files.reduce((testFiles, name) => {
    testFiles[name] = readFileSync(join(__dirname, '..', '__fixtures__', name), { encoding: 'utf-8' });
    return testFiles;
  }, {});
}

module.exports = {
  EMBROIDER_DEPENDENCIES,
  getTestFiles,
};
