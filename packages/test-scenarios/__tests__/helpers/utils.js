const { readFileSync } = require('fs-extra');
const { join } = require('path');

const EMBROIDER_DEPENDENCIES = [
  '@embroider/compat',
  '@embroider/core',
  '@embroider/webpack',
  'webpack',
];

function getFixtureFile(name) {
  return readFileSync(join(__dirname, '..', '__fixtures__', name), { encoding: 'utf-8' });
}

function getTestFiles(...files) {
  return files.reduce((fixtureFiles, name) => {
    fixtureFiles[name] = getFixtureFile(name);
    return fixtureFiles;
  }, {});
}

module.exports = {
  EMBROIDER_DEPENDENCIES,
  getFixtureFile,
  getTestFiles,
};
