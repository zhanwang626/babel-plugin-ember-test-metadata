module.exports = {
  env: {
    browser: false,
    node: true,
  },
  plugins: ["node", "prettier"],
  extends: ["eslint:recommended", "plugin:node/recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
  overrides: [
    {
      files: ["packages/babel-plugin-ember-test-metadata/__tests__/**/*.js"],
      env: {
        jest: true,
      },
    },
  ],
};
