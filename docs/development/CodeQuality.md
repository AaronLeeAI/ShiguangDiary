# 代码质量体系

本项目的质量门禁分四层，本地和 CI 使用同一套命令，避免“本地能过、CI 挂掉”。

```
提交前（毫秒级） → 本地全量校验（秒级） → CI（每次 push/PR） → 依赖自动巡检（每周）
```

## 一、工具链

| 工具                      | 版本              | 作用                                               |
| ------------------------- | ----------------- | -------------------------------------------------- |
| ESLint                    | 10（flat config） | 语法与规则检查，配置见 `eslint.config.mjs`         |
| typescript-eslint         | 8                 | TS 语义规则（`recommended` 规则集）                |
| eslint-plugin-react-hooks | 7                 | Hooks 规则 + React Compiler 规则                   |
| Prettier                  | 3                 | 唯一格式化来源，配置见 `.prettierrc.js`            |
| TypeScript                | 5.9               | `strict` 全开，`tsc --noEmit` 做类型门禁           |
| Jest                      | 29                | 单元/组件测试                                      |
| husky + lint-staged       | 9 / 17            | 提交前只处理暂存文件                               |
| commitlint                | 21                | Conventional Commits 校验                          |
| GitHub Actions            | —                 | lint / typecheck / format / test / bundle 五项检查 |
| Dependabot                | —                 | 每周依赖巡检，按生态分组提 PR                      |

### ESLint 分层策略

`eslint.config.mjs` 不是一次性把所有规则开到最严，而是按“能不能阻断合并”分级：

- **error（阻断）**：会导致运行时错误或明确 bug 的规则，如 `react-hooks/rules-of-hooks`、
  `no-useless-assignment`、`preserve-caught-error`、`eqeqeq`。
- **warn（不阻断）**：存量债务，如 `@typescript-eslint/no-unused-vars`、
  React Compiler 的 14 条新规则（`react-hooks/refs`、`purity`、`set-state-in-effect` 等）。
- **关闭**：与 Prettier 冲突的格式规则，由 `eslint-config-prettier` 统一关闭；
  类型检查覆盖的规则不重复配置。

这样新增代码不会有 error，存量债务也不会因为“一把梭全开”而让门禁失效——
每次触碰相关文件时顺手收敛。

### 为什么格式交给 Prettier 而不是 ESLint

ESLint 的 `prettier/prettier` 规则会把格式化错误算作 lint 错误，导致：

1. lint 变慢（每个文件都要跑一遍 Prettier）；
2. 报错语义混淆，看不出是“代码有问题”还是“少了个逗号”；
3. 编辑器里 ESLint 和 Prettier 抢着改同一行。

现在的职责是：**Prettier 管长什么样，ESLint 管对不对**。

## 二、本地命令

```bash
npm run verify        # 一条命令跑完 lint + typecheck + format:check + test
npm run lint          # ESLint（flat config）
npm run lint:fix      # 自动修复可修复项
npm run typecheck     # tsc --noEmit
npm run format        # 写回格式化
npm run format:check  # 只检查不写
npm run test          # Jest
npm run test:ci       # CI 用：串行 + 覆盖率
```

提交时 husky 会自动执行：

- `pre-commit` → `lint-staged`：只对暂存文件跑 `eslint --fix` + `prettier --write`，
  所以提交历史里不会出现“格式没跑”的脏提交，也不会因为全量扫描而变慢。
- `commit-msg` → `commitlint`：校验 `feat: / fix: / refactor: ...` 格式。

## 三、CI 流水线

`.github/workflows/ci.yml` 有两个 job：

| Job       | 检查项                                           | 目的                                                           |
| --------- | ------------------------------------------------ | -------------------------------------------------------------- |
| `quality` | lint → typecheck → format:check → jest(coverage) | 拦截类型/规则/测试回归                                         |
| `bundle`  | `react-native bundle --dev false --minify`       | 不跑原生构建也能验证 JS 依赖图完整，拦截 import 写错、依赖漏装 |

`bundle` job 是刻意加的：Jest 只加载被测试覆盖到的模块，而 bundle 会把 `index.js`
可达的所有模块都打一遍，能抓到测试覆盖不到的“死链”问题，成本却远低于原生构建。

## 四、依赖治理

`Dependabot` 每周一巡检，按三个组提 PR：

- `react-native-runtime`：React / RN 核心
- `dev-toolchain`：ESLint、TypeScript、Jest、Prettier 等
- `native-deps`：`react-native-*` 原生库

`react` / `react-native` 的 **major** 升级被显式忽略，因为需要原生构建回归，
必须人工评估（本项目目前停留在 RN 0.76 + 旧架构，升级到 0.82+ 牵涉新架构迁移）。

## 五、迁移记录（本次）

| 项         | 迁移前                          | 迁移后                              |
| ---------- | ------------------------------- | ----------------------------------- |
| ESLint     | 8.57 + `.eslintrc.js`（legacy） | 10.15 + `eslint.config.mjs`（flat） |
| TypeScript | 5.0.4                           | 5.9.3                               |
| Prettier   | 2.8.8                           | 3.10                                |
| 格式化归属 | ESLint 插件 `prettier/prettier` | 独立 Prettier，ESLint 只查逻辑      |
| 提交门禁   | 无                              | husky + lint-staged + commitlint    |
| CI         | 无                              | GitHub Actions（5 项检查）          |
| 依赖巡检   | 无                              | Dependabot 分组周更                 |

迁移时同步修掉的真实缺陷（不是为过 lint 而改）：

- `src/agent/core.ts`：工具参数解析的初始化赋值是死代码，改为在两个分支各自赋值。
- `src/agent/rag/*.ts`、`src/screens/DiaryEdit/DiaryEditScreen.tsx`：包装错误时补上
  `cause`，保留原始错误栈，排查原生侧失败时不再丢信息。
- `src/features/data-management/utils/backupSchema.ts`、`integrityChecker.ts`：
  去掉“先赋默认值再覆盖”的冗余赋值。
- `src/screens/DiaryEdit/DiaryEditScreen.tsx`：三元表达式当语句用，改为 `if/else`。

> `tsconfig.json` 的 `types` 从 `["react-native", "jest"]` 改为 `["jest"]`：
> TS 5.9 对 `types` 的解析更严格，`react-native` 不在 `typeRoots` 中会直接报 TS2688。
> RN 的类型通过 `import` 正常引入，不影响类型安全。
