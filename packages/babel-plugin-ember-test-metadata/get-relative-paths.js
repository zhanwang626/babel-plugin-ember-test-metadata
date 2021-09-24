const path = require('path');

function _getRelativePathForClassic(preformattedPath, projectName) {
  const formattedPath = preformattedPath
    .slice(preformattedPath.lastIndexOf(projectName), preformattedPath.length)
    .replace(`${projectName}/`, '');

  return formattedPath;
}

function _getRelativePathForClassicInRepo(preformattedPath) {
  const pathSegments = preformattedPath.split(path.sep);

  return pathSegments
    .splice(pathSegments.indexOf('ember-add-in-repo-tests') + 1, pathSegments.length)
    .join(path.sep);
}

function _getRelativePathForEmbroider(preformattedPath) {
  const pathSegments = preformattedPath.split(path.sep);
  return pathSegments
    .splice(pathSegments.indexOf('embroider') + 2, pathSegments.length)
    .join(path.sep);
}

function _getRelativePathForEmbroiderInRepo(preformattedPath) {
  return _getRelativePathForClassicInRepo(preformattedPath);
}

module.exports = {
  _getRelativePathForClassic,
  _getRelativePathForClassicInRepo,
  _getRelativePathForEmbroider,
  _getRelativePathForEmbroiderInRepo,
};
