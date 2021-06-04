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
