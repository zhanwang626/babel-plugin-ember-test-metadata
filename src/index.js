const path = require('path');
/**
 * TODO:
 * - how to guard that this only operates on test files?
 * - how to first check if @ember/test-helpers dependency is installed?
 * ✅ add a 'getTestMetadata' import statement
 * ✅ add this expression: let testMetadata = getTestMetadata(this);
 * ✅ add this expression: testMetadata.filePath = 'string/to/file/path.js';
 * ✅ add logic to get the actual, current file path
 * - refactor to insert expressions in beforeEach; and logic to handle if beforeEach exists or not
 * - add logic to check if test-helpers import statement already exists
 * - clean up, break out smaller functions
 * - break out tests. Test more cases.
 */

module.exports = function addMetadata ({
  types: t
}) {
  return {
    name: 'addMetadata',
    visitor: {
      Program (babelPath) {
        const filePath = this.file.opts.filename;
        const root = this.file.opts.root;
        const relativeFilePath = path.relative(root, filePath);

        const getTestMetaDataImportDefaultSpecifier = t.importDefaultSpecifier(t.identifier('{ getTestMetadata }'));
        const getTestMetaDataImportDeclaration = t.importDeclaration(
          [getTestMetaDataImportDefaultSpecifier],
          t.stringLiteral('@ember/test-helpers')
        );
        babelPath.unshiftContainer('body', getTestMetaDataImportDeclaration);

        const lastImport = babelPath.get("body").filter(p => p.isImportDeclaration()).pop();

        if (lastImport) {
          const testMetadataIdentifier = t.identifier('testMetadata');
          const getTestMetadataCall = t.callExpression(t.identifier('getTestMetadata'), [t.thisExpression()]);
          const testMetadataVarDeclaration = t.variableDeclaration(
            'let',
            [
              t.variableDeclarator(testMetadataIdentifier, getTestMetadataCall)
            ]
          );

          const filePathStr = t.stringLiteral(relativeFilePath);
          const testMetadataAssignment = t.assignmentPattern(
            t.memberExpression(testMetadataIdentifier, t.identifier('filePath')),
            filePathStr
          );

          lastImport.insertAfter(testMetadataAssignment);
          lastImport.insertAfter(testMetadataVarDeclaration);
        }
      }
    }
  };
}
