# Prompt 约定

> Claude Code 编写 Prompt 的统一规范。

## 1. Prompt 结构

### 1.1 标准结构

```
# Role（角色）
<Claude 应该扮演什么角色>

# 背景
<项目背景、当前进度>

# 任务目标
<明确的目标>

# 第一部分
...

# 第二部分
...

# 禁止
- 禁止 X
- 禁止 Y

# 最终 Review
<需要做的审查>
```

### 1.2 简短任务

对于小型任务，可省略部分结构：

```
请实现 [组件名]：[功能描述]
要求：[具体要求]
参考：[文档链接]
```

## 2. 描述风格

### 2.1 明确性

✅ 好的描述：

```
请实现 DiaryCard 组件，包含：
- 日期块（左侧）
- 标题 + 正文预览 + 时间戳
- 点击事件 onPress
- 可选封面图
```

❌ 模糊的描述：

```
实现一个日记卡片组件。
```

### 2.2 可验证

每个要求应可验证：

```
✅ 实现 DiaryCard，包含标题（17sp/medium）和正文（15sp/regular）
✅ 测试覆盖率达到 80% 以上
✅ TypeScript 严格模式编译通过

❌ 写一个好的组件
❌ 提高代码质量
```

## 3. 上下文引用

### 3.1 引用文档

```
参考文档：
- Design System: docs/project-设计-docs/docs/04_Design_System.md
- Component: docs/project-设计-docs/components/DiaryCard.md
- Architecture: docs/development/Architecture.md
```

### 3.2 引用代码

```
参考实现：
- src/components/TopBar/TopBar.tsx（参考布局）
- src/theme/colors.ts（颜色 Token）
```

## 4. 禁止与约束

### 4.1 明确禁止

```
禁止：
- 引入新依赖
- 修改 Theme Token
- 开发其他无关组件
```

### 4.2 边界

明确什么**不**做：

```
本任务不实现：
- 日记详情页（下一个 Task）
- 数据库 Schema 迁移
- API 接口（沿用现有）
```

## 5. 验收标准

```
完成后必须：
- 所有测试通过
- TypeScript 编译通过
- ESLint 无错误
- 截图验证（如适用）
```

## 6. 输出格式

### 6.1 文件清单

完成后输出：

```
修改文件：
- src/components/DiaryCard/DiaryCard.tsx
- src/components/DiaryCard/index.ts

新增文件：
- src/components/DiaryCard/__tests__/DiaryCard.test.tsx
```

### 6.2 决策记录

输出关键决策：

```
关键决策：
1. 使用 React.memo 优化渲染
2. 标题行数限制 1 行
3. 时间戳格式化为相对时间
```

## 7. Prompt 长度

### 7.1 推荐

- 中型任务：500-2000 字
- 大型任务：2000-5000 字
- 巨型任务：拆分为多个 Task

### 7.2 拆分原则

如果单 Prompt 超过 5000 字，考虑拆分为多个子任务。

## 8. 迭代改进

### 8.1 第一版 Prompt

- 清晰描述需求
- 列出约束
- 提供参考

### 8.2 反馈后

- 标注不清晰的点
- 补充上下文
- 明确边界

## 9. 常见模式

### 9.1 模式：实现组件

```
请实现 [组件名]：
- 业务：<业务场景>
- Props：<属性定义>
- 行为：<交互>
- 参考：<文档/代码>
```

### 9.2 模式：修复 Bug

```
请修复 [Bug 描述]：
- 复现：<步骤>
- 期望：<正确行为>
- 实际：<错误行为>
- 位置：<文件/函数>
```

### 9.3 模式：重构

```
请重构 [模块名]：
- 动机：<原因>
- 方案：<新方案>
- 影响：<影响范围>
```

### 9.4 模式：初始化

```
请初始化 [模块/项目]：
- 技术栈：<依赖>
- 目录：<结构>
- 配置：<配置项>
- 禁止：<禁止项>
```

## 10. 风格示例

### 完整 Prompt 示例

````
# Task：实现 DiaryCard 组件

# Role
你是 React Native 资深开发。

# 背景
拾光日记 - 当前已完成 Task1（Foundation），正在 Task2（首页）开发。
DiaryCard 是首页、搜索结果、日记本内页复用的核心组件。

# 任务目标
实现 DiaryCard 组件，符合设计规范 docs/project-设计-docs/components/DiaryCard.md。

# Props
```typescript
interface DiaryCardProps {
  item: Diary;
  onPress?: () => void;
  style?: ViewStyle;
}
````

# 要求

- 标题：17sp, medium, neutral.gray90
- 正文：15sp, regular, neutral.gray60, 2 行省略
- 时间戳：12sp, regular, neutral.gray50
- 卡片间距：8dp
- 内边距：16dp
- 圆角：16dp
- 阴影：shadow.md

# 禁止

- 禁止修改 Theme Token
- 禁止硬编码颜色/间距
- 禁止引入新依赖

# 必须

- 使用 React.memo
- 包含单元测试
- 添加 JSDoc 注释

```

```
