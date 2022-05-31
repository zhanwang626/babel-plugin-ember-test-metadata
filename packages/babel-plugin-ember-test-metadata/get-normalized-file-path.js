const { join, parse } = require('path');
const {
  _getRelativePathForClassic,
  _getRelativePathForClassicInRepo,
  _getRelativePathForEmbroider,
  _getRelativePathForEmbroiderInRepo,
} = require('./get-relative-paths');

/**
 * Get a normalized file path, based on whether the app build is classic or with Embroider
 * @param {object} opts Babel state.file.opts which include root and filename props
 * @returns {string} E.g. tests/acceptance/my-test.js
 */
function getNormalizedFilePath({ packageName, isUsingEmbroider, projectRoot, filename, root }) {
  if (!isUsingEmbroider) {
    if (filename.includes('ember-add-in-repo-tests')) {
      return _getRelativePathForClassicInRepo(filename);
    }

    return _getRelativePathForClassic(filename, packageName, projectRoot);
  } else {
    const { dir, base } = parse(root);
    const rootDirWithBase = join(dir, base);

    if (!projectRoot && filename.includes(rootDirWithBase)) {
      filename = filename.replace(rootDirWithBase, '');
    }

    if (filename.includes('ember-add-in-repo-tests')) {
      return _getRelativePathForEmbroiderInRepo(filename);
    }

    return _getRelativePathForEmbroider(filename, packageName, projectRoot);
  }
}

module.exports = {
  getNormalizedFilePath,
};
