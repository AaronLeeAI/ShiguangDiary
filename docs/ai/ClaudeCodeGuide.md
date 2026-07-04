# Claude Code 开发指南

> 为拾光日记项目定制的 Claude Code 使用规范。

## 1. 总体原则

- **任务明确**：每个 Task 有清晰的边界，不混杂多任务
- **单向数据流**：UI → Store/API → View，避免反向数据流
- **主题驱动**：所有样式必须通过 `@theme`，禁止硬编码
- **类型优先**：TypeScript 严格模式，禁用 `any`
- **可测试性**：纯函数优先，业务逻辑与 UI 分离

## 2. Task 执行流程

### 2.1 Task 类型

| 类型 | 说明 | 限制 |
|------|------|------|
| `bootstrap` | 工程初始化 | 禁止开发页面/组件逻辑 |
| `feature` | 功能开发 | 必须 TDD，先写测试 |
| `refactor` | 重构 | 必须说明动机和方案 |
| `fix` | Bug 修复 | 必须说明复现步骤和修复方案 |
| `review` | 代码审查 | 按 ReviewChecklist 执行 |

### 2.2 执行步骤

```
1. 理解 Task 要求（读取 docs/）
2. 创建/更新 Task List（TaskCreate）
3. 开发（遵循CodingStyle）
4. 测试（单元测试 ≥ 80% 覆盖率）
5. Review（ClaudeCodeGuide:Review）
6. 提交（Conventional Commits）
```

## 3. 开发规范

详见：
- [`docs/development/Architecture.md`](Architecture.md)
- [`docs/development/CodingStyle.md`](CodingStyle.md)
- [`docs/development/ComponentConvention.md`](ComponentConvention.md)

关键点：
- 所有组件通过 `@components` 引用
- 所有样式通过 `@theme` 访问
- 所有路由通过 `@navigation` 引用
- 禁止在组件中硬编码颜色/间距/字号

## 4. 测试规范

### 4.1 单元测试

- 工具函数必须有单元测试
- 组件必须有基本渲染测试
- 业务逻辑必须有覆盖测试

### 4.2 测试文件命名

```
Component.tsx         → __tests__/Component.test.tsx
useHook.ts            → __tests__/useHook.test.ts
utils.ts              → __tests__/utils.test.ts
```

### 4.3 测试命令

```bash
npm test              # 运行测试
npm run test:watch    # Watch 模式
npm run test:coverage # 生成覆盖率报告
```

## 5. 代码审查

### 5.1 审查清单

详见 [`ReviewChecklist.md`](ReviewChecklist.md)

### 5.2 审查流程

```
1. 审查 Task 是否完成（TaskList）
2. 检查测试是否通过（Jest）
3. 检查类型检查通过（tsc --noEmit）
4. 检查 ESLint 通过（npm run lint）
5. 检查是否遵循 Design System
6. 检查是否遵循 Architecture
7. 检查是否有过度设计
8. 检查是否方便后续扩展
```

## 6. 提交规范

### 6.1 Commit Message

格式：`<type>: <description>`

类型：
- `feat`：新功能
- `fix`：修复
- `refactor`：重构
- `docs`：文档
- `test`：测试
- `chore`：杂项

### 6.2 分支命名

```
feat/<feature-name>
fix/<bug-fix>
refactor/<refactor-name>
```

## 7. 常见问题

### 7.1 如何添加新组件？

1. 参考 [`docs/project-设计-docs/components/<Name>.md`](../../project-设计-docs/components/<Name>.md)
2. 在 `src/components/<Name>/` 创建目录
3. 生成骨架：`Component.tsx`, `types.ts`, `styles.ts`, `index.ts`
4. 按 ComponentConvention 实现

### 7.2 如何添加新主题 Token？

1. 确保设计文档中已有定义
2. 在 `src/theme/` 对应文件中添加
3. 在 `@theme/index.ts` 中导出
4. 重新运行 TSC 验证类型

## 8. 工具命令

```bash
# 开发
npm start               # Metro 服务器
npm run android         # 运行 Android
npm run ios             # 运行 iOS

# 检查
npm run typecheck       # TypeScript 类型检查
npm run lint            # ESLint
npm run lint:fix        # 自动修复
npm run format          # Prettier 格式化
npm test                # Jest 测试

# 清理
npm run clean:metro     # 清理 Metro 缓存
npm run clean:android   # 清理 Android 构建
npm run reset           # 重置项目
```

## 9. 参考资源

- React Native 官方文档：https://reactnative.dev
- React Navigation：https://reactnavigation.org
- Zustand：https://docs.pmnd.rs/zustand
- TypeScript：https://www.typescriptlang.org