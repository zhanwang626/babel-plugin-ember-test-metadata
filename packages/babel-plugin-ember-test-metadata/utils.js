const path = require('path');

/**
 * Utility to get a property from a given path
 * @param {object} node
 * @param {string} path
 * @returns property value
 */
function getNodeProperty(node, path) {
  if (!node) {
    return;
  }

  let parts;
  if (typeof path === 'string') {
    parts = path.split('.');
  } else {
    parts = path;
  }

  if (parts.length === 1) {
    return node[path];
  }

  let property = node[parts[0]];

  if (property && parts.length > 1) {
    parts.shift();
    return getNodeProperty(property, parts);
  }

  return property;
}

/**
 * Function to parse defaults.project and only return info to be used by the plugin
 * @param {object} project Ember defaults.project
 * @param {string} project.pkg - The package of the parent project.
 * @param {string} project.pkg.name - The name of the parent project.
 * @param {object} project.pkg['ember-addon'] - Ember-addon info.
 * @param {array} project.pkg['ember-addon'].paths - Ember-addon path strings.
 * @returns {object} Contains project name and ember-addon path info
 */
function getProjectConfiguration(project) {
  const parsedProjectConfiguration = {};

  if (project) {
    parsedProjectConfiguration.pkg = {
      name: project.pkg.name,
      'ember-addon': {
        paths: project.pkg['ember-addon'].paths,
      },
    };
  }

  return parsedProjectConfiguration;
}

function _addonFound(filename, projectConfiguration) {
  const pathSegments = filename.split(path.sep);
  const addonPaths = projectConfiguration.pkg['ember-addon'].paths;

  if (!addonPaths) {
    return;
  }

  const addonNames = addonPaths.map((path) => path.replace('lib/', ''));

  return pathSegments.find((addonName) => addonNames.includes(addonName));
}

function _getParsedAddonPathSegments(pathSegments, addonName) {
  const RELATIVE_ADDON_PATH_ROOT = 1;

  pathSegments[0] = 'lib';
  pathSegments.splice(pathSegments.lastIndexOf(addonName) + RELATIVE_ADDON_PATH_ROOT, 0, 'tests');

  return pathSegments;
}

function _getParsedClassicFilepath(pathSegments, projectConfiguration) {
  const projectNamePathSeparators = projectConfiguration.pkg.name.split(path.sep);
  const addonName = _addonFound(pathSegments, projectConfiguration);

  pathSegments.splice(
    0,
    pathSegments.indexOf(projectNamePathSeparators[0]) + projectNamePathSeparators.length
  );

  if (addonName) {
    pathSegments = _getParsedAddonPathSegments(pathSegments, addonName);
  }

  return pathSegments.join(path.sep);
}

/**
 * Get a normalized file path, based on whether the app build is classic or with Embroider
 * @param {object} fileOpts Babel state.file.opts which include root and filename props
 * @param {object} projectConfiguration Contains project name, ember-addon path info
 * @returns {string} E.g. tests/acceptance/my-test.js
 */
function getNormalizedFilePath({ root, filename }, projectConfiguration) {
  const pathSegments = {
    projectPathPrefix: projectConfiguration.pkg.name,
    basePath: path.parse(root).dir,
    basePathWithTmp: path.join(path.parse(root).dir, path.parse(root).base),
  };
  const embroiderRegex = new RegExp(`embroider(${path.sep})(.{6})`);
  const embroiderPrefix = filename.match(embroiderRegex);
  const addonFound = _addonFound(filename, projectConfiguration);

  if (embroiderPrefix) {
    let embroiderBasePath = path.join(pathSegments.basePath, embroiderPrefix[0]);

    if (filename.includes(pathSegments.basePathWithTmp)) {
      embroiderBasePath = path.join(embroiderBasePath, pathSegments.basePathWithTmp);
    }

    return path.relative(embroiderBasePath, filename);
  }

  if (addonFound) {
    const basePathWithProjectPrefix = path.join(pathSegments.basePathWithTmp, pathSegments.projectPathPrefix);
    const baseAddonPath = path.join(basePathWithProjectPrefix, 'tests', addonFound);
    const targetAddonPath = path.join(basePathWithProjectPrefix, 'lib', addonFound, 'tests');
    const parsedAddonPath = filename.replace(baseAddonPath, targetAddonPath);

    return parsedAddonPath.replace(basePathWithProjectPrefix + path.sep, '');
  }

  return path.relative(path.join(root, pathSegments.projectPathPrefix), filename);
}

module.exports = {
  getNodeProperty,
  getNormalizedFilePath,
  getProjectConfiguration,
  _getParsedClassicFilepath,
};
