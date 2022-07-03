module.exports = {
  plugins: ['@lbwa'],
  extends: ['plugin:@lbwa/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  },
  overrides: [
    {
      files: ['**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
}
