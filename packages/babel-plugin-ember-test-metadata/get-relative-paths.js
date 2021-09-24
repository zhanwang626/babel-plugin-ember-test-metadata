const path = require('path');

function _getRelativePathForClassic(filePath, projectName) {
  const formattedPath = filePath
    .slice(filePath.lastIndexOf(projectName), filePath.length)
    .replace(`${projectName}/`, '');

  return formattedPath;
}

function _getRelativePathForClassicInRepo(filePath) {
  const pathSegments = filePath.split(path.sep);

  return pathSegments
    .splice(pathSegments.indexOf('ember-add-in-repo-tests') + 1, pathSegments.length)
    .join(path.sep);
}

function _getRelativePathForEmbroider(filePath) {
  const pathSegments = filePath.split(path.sep);
  return pathSegments
    .splice(pathSegments.indexOf('embroider') + 2, pathSegments.length)
    .join(path.sep);
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
