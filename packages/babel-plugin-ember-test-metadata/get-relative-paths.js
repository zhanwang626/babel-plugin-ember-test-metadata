const { basename, join, resolve, sep } = require('path');

function _getRelativeProjectPath(filePath, projectDir, projectRoot) {
  const pathSegments = filePath.split(sep);
  const appRoot = pathSegments.slice(0, pathSegments.indexOf(projectDir) + 1);
  const projectBaseDir = basename(resolve(appRoot.join(sep), projectRoot));

  return appRoot.slice(appRoot.indexOf(projectBaseDir) + 1).join(sep);
}

function _getRelativePathForClassic(filePath, packageName, projectRoot) {
  const projectDir = basename(packageName);
  const pathSegments = filePath.split(sep);
  const testFilePath = pathSegments
    .slice(pathSegments.lastIndexOf(projectDir) + 1)
    .join(sep);

  if (!projectRoot) {
    return testFilePath;
  }

  const projectPath = _getRelativeProjectPath(filePath, projectDir, projectRoot);
  return join(projectPath, testFilePath);
}

function _getRelativePathForClassicInRepo(filePath) {
  const pathSegments = filePath.split(sep);
  return pathSegments
    .slice(pathSegments.indexOf('ember-add-in-repo-tests') + 1)
    .join(sep);
}

function _getRelativePathForEmbroider(filePath, packageName, projectRoot) {
  const pathSegments = filePath.split(sep);
  const testFilePath = pathSegments
    .slice(pathSegments.indexOf('embroider') + 2)
    .join(sep);

  if (!projectRoot) {
    return testFilePath;
  }

  const projectDir = _getRelativeProjectPath(filePath, basename(packageName), projectRoot);
  return testFilePath.slice(testFilePath.indexOf(projectDir));
}

function _getRelativePathForEmbroiderInRepo(filePath) {
  return _getRelativePathForClassicInRepo(filePath);
}

module.exports = {
  _getRelativePathForClassic,
  _getRelativePathForClassicInRepo,
  _getRelativePathForEmbroider,
  _getRelativePathForEmbroiderInRepo,
};
