import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import storybook from 'eslint-plugin-storybook';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.spec.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // Unused imports & vars
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
      ],
      
      // Strict TS rules
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      // General code quality
      'no-console': 'error',
      'no-duplicate-imports': 'error',
      'import/no-cycle': 'error',

      // Ban deep relative imports (must use alias)
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message: 'Usage of deep relative imports is banned. Use @/ alias instead.',
            },
          ],
        },
      ],

      // Restrict syntax
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message: 'Barrel exports using "export *" are forbidden. Export explicitly.',
        },
        {
          // Restrict cross-feature internal imports. 
          selector: 'ImportDeclaration[source.value=/^@\\/features\\/[^\\/]+\\/.+/]',
          message: 'Direct internal imports between features are forbidden. Import only from the feature Public API (index.ts).',
        },
        {
          // Restrict import.meta.env usage outside of ConfigService
          selector: 'MemberExpression[object.meta.name="import"][object.property.name="meta"][property.name="env"]',
          message: 'Accessing import.meta.env directly is banned. Use ConfigService instead.'
        }
      ],
    },
  },
  {
    ignores: ['node_modules', 'dist', 'public', '.storybook', 'coverage', 'eslint.config.js', 'commitlint.config.js', 'tailwind.config.js', 'postcss.config.js', 'vite.config.ts', 'vitest.config.ts', 'playwright.config.ts'],
  },
  ...storybook.configs['flat/recommended']
);
