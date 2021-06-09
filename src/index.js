const path = require('path');
/**
 * TODO:
 * - how to guard that this only operates on test files?
 * - add tests and logic to handle if beforeEach exists or not
 * - add tests and logic to check if test-helpers import statement already exists
 * - Break out to smaller functions and test. Break out original single test.
 */

function getFilePath(file) {
  const filePath = file.file.opts.filename;
  const root = file.file.opts.root;
  return path.relative(root, filePath);
}

function writeTestMetadataExpressions(file, node, template) {
  const testMetadataIdentifier = template.identifier('testMetadata');
  const getTestMetadataCall = template.callExpression(template.identifier('getTestMetadata'), [template.thisExpression()]);
  const testMetadataVarDeclaration = template.variableDeclaration(
    'let',
    [ template.variableDeclarator(testMetadataIdentifier, getTestMetadataCall) ]
  );

  const relativeFilePath = getFilePath(file);
  const filePathStr = template.stringLiteral(relativeFilePath);
  const testMetadataAssignment = template.assignmentPattern(
    template.memberExpression(testMetadataIdentifier, template.identifier('filePath')),
    filePathStr
  );

  node.arguments[0].body.body.unshift(testMetadataAssignment);
  node.arguments[0].body.body.unshift(testMetadataVarDeclaration);
}

export function addMetadata ({
  types: t
}) {
  let beforeEachModified = false;

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

      CallExpression({ node }) {
        let hasBeforeEach = node.callee && node.callee.name === 'beforeEach';
        let hasHooksBeforeEach = node.callee.property && node.callee.property.name === "beforeEach";

        if (hasBeforeEach || hasHooksBeforeEach) {
          writeTestMetadataExpressions(this, node, t);
          beforeEachModified = true;
        } else {
          // add new beforeEach with testMetadata
          beforeEachModified = true;
        }
      }
    }
  };
}
