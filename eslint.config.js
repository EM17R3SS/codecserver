const globals = require('globals');

module.exports = [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            // Стиль
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

            // Лучшие практики
            'eqeqeq': ['error', 'always'],
            'no-var': 'error',
            'prefer-const': 'error',
            'prefer-arrow-callback': 'error',
            'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
            'no-console': ['warn', { 'allow': ['warn', 'error'] }],
            'no-debugger': 'error',

            // Безопасность
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
        },
        ignores: [
            'node_modules/**',
            'dist/**',
            'coverage/**',
            'logs/**',
            //'public/**',
            'data/**',
            'src/index.js',
        ],
    },
];
