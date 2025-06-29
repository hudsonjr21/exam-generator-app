function fixRules(rules) {
  const fixed = {};
  for (const key in rules) {
    const value = rules[key];
    fixed[key] = typeof value === 'string' ? [value] : value;
  }
  return fixed;
}

export default tseslint.config(
  {
    ignores: ['node_modules/', '.next/', 'dist/'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['apps/frontend/**/*.{ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...fixRules(nextPlugin.configs.recommended.rules),
      ...fixRules(nextPlugin.configs['core-web-vitals'].rules),
      'react/react-in-jsx-scope': 'off',
    },
  },

  {
    files: ['apps/backend/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'warn',
    },
  },

  {
    files: ['packages/core/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Regras para shared code, se quiser
    },
  },

  {
    ...eslintPluginPrettierRecommended,
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'lf',
          singleQuote: true,
          trailingComma: 'all',
        },
      ],
    },
  },
);
