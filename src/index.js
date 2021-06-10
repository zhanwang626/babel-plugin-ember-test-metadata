const path = require('path');
/**
 * TODO:
 * - Fix: new beforeEach is only partial body because it requires Statement only
 * - how to guard that this only operates on test files?
 * - unit test smaller functions
 */

function getFilePath(file) {
  const filePath = file.file.opts.filename;
  const root = file.file.opts.root;
  return path.relative(root, filePath);
}

function writeTestMetadataExpressions(file, node, types) {
  const testMetadataVarDeclaration = getTestMetadataDeclaration(types);

  const relativeFilePath = getFilePath(file);
  const filePathStr = types.stringLiteral(relativeFilePath);
  const testMetadataAssignment = types.assignmentPattern(
    types.memberExpression(types.identifier('testMetadata'), types.identifier('filePath')),
    filePathStr
  );

  node.arguments[0].body.body.unshift(testMetadataAssignment);
  node.arguments[0].body.body.unshift(testMetadataVarDeclaration);
}

function getTestMetadataDeclaration(types) {
  const getTestMetadataCall = types.callExpression(types.identifier('getTestMetadata'), [types.thisExpression()]);
  return types.variableDeclaration(
    'let',
    [ types.variableDeclarator(types.identifier('testMetadata'), getTestMetadataCall) ]
  );
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
      Program (babelPath) {
        const EMBER_TEST_HELPERS = '@ember/test-helpers';
        const GET_TEST_METADATA ='getTestMetadata';
        let imports = collectImports(babelPath.node);
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
          babelPath.unshiftContainer('body', getTestMetaDataImportDeclaration);
        }
      },

      CallExpression(babelPath) {
        // reset at top-level module
        if (babelPath.scope.block.type === 'Program') beforeEachModified = false;

        if (!beforeEachModified) {
          const BEFORE_EACH = 'beforeEach';
          const testCalls = ['test', 'skip', 'todo', 'module'];
          let hasBeforeEach = babelPath.node.callee && babelPath.node.callee.name === BEFORE_EACH;
          let hasHooksBeforeEach = babelPath.node.callee.property && babelPath.node.callee.property.name === BEFORE_EACH;


          if (hasBeforeEach || hasHooksBeforeEach) {
            writeTestMetadataExpressions(this, babelPath.node, t);
            beforeEachModified = true;
          } else if (
            testCalls.includes(babelPath.node.callee.name) &&
            babelPath.scope.path.parentPath &&
            babelPath.scope.path.parentPath.node.callee.name === 'module'
          ) {
            const testMetadataVarDeclaration = getTestMetadataDeclaration(t)
            const beforeEachCallback = t.functionExpression(
              null,
              [],
              t.blockStatement([testMetadataVarDeclaration])
            );
            const beforeEachCall = t.callExpression(t.identifier('beforeEach'), [beforeEachCallback]);
            babelPath.insertBefore(beforeEachCall);

            beforeEachModified = true;
          }
        }
      }
    }
  };
}
