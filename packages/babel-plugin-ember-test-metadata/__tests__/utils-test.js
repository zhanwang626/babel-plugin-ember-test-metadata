const path = require('path');
const {
  getNodeProperty,
  getNormalizedFilePath,
  _getParsedClassicFilepath,
  _getParsedEmbroiderFilepath,
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
  const testFilePath = path.join('tests', 'acceptance', 'example-test.js');
  const appName = "example-app";

  // classic/tests/acceptance/foo-test.js
  describe("given file path from a classic build", () => {
    const transpiledPath = path.join(appName, testFilePath);

    const config = {
      pkg: {
        name: appName
      },
    }
    const opts = { filename: transpiledPath, root: appName };

    expect(getNormalizedFilePath(opts, config)).toBe(testFilePath);
  });

  // classic/tests/acceptance/foo-test.js
  // classic/tests/bar/acceptance/baz-test.js
  describe("given file path from an classic addon build", () => {
    it("returns the normalized filepath with the addon name", () => {
      const addonName = "example-addon";
      const actualAddonBasePath = path.join(appName, addonName);
      const transpiledAddonPath = path.join(appName, addonName, testFilePath);
      const expectedAddonBasePath = path.join('lib', addonName);

      const config = {
        pkg: {
          name: appName,
          'ember-addon': {
            paths: [actualAddonBasePath]
          },
        },
      }
      const opts = { filename: transpiledAddonPath, root: appName };

      expect(getNormalizedFilePath(opts, config)).toBe(
        path.join(expectedAddonBasePath, testFilePath)
      );
    });
  });

  // ../../../../../../private/var/folders/5m/4ybwhyvn3979lm2223q_q22c000gyd/T/embroider/20408c/tests/acceptance/foo-test.js
  describe("given file path from an embroider build", () => {
    const transpiledPath = path.join(
      'private',
      'var',
      'folders',
      'abcdefg1234',
      'T',
      'embroider',
      '098765',
      testFilePath
    )

    const config = {
      pkg: {
        name: appName
      },
    }
    const opts = { filename: transpiledPath, root: appName };

    expect(getNormalizedFilePath(opts, config)).toBe(testFilePath);
  });


  const fileOpts = {
    embroiderBuildPath: {
      root: '',
      filename: path.join(
        'private',
        'var',
        'folders',
        'abcdefg1234',
        'T',
        'embroider',
        '098765',
        'tests',
        'acceptance',
        'my-test.js'
      ),
    },
    embroiderBuildPathTwoEmbroiderPathSegments: {
      root: '',
      filename: path.join(
        'private',
        'var',
        'folders',
        'embroider',
        'abcdefg1234',
        'T',
        'embroider',
        '098765',
        'tests',
        'acceptance',
        'my-test.js'
      ),
    },
    normalFilePath: {
      root: '',
      filename: path.join('this', 'is', 'not-an-embroider', 'path'),
    },
  };
  const projectConfiguration = {
    pkg: {
      name: 'test-app',
      'ember-addon': {},
    },
  };

  it('returns stripped file path as expected', () => {
    expect(getNormalizedFilePath(fileOpts.embroiderBuildPath, projectConfiguration)).toBe(
      path.join('tests', 'acceptance', 'my-test.js')
    );
    expect(
      getNormalizedFilePath(
        fileOpts.embroiderBuildPathTwoEmbroiderPathSegments,
        projectConfiguration
      )
    ).toBe(path.join('tests', 'acceptance', 'my-test.js'));
  });

  it('returns unmodified file path when path does not include "embroider" as a segment', () => {
    expect(getNormalizedFilePath(fileOpts.normalFilePath, projectConfiguration)).toBe(
      path.join('this', 'is', 'not-an-embroider', 'path')
    );
  });
});

describe('_getParsedClassicFilepath', () => {
  it('returns file path from classic build correctly', () => {
    expect(
      _getParsedClassicFilepath(['test-app', 'tests', 'acceptance', 'my-test.js'], {
        pkg: {
          name: 'test-app',
          'ember-addon': {},
        },
      })
    ).toBe(path.join('tests', 'acceptance', 'my-test.js'));
    expect(
      _getParsedClassicFilepath(
        ['@parent-repo-name', 'test-app', 'tests', 'acceptance', 'my-test.js'],
        {
          pkg: {
            name: `@parent-repo-name${path.sep}test-app`,
            'ember-addon': {},
          },
        }
      )
    ).toBe(path.join('tests', 'acceptance', 'my-test.js'));
  });
});

describe('_getParsedEmbroiderFilepath', () => {
  const filename = path.join(
    'private',
    'var',
    'folders',
    'abcdefg1234',
    'T',
    'embroider',
    '098765',
    'tests',
    'acceptance',
    'my-test.js'
  );
  const pathSegments = filename.split(path.sep);

  it('returns file path from classic build correctly', () => {
    expect(_getParsedEmbroiderFilepath(pathSegments)).toBe(
      path.join('tests', 'acceptance', 'my-test.js')
    );
  });
});
