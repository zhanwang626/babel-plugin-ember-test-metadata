const path = require('path');
/**
 * TODO:
 * - how to guard that this only operates on test files?
 * - how to first check if @ember/test-helpers dependency is installed?
 * ✅ add a 'getTestMetadata' import statement
 * ✅ add this expression: let testMetadata = getTestMetadata(this);
 * ✅ add this expression: testMetadata.filePath = 'string/to/file/path.js';
 * ✅ add logic to get the actual, current file path
 * ✅ refactor to insert expressions in beforeEach
 * - add tests and logic to handle if beforeEach exists or not
 * - add tests and logic to check if test-helpers import statement already exists
 * - Break out to smaller functions and test. Break out original single test.
 */

module.exports = function addMetadata ({
  types: t
}) {
  return {
    name: 'addMetadata',
    visitor: {
      Program (babelPath) {
        const getTestMetaDataImportDefaultSpecifier = t.importDefaultSpecifier(t.identifier('{ getTestMetadata }'));
        const getTestMetaDataImportDeclaration = t.importDeclaration(
          [getTestMetaDataImportDefaultSpecifier],
          t.stringLiteral('@ember/test-helpers')
        );
        babelPath.unshiftContainer('body', getTestMetaDataImportDeclaration);
      },
      CallExpression(babelPath) {
        const filePath = this.file.opts.filename;
        const root = this.file.opts.root;
        const relativeFilePath = path.relative(root, filePath);

        if (babelPath.node.callee.name === "module") {
          babelPath.traverse({
            FunctionExpression(babelPath) {
              if (babelPath.parent
                && t.isMemberExpression(babelPath.parent.callee)
                && babelPath.parent.callee.property.name === "beforeEach") {
                const testMetadataIdentifier = t.identifier("testMetadata");
                const getTestMetadataCall = t.callExpression(t.identifier("getTestMetadata"), [t.thisExpression()]);
                const testMetadataVarDeclaration = t.variableDeclaration("let", [t.variableDeclarator(testMetadataIdentifier, getTestMetadataCall)]);

                const filePathStr = t.stringLiteral(relativeFilePath);
                const testMetadataAssignment = t.assignmentPattern(t.memberExpression(testMetadataIdentifier, t.identifier("filePath")), filePathStr);

                babelPath.get("body").unshiftContainer("body", testMetadataAssignment);
                babelPath.get("body").unshiftContainer("body", testMetadataVarDeclaration);
              }
            }
          });
        }
      }
    }
  };
}
