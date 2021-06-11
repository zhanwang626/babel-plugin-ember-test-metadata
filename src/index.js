const path = require('path');

function getFilePath(file) {
  const filePath = file.file.opts.filename;
  const root = file.file.opts.root;
  return path.relative(root, filePath);
}

function writeTestMetadataExpressions(file, node, types) {
  const testMetadataVarDeclaration = getTestMetadataDeclaration(types);
  const testMetadataAssignment = getTestMetadataAssignment(file, types);

  node.arguments[0].body.body.unshift(testMetadataAssignment);
  node.arguments[0].body.body.unshift(testMetadataVarDeclaration);
}

function getTestMetadataAssignment(file, types) {
  const relativeFilePath = getFilePath(file);
  const filePathStr = types.stringLiteral(relativeFilePath);
  return types.assignmentPattern(
    types.memberExpression(types.identifier("testMetadata"), types.identifier("filePath")),
    filePathStr
  );
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
          const getTestMetaDataImportSpecifier = t.importSpecifier(t.identifier(GET_TEST_METADATA), t.identifier(GET_TEST_METADATA));
          const getTestMetaDataImportDeclaration = t.importDeclaration(
            [getTestMetaDataImportSpecifier],
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
          const testCallName = babelPath.node.callee.name || babelPath.node.callee.object.name;
          const hasBeforeEach = babelPath.node.callee && babelPath.node.callee.name === BEFORE_EACH;
          const hasHooksBeforeEach = babelPath.node.callee.property && babelPath.node.callee.property.name === BEFORE_EACH;

          if (hasBeforeEach || hasHooksBeforeEach) {
            writeTestMetadataExpressions(this, babelPath.node, t);
            beforeEachModified = true;
          } else if (
            testCalls.includes(testCallName) &&
            babelPath.scope.path.parentPath &&
            babelPath.scope.path.parentPath.node.callee.name === 'module'
          ) {
            const testMetadataVarDeclaration = getTestMetadataDeclaration(t)
            const beforeEachFunc = t.functionExpression(
              null,
              [],
              t.blockStatement([testMetadataVarDeclaration])
            );
            const beforeEachCall = t.callExpression(t.identifier(BEFORE_EACH), [beforeEachFunc]);
            const testMetadataAssignment = getTestMetadataAssignment(this, t);

            babelPath.insertBefore(beforeEachCall);
            beforeEachFunc.body.body.push(testMetadataAssignment);

            beforeEachModified = true;
          }
        }
      }
    }
  };
}
