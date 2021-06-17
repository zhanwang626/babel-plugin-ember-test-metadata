# babel-plugin-ember-test-metadata

> A Babel plugin for Ember apps that adds a test's file path to test metadata available through `@ember/test-helpers`.

[![Package Version](https://img.shields.io/npm/v/ember-babel-add-test-metadata.svg?style=flat-square)](https://www.npmjs.com/package/ember-babel-add-test-metadata)
[![Downloads Status](https://img.shields.io/npm/dm/ember-babel-add-test-metadata.svg?style=flat-square)](https://npm-stat.com/charts.html?package=ember-babel-add-test-metadata&from=2016-04-01)
[![Code Style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](#badge)

A test file's path can enable downstream consumers of test results to process, and potentially associate a specific test failure to a file path. This can assist with the analysis of test infrastructure, specifically where identifying ownership over a test file is useful or required.

This Babel plugin transforms a test so that its file path is added to `@ember/test-helpers` [test metadata](https://github.com/emberjs/ember-test-helpers/blob/master/API.md#gettestmetadata), where other utilities can access.

## Compatability

TODO

- Ember.js ver or above
- Ember CLI ver or above
- QUnit ver
- Node.js ver

## Installation

TODO Babel plugin installation

## Usage

TODO Plugin usage in an Ember app

## Tests

```sh
npm test
```

## Contributing

TODO Link to contributing doc
