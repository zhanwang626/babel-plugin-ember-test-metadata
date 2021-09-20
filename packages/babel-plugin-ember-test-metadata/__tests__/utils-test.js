const path = require('path');
const { getNodeProperty, getNormalizedFilePath } = require('../utils');

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
  const projectConfiguration = {
    pkg: {
      name: 'test-app',
      'ember-addon': {},
    },
  };

  it('returns stripped file path as expected', () => {
    expect(
      getNormalizedFilePath(
        {
          root: path.join('private', 'var', 'folders', 'abcdefg1234', 'T', '1357'),
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
        projectConfiguration
      )
    ).toEqual(path.join('tests', 'acceptance', 'my-test.js'));
  });

  it('returns unmodified file path when path does not include "embroider" as a segment', () => {
    expect(
      getNormalizedFilePath(
        {
          root: path.join('packages', 'test-app'),
          filename: path.join('packages', 'test-app', 'this', 'is', 'not-an-embroider', 'path'),
        },
        projectConfiguration
      )
    ).toEqual(path.join('this', 'is', 'not-an-embroider', 'path'));
  });
});
