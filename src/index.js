/**
 * TODO:
 * - add this expression: let testMetadata = getTestMetadata(this);
 * - add this expression: testMetadata.filePath = 'string/to/file/path.js';
 * - add logic to get the actual, current file path
 * - add logic to check if import already exists
 */

module.exports = function addMetadata ({
  types: t
}) {
  return {
    name: 'addMetadata',
    visitor: {
      Program (path, state) {
        const identifier = t.identifier('{getTestMetadata}');
        const importDefaultSpecifier = t.importDefaultSpecifier(identifier);
        const importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral('@ember/test-helpers'));
        path.unshiftContainer('body', importDeclaration);
      }
    }
  };
}
