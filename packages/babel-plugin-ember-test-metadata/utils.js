const path = require('path');

const EMBROIDER_REGEX = new RegExp(`embroider(${path.sep})(.{6})`);

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

function getAddonName(filename, projectConfiguration) {
  const pathSegments = filename.split(path.sep);
  const addonPaths = projectConfiguration.pkg['ember-addon'].paths;

  if (!addonPaths) {
    return;
  }

  const addonNames = addonPaths.map((path) => path.replace('lib/', ''));

  return pathSegments.find((addonName) => addonNames.includes(addonName));
}

/**
 * Get a normalized file path, based on whether the app build is classic or with Embroider
 * @param {object} {root, filename} Babel state.file.opts root & filename
 * @param {object} projectConfiguration Contains project name, ember-addon path info
 * @returns {string} E.g. tests/acceptance/my-test.js
 */
function getNormalizedFilePath({ root, filename }, projectConfiguration) {
  const projectPathPrefix = projectConfiguration.pkg.name;
  const rootDirWithBase = path.join(path.parse(root).dir, path.parse(root).base);
  const embroiderSegment = filename.match(EMBROIDER_REGEX);
  const addonName = getAddonName(filename, projectConfiguration);

  if (embroiderSegment) {
    const embroiderSegmentIndex = filename.search(EMBROIDER_REGEX);
    let embroiderPath = filename.substring(embroiderSegmentIndex);

    if (filename.includes(rootDirWithBase)) {
      embroiderPath = embroiderPath.replace(rootDirWithBase, '');
    }
    embroiderPath = embroiderPath.replace(embroiderSegment[0] + path.sep, '');

    return embroiderPath;
  }

  if (addonName) {
    const rootDirBaseWithProjectPrefix = path.join(rootDirWithBase, projectPathPrefix);
    const sourceAddonPath = path.join(rootDirBaseWithProjectPrefix, 'tests', addonName);
    const targetAddonPath = path.join(rootDirBaseWithProjectPrefix, 'lib', addonName, 'tests');
    const parsedAddonPath = filename.replace(sourceAddonPath, targetAddonPath);

    return parsedAddonPath.replace(rootDirBaseWithProjectPrefix + path.sep, '');
  }

  if (!root.includes(projectPathPrefix)) {
    root = path.join(root, projectPathPrefix);
  }

  return path.relative(root, filename);
}

module.exports = {
  getNodeProperty,
  getNormalizedFilePath,
  getProjectConfiguration,
};
