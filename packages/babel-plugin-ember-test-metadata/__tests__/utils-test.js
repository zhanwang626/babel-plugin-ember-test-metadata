const {
  getNodeProperty,
  getNormalizedFilePath,
} = require('../utils');

describe('getNodeProperty', () => {
  it('returns property as expected', () => {
    const mockNode = {
      system: {
        settings: {
          volume: {
            level: 11,
          },
        },
      },
    };

    expect(getNodeProperty(mockNode, 'system.settings.volume.level')).toBe(11);
    expect(getNodeProperty(mockNode.system.settings, 'volume.level')).toBe(11);
    expect(getNodeProperty(mockNode, 'unknown.leaf.property')).toBe(undefined);
  });

  it('returns early if no node is provided', () => {
    let emptyNode;
    expect(getNodeProperty(emptyNode, 'volume.level')).toBe(undefined);
    expect(getNodeProperty(null, 'volume.level')).toBe(undefined);
    expect(getNodeProperty({}, 'volume.level')).toBe(undefined);
  });
});

describe('getNormalizedFilePath', () => {
  let appRoot;

  describe("given file path from a classic build", () => {
    beforeEach(() => {
      appRoot = "/Users/tester/workspace/personal/test-bed/classic";
    });

    it("returns the normalized filepath", () => {
      const expectedPath = "tests/acceptance/foo-test.js";
      const preFormattedPath = "/Users/tester/workspace/personal/test-bed/classic/classic/tests/acceptance/foo-test.js";
      const opts = { filename: preFormattedPath, root: "/Users/tester/workspace/personal/test-bed/classic" };
      const config = {
        pkg: {
          name: "classic"
        },
      }

      const formattedPath = getNormalizedFilePath(opts, config);

      expect(formattedPath).toBe(expectedPath);
    });

    it("returns the normalized filepath for the in app test", () => {
      const expectedPath = "tests/acceptance/foo-test.js";
      const preFormattedPath = "/Users/tester/workspace/personal/test-bed/classic/classic/tests/acceptance/foo-test.js";
      const opts = { filename: preFormattedPath, root: "/Users/tester/workspace/personal/test-bed/classic" };
      const config = {
        pkg: {
          name: "classic"
        },
      }
      config.pkg['ember-addon'] = {
        paths: ['lib/bar']
      }

      const formattedPath = getNormalizedFilePath(opts, config);

      expect(formattedPath).toBe(expectedPath);
    });

    it("returns the normalized filepath with the addon name", () => {
      const expectedPath = `lib/bar/tests/acceptance/foo-test.js`
      const preFormattedPath = `${appRoot}/tests/ember-add-in-repo-tests/lib/bar/tests/acceptance/foo-test.js`;
      const opts = { filename: preFormattedPath, root: appRoot };
      const config = {
        pkg: {
          name: "classic"
        },
      }
      config.pkg['ember-addon'] = {
        paths: ['lib/bar']
      }

      const formattedPath = getNormalizedFilePath(opts, config);

      expect(formattedPath).toBe(expectedPath);
    });
  });

  describe("given file path from an embroider build", () => {
    beforeEach(() => {
      appRoot = '/private/var/folders/abcdefg1234/T/embroider/098765';
    });

    it("returns the normalized filepath for app tests", () => {
      const expectedPath = `tests/acceptance/foo-test.js`
      const preFormattedPath = `${appRoot}/tests/acceptance/foo-test.js`;
      const config = {
        pkg: {
          name: "example-app",
        },
      }
      const opts = { filename: preFormattedPath, root: appRoot };

      const formattedPath = getNormalizedFilePath(opts, config);

      expect(formattedPath).toBe(expectedPath);
    });

    it("returns the normalized filepath for addon app tests", () => {
      const expectedPath = `tests/acceptance/foo-test.js`
      const preFormattedPath = `${appRoot}/tests/acceptance/foo-test.js`;
      const config = {
        pkg: {
          name: "example-app",
        },
      }
      config.pkg['ember-addon'] = {
        paths: ["lib/bar"]
      }
      const opts = { filename: preFormattedPath, root: appRoot };

      const formattedPath = getNormalizedFilePath(opts, config);

      expect(formattedPath).toBe(expectedPath);
    });

    it("returns the normalized filepath with the addon name for addon tests", () => {
      const expectedPath = `lib/bar/tests/acceptance/foo-test.js`
      const preFormattedPath = `${appRoot}/tests/ember-add-in-repo-tests/lib/bar/acceptance/foo-test.js`;
      const config = {
        pkg: {
          name: "example-app",
        },
      }
      config.pkg['ember-addon'] = {
        paths: ["lib/bar"]
      }
      const opts = { filename: preFormattedPath, root: appRoot };

      const formattedPath = getNormalizedFilePath(opts, config);

      expect(formattedPath).toBe(expectedPath);
    });
  });

});
