module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'quotes': ['error', 'single', { 'avoidEscape': true }],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'always-multiline'],
        'no-multi-spaces': 'error',
        'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
        'space-infix-ops': 'error',
        'space-before-blocks': 'error',
        'space-before-function-paren': ['error', {
            'anonymous': 'never',
            'named': 'never',
            'asyncArrow': 'always',
        }],
        'arrow-spacing': 'error',

        'eqeqeq': ['error', 'always'],
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'error',
        'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
        'no-console': ['warn', { 'allow': ['warn', 'error'] }],
        'no-debugger': 'error',
        'no-duplicate-imports': 'error',

        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-proto': 'error',
    },
    ignorePatterns: [
        'node_modules/',
        'logs/',
        //'public/',
        'data/',
    ],
};
