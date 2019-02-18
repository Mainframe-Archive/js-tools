module.exports = {
  extends: [
    'mainframe',
    'mainframe/jest',
    'mainframe/typescript',
    'plugin:import/typescript',
  ],
  rules: {
    '@typescript-eslint/array-type': ['error', 'generic'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
