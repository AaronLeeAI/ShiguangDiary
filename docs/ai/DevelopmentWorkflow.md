# 开发工作流（AI 协作版）

> 用于 Claude Code 协作的统一开发流程。

## 1. Task 生命周期

```
[需求]
   ↓
[Plan]
   ↓
[Task List]
   ↓
[实现]
   ↓
[Test]
   ↓
[Review]
   ↓
[Verify]
   ↓
[Done]
```

## 2. 阶段详解

### 2.1 需求（Requirements）

- 阅读任务描述（`tasks提示词/`）
- 了解业务背景（`docs/project-设计-docs/`）
- 明确 Task 边界（什么做、什么不做）

### 2.2 计划（Plan）

使用 EnterPlanMode 制定实施计划：
- 涉及哪些文件
- 改动顺序
- 关键决策点
- 风险评估

### 2.3 Task List（TaskCreate）

将计划拆分为可追踪的 Task：
- 每个 Task 单一职责
- 标注依赖关系
- 设置 in_progress / completed

### 2.4 实现（Implementation）

按 TaskList 顺序执行：
- 严格遵循 CodingStyle
- 实时更新 Task 状态
- 关键决策点停下来确认

### 2.5 测试（Test）

- 写测试（TDD）
- 运行测试确认通过
- 测试覆盖率 ≥ 80%

### 2.6 审查（Review）

按 [`ReviewChecklist.md`](ReviewChecklist.md)：
- 检查工程结构
- 检查命名一致性
- 检查 Theme 来源
- 检查 TypeScript 类型
- 检查潜在 Bug

### 2.7 验证（Verify）

- 运行所有命令
- 类型检查
- ESLint
- 测试
- 手动测试

### 2.8 完成（Done）

- 更新 TaskList（completed）
- 写入 commit
- 提交 PR（多人协作时）

## 3. 并行与串行

### 3.1 串行

- 修改同一文件的多个 Task
- 有依赖关系的 Task
- 涉及工程结构的 Task

### 3.2 并行

- 不同 Feature 的独立开发
- 不同文件的独立修改
- 测试与实现可并行

## 4. 错误处理

### 4.1 已知错误

如果遇到 API 不熟悉的问题：
1. 使用 `claude-code-guide` agent 查询
2. 查阅官方文档
3. 在代码注释中说明选型理由

### 4.2 未知错误

如果遇到无法解决的问题：
1. 停止当前 Task
2. 标注"BLOCKED"
3. 询问用户决策

### 4.3 决策记录

重要决策应在代码注释或文档中保留理由。

## 5. 协作约定

### 5.1 与用户协作

- 关键决策前征询用户意见
- 不确定时使用 AskUserQuestion
- 不要擅自假设业务需求

### 5.2 与其他 Agent 协作

- 通过 SendMessage 通信
- 不在主上下文做复杂判断

## 6. 常见工作流模板

### 6.1 新功能开发

```
1. 阅读需求 + 设计文档
2. Plan 阶段：列文件、改动点
3. 创建 TaskList
4. 顺序实现
5. 写测试 + 验证
6. Review
7. 完成
```

### 6.2 Bug 修复

```
1. 复现 Bug
2. 定位代码
3. 修复
4. 写回归测试
5. 验证修复
6. 完成
```

### 6.3 重构

```
1. 明确重构动机
2. 评估影响范围
3. 重构 + 测试
4. 验证等价性
5. 完成
```

## 7. 工具集成

### 7.1 VS Code

- 使用 `.vscode/settings.json` 配置
- 启用自动格式化
- 启用 ESLint 修复

### 7.2 Git

- 提交信息遵循 Conventional Commits
- 分支命名遵循规范
- 保持提交粒度小

## 8. 检查点（Checkpoints）

每个 Task 完成后必须经过以下检查：

- [ ] 所有 Task 已 completed
- [ ] 所有测试通过
- [ ] 类型检查通过
- [ ] ESLint 通过
- [ ] 文档已更新（如有需要）
- [ ] 无新警告
- [ ] 无循环依赖