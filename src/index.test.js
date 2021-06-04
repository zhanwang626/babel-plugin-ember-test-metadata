import emberBabelAddTestMetadata from '.';

test('output', () => {
  expect(emberBabelAddTestMetadata('🐰')).toBe('🐰');
  expect(emberBabelAddTestMetadata()).toBe('No args passed!');
});
