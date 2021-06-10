const path = require('path');
/**
 * TODO:
 * - how to guard that this only operates on test files?
 * - add tests and logic to handle if beforeEach exists or not
 * - unit test smaller functions
 */

function getFilePath(file) {
  const filePath = file.file.opts.filename;
  const root = file.file.opts.root;
  return path.relative(root, filePath);
}

function writeTestMetadataExpressions(file, node, types) {
  const testMetadataIdentifier = types.identifier('testMetadata');
  const getTestMetadataCall = types.callExpression(types.identifier('getTestMetadata'), [types.thisExpression()]);
  const testMetadataVarDeclaration = types.variableDeclaration(
    'let',
    [ types.variableDeclarator(testMetadataIdentifier, getTestMetadataCall) ]
  );

  const relativeFilePath = getFilePath(file);
  const filePathStr = types.stringLiteral(relativeFilePath);
  const testMetadataAssignment = types.assignmentPattern(
    types.memberExpression(testMetadataIdentifier, types.identifier('filePath')),
    filePathStr
  );

  node.arguments[0].body.body.unshift(testMetadataAssignment);
  node.arguments[0].body.body.unshift(testMetadataVarDeclaration);
}

function collectImports(node) {
  return node.body.filter((maybeImport) => {
    return maybeImport.type === 'ImportDeclaration';
  });
}

export function addMetadata ({
  types: t
}) {
  let importExists = false;
  let beforeEachModified = false;

  return {
    name: 'addMetadata',
    visitor: {
      Program (path) {
        const EMBER_TEST_HELPERS = '@ember/test-helpers';
        const GET_TEST_METADATA ='getTestMetadata';
        let imports = collectImports(path.node);
        let emberTestHelpers = imports.filter((imp) => imp.source.value === EMBER_TEST_HELPERS);

        importExists = emberTestHelpers !== undefined && emberTestHelpers.length;

        if (importExists) {
          emberTestHelpers[0].specifiers.push(t.identifier(GET_TEST_METADATA));
        } else {
          const getTestMetaDataImportDefaultSpecifier = t.importDefaultSpecifier(t.identifier(`{ ${GET_TEST_METADATA} }`));
          const getTestMetaDataImportDeclaration = t.importDeclaration(
            [getTestMetaDataImportDefaultSpecifier],
            t.stringLiteral(EMBER_TEST_HELPERS)
          );
          path.unshiftContainer('body', getTestMetaDataImportDeclaration);
        }
      },

      CallExpression({ node }) {
        const BEFORE_EACH = 'beforeEach';
        let hasBeforeEach = node.callee && node.callee.name === BEFORE_EACH;
        let hasHooksBeforeEach = node.callee.property && node.callee.property.name === BEFORE_EACH;

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
