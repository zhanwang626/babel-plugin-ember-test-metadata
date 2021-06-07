/**
 * TODO:
 * - how to guard that this only operates on test files?
 * ✅ add this expression: let testMetadata = getTestMetadata(this);
 * ✅ add this expression: testMetadata.filePath = 'string/to/file/path.js';
 * - add logic to get the actual, current file path
 * - add logic to check if import already exists
 */

module.exports = function addMetadata ({
  types: t
}) {
  return {
    name: 'addMetadata',
    visitor: {
      Program (path) {
        const getTestMetaDataImportDefaultSpecifier = t.importDefaultSpecifier(t.identifier('{ getTestMetadata }'));
        const getTestMetaDataImportDeclaration = t.importDeclaration(
          [getTestMetaDataImportDefaultSpecifier],
          t.stringLiteral('@ember/test-helpers')
        );
        path.unshiftContainer('body', getTestMetaDataImportDeclaration);

        const lastImport = path.get("body").filter(p => p.isImportDeclaration()).pop();

        if (lastImport) {
          const testMetadataIdentifier = t.identifier('testMetadata');
          const getTestMetadataCall = t.callExpression(t.identifier('getTestMetadata'), [t.thisExpression()]);
          const testMetadataVarDeclaration = t.variableDeclaration(
            'let',
            [
              t.variableDeclarator(testMetadataIdentifier, getTestMetadataCall)
            ]
          );

          const filePathStr = t.stringLiteral('string/to/file/path.js');
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
