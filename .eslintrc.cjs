/**
 * ESLint конфигурация для MurmanClick
 * Правила для React 18, TypeScript (будущая миграция), и качества кода
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React правила
    'react/prop-types': 'off', // Отключаем, так как планируем TypeScript
    'react/react-in-jsx-scope': 'off', // Не нужен в React 17+
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    
    // React Hooks правила
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Общие правила качества кода
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Разрешаем только warn и error
    'no-debugger': 'error',
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Стиль кода
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    
    // Импорты
    'no-duplicate-imports': 'error',
    
    // Безопасность
    'no-eval': 'error',
    'no-implied-eval': 'error',
  },
  overrides: [
    {
      // Правила для будущих TypeScript файлов
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error', // Запрещаем any
        '@typescript-eslint/no-unused-vars': ['warn', { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        }],
        '@typescript-eslint/explicit-function-return-type': 'off', // Можно включить позже
        '@typescript-eslint/explicit-module-boundary-types': 'off', // Можно включить позже
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.config.js',
    '*.config.ts',
  ],
}

