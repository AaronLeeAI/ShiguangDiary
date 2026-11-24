// ESLint 10 flat config.
// 旧版 .eslintrc.js 已移除：ESLint 9 起 flat config 为唯一入口。
// 分层原则：
//   1. 语法/正确性类规则（rules-of-hooks、no-undef 等）为 error，阻断合并
//   2. React Compiler 新规则先以 warn 接入，作为存量债务逐步收敛
//   3. 格式化交给 Prettier，ESLint 只通过 eslint-config-prettier 关闭冲突
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

/** 存量代码里 React Compiler 规则暂不能全量满足，先降级为提示。 */
const reactCompilerRules = {
  'react-hooks/static-components': 'warn',
  'react-hooks/use-memo': 'warn',
  'react-hooks/preserve-manual-memoization': 'warn',
  'react-hooks/incompatible-library': 'warn',
  'react-hooks/immutability': 'warn',
  'react-hooks/globals': 'warn',
  'react-hooks/refs': 'warn',
  'react-hooks/set-state-in-effect': 'warn',
  'react-hooks/error-boundaries': 'warn',
  'react-hooks/purity': 'warn',
  'react-hooks/set-state-in-render': 'warn',
  'react-hooks/unsupported-syntax': 'warn',
  'react-hooks/config': 'warn',
  'react-hooks/gating': 'warn',
}

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      'vendor/**',
      'coverage/**',
      'dist/**',
      'build/**',
      'artifacts/**',
      'patches/**',
      '__mocks__/**',
      '*.min.js',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
  },

  // React Native / TypeScript 业务代码
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.node,
        __DEV__: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        XMLHttpRequest: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        alert: 'readonly',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // Hooks 调用顺序错误会让运行时行为直接崩坏，保持 error
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      ...reactCompilerRules,

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-namespace': 'off',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': ['warn', { destructuring: 'all' }],
    },
  },

  // Jest 测试
  {
    files: ['__tests__/**/*.{ts,tsx,js,jsx}', 'jest.setup.js', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // 配置文件与测试环境脚本（CommonJS / 需要 require）
  {
    files: [
      '*.config.js',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
      '.prettierrc.js',
      'jest.setup.js',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // 必须放在最后：关闭所有与 Prettier 冲突的格式规则
  prettierConfig,
)
