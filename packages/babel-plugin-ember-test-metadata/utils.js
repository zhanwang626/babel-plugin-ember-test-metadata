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

function _getClassicPath(preformattedPath, projectName) {
  const formattedPath = preformattedPath
    .slice(preformattedPath.lastIndexOf(projectName), preformattedPath.length)
    .replace(`${projectName}/`, '');

  return formattedPath;
}

function _getClassicPathWithAddon(preformattedPath, projectName, addons) {
  const pathSegments = preformattedPath.split(path.sep);
  const addonNames = addons.paths.map(addonPath => addonPath.split(path.sep)[1]);
  const addonName = addonNames.find(name => pathSegments.includes(name));

  if (pathSegments.includes(addonName)) {
    pathSegments.splice(0, pathSegments.indexOf("ember-add-in-repo-tests") + 1);
    return [...pathSegments].join(path.sep)
  } else {
    return _getClassicPath(preformattedPath, projectName);
  }
}

const RELATIVE_PATH_ROOT = 2;

function _getEmbroiderPath(pathSegments) {
  pathSegments.splice(0, pathSegments.lastIndexOf('embroider') + RELATIVE_PATH_ROOT);
  return pathSegments.join(path.sep);
}

function _getEmbroiderPathWithAddon(pathSegments, addons) {
  const addonNames = addons.paths.map(addonPath => addonPath.split(path.sep)[1]);
  const addonName = addonNames.find(name => pathSegments.includes(name));

  if (pathSegments.includes(addonName)) {
    pathSegments.splice(0, pathSegments.lastIndexOf(addonName) + 1);
    return `lib/${addonName}/tests/${pathSegments.join('/')}`;
  } else {
    return _getEmbroiderPath(pathSegments);
  }
}

/**
 * Get a normalized file path, based on whether the app build is classic or with Embroider
 * @param {object} fileOpts Babel state.file.opts which include root and filename props
 * @param {object} projectConfiguration Contains project name, ember-addon path info
 * @returns {string} E.g. tests/acceptance/my-test.js
 */
function getNormalizedFilePath(fileOpts, projectConfiguration) {
  let { filename } = fileOpts;
  const pathSegments = filename.split(path.sep);
  const isEmbroider = pathSegments.includes('embroider');
  const addons = projectConfiguration.pkg["ember-addon"];
  const hasAddons = addons && addons.paths;
  const projectName = projectConfiguration.pkg.name;

  if (!isEmbroider && !hasAddons) {
    return _getClassicPath(filename, projectName);
  } else if (!isEmbroider && hasAddons) {
    return _getClassicPathWithAddon(filename, projectName, addons);
  } else if (isEmbroider && !hasAddons) {
    return _getEmbroiderPath(pathSegments);
  } else if (isEmbroider && hasAddons) {
    return _getEmbroiderPathWithAddon(pathSegments, addons);
  }
}

module.exports = {
  getNodeProperty,
  getNormalizedFilePath,
  getProjectConfiguration,
};
