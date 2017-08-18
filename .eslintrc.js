module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'jquery': true
  },
  'extends': 'eslint:recommended',
  'rules': {
    'strict': ['error', 'global'],
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'linebreak-style': [ 'error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-trailing-spaces': ['error'],
    'eol-last': ['error', 'always'],
    'comma-dangle': ['error', 'never']
  }
};
