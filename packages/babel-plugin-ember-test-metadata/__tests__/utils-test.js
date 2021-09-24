const { getNormalizedFilePath } = require('../utils');

describe('getNormalizedFilePath', () => {
  describe('classic', () => {
    const appRoot = '/Users/tester/workspace/personal/test-bed/classic';

    it('returns the normalized filepath', () => {
      const filePath =
        '/Users/tester/workspace/personal/test-bed/classic/classic/tests/acceptance/foo-test.js';
      const expectedPath = 'tests/acceptance/foo-test.js';
      const opts = {
        filename: filePath,
        root: '/Users/tester/workspace/personal/test-bed/classic',
      };
      const config = {
        pkg: {
          name: 'classic',
        },
      };

      const normalizedFilePath = getNormalizedFilePath(opts, config);

      expect(normalizedFilePath).toEqual(expectedPath);
    });

    it('returns the normalized filepath for the in app test', () => {
      const filePath =
        '/Users/tester/workspace/personal/test-bed/classic/classic/tests/acceptance/foo-test.js';
      const expectedPath = 'tests/acceptance/foo-test.js';
      const opts = {
        filename: filePath,
        root: '/Users/tester/workspace/personal/test-bed/classic',
      };
      const config = {
        pkg: {
          name: 'classic',
        },
      };
      config.pkg['ember-addon'] = {
        paths: ['lib/bar'],
      };

      const normalizedFilePath = getNormalizedFilePath(opts, config);

      expect(normalizedFilePath).toEqual(expectedPath);
    });

    it('returns the normalized filepath with the addon name', () => {
      const filePath = `${appRoot}/tests/ember-add-in-repo-tests/lib/bar/tests/acceptance/foo-test.js`;
      const expectedPath = `lib/bar/tests/acceptance/foo-test.js`;
      const opts = { filename: filePath, root: appRoot };
      const config = {
        pkg: {
          name: 'classic',
        },
      };
      config.pkg['ember-addon'] = {
        paths: ['lib/bar'],
      };

      const normalizedFilePath = getNormalizedFilePath(opts, config);

      expect(normalizedFilePath).toEqual(expectedPath);
    });
  });

  describe('embroider', () => {
    const appRoot = '/private/var/folders/abcdefg1234/T/embroider/098765';

    it('returns the normalized filepath for app tests', () => {
      const expectedPath = `tests/acceptance/foo-test.js`;
      const filePath = `${appRoot}/tests/acceptance/foo-test.js`;
      const config = {
        pkg: {
          name: 'example-app',
        },
      };
      const opts = { filename: filePath, root: appRoot };

      const normalizedFilePath = getNormalizedFilePath(opts, config);

      expect(normalizedFilePath).toEqual(expectedPath);
    });

    it('returns the normalized filepath for addon app tests', () => {
      const filePath = `${appRoot}/tests/acceptance/foo-test.js`;
      const expectedPath = `tests/acceptance/foo-test.js`;
      const config = {
        pkg: {
          name: 'example-app',
        },
      };
      config.pkg['ember-addon'] = {
        paths: ['lib/bar'],
      };
      const opts = { filename: filePath, root: appRoot };

      const normalizedFilePath = getNormalizedFilePath(opts, config);

      expect(normalizedFilePath).toEqual(expectedPath);
    });

    it('returns the normalized filepath with the addon name for addon tests', () => {
      const filePath = `${appRoot}/tests/ember-add-in-repo-tests/lib/bar/tests/acceptance/foo-test.js`;
      const expectedPath = `lib/bar/tests/acceptance/foo-test.js`;
      const config = {
        pkg: {
          name: 'example-app',
        },
      };
      config.pkg['ember-addon'] = {
        paths: ['lib/bar'],
      };
      const opts = { filename: filePath, root: appRoot };

      const normalizedFilePath = getNormalizedFilePath(opts, config);

      expect(normalizedFilePath).toEqual(expectedPath);
    });
  });
});
