import jsxA11y from 'eslint-plugin-jsx-a11y';
import tsParser from '@typescript-eslint/parser';

// QA: configuración mínima de ESLint para auditar accesibilidad (jsx-a11y)
// sobre componentes React Native. Se usa flat config (ESLint 9) con el parser
// de TypeScript para poder analizar archivos .tsx.
export default [
  { ignores: ['node_modules/**', 'coverage/**', '.expo/**', 'dist/**'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { 'jsx-a11y': jsxA11y },
    rules: { ...jsxA11y.flatConfigs.recommended.rules },
  },
];
