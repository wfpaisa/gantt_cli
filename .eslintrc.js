module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
  ],
  rules: {
    'no-console': 0,
    'no-debugger': 0,

  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
