# Task 约定

> 每个 Task 必须符合以下规范。

## 1. Task 命名

格式：`<阶段名> <序号>：<任务名>`

示例：
- `Task 1：拾光日记 React Native 工程初始化`
- `Task 2：实现首页 (Home Screen)`
- `Task 3：实现日记编辑功能`

## 2. Task 描述格式

```
# Task N：<任务名>

## Role（角色）
你是 <角色>。

## 背景
- 项目背景
- 当前进度

## 本次任务目标
- 目标 1
- 目标 2

## 第一部分
...

## 禁止
- 禁止开发 A
- 禁止修改 B

## 最终 Review
请执行至少三轮 Review。
```

## 3. Task 边界

### 3.1 必须做

- 只完成任务描述中明确的内容
- 在必要时扩展脚手架（如类型定义、空函数）

### 3.2 禁止做

- 开发任务未要求的页面
- 修改任务未要求的文件
- 重新设计 Token
- 引入新依赖（除非必要）

## 4. Task 输入

每个 Task 必须明确：
- 输入文档（设计文档、API 文档等）
- 输入文件（现有代码、配置文件）
- 输出文件（要创建或修改的文件）

## 5. Task 输出

每个 Task 必须输出：
- 修改/创建的文件清单
- 关键设计决策说明
- 待 Review 项列表
- 已知限制

## 6. Task 验收标准

### 6.1 工程任务

- [ ] 所有要求的文件已创建
- [ ] 目录结构符合规范
- [ ] 命名符合规范
- [ ] 文档完整
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误

### 6.2 业务任务

- [ ] 功能完整实现
- [ ] 测试覆盖率 ≥ 80%
- [ ] 遵循 Design System
- [ ] 遵循组件规范
- [ ] 性能可接受

## 7. Task 文档化

每个 Task 完成后，建议在 `docs/task-history/` 添加任务记录：
- 任务描述
- 实施摘要
- 关键决策
- 后续 TODO

## 8. Task 与 Commit

一个 Task 可以包含多个 commit：
- 首次提交：脚手架
- 后续提交：业务逻辑
- 最后提交：测试 + 文档

## 9. Task 与 PR

多 Task 的工作应在 PR 中分组：
- 一个 PR = 一个完整 Feature
- 一个 PR 可以包含多个 commit

## 10. 任务边界示例

### ✅ 正确

> Task：实现 DiaryCard 组件
> - 实现 DiaryCard.tsx
> - 创建 types.ts、styles.ts、index.ts
> - 创建 README.md

### ❌ 错误

> Task：实现 DiaryCard 组件
> - 实现 DiaryCard.tsx
> - 实现日记详情页（不属于本 Task）
> - 修改 Theme 系统（不属于本 Task）