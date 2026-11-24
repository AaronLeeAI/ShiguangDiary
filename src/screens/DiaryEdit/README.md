# DiaryEdit Screen - 日记编辑器

> 写日记主流程入口。从 Home FAB / DiaryView"编辑"进入。

## 状态：✅ 已实现（mock 保存逻辑）

## 实现要点

- TopBar：返回 + 右侧"保存"按钮
- 元信息 chips（点击添加/删除）：
  - 日期（自动填今天）
  - 天气（弹出 ActionSheet 选）
  - 心情（同上）
  - 位置（同上）
- TextField 风格标题输入（无边框，最大 50 字）
- TextArea 正文（minHeight 280 / maxHeight 600，showCount + maxLength 5000）
- EditorToolbar 底部工具栏（13 个工具）
- KeyboardAvoidingView 适配键盘
- 保存逻辑：内容为空 → toast.error；否则 toast.success → 返回

## 整合的组件

| 组件          | 用途               |
| ------------- | ------------------ |
| TopBar        | 头部 + 保存按钮    |
| TextArea      | 正文编辑           |
| EditorToolbar | 格式化工具栏       |
| ActionSheet   | 天气/心情/位置选择 |
| Icon          | chip 图标          |
| Toast         | 操作反馈           |

## 路由

```typescript
// 从 HomeScreen FAB
navigation.navigate(ROUTES.DIARY_EDIT, {})

// 从 DiaryView 编辑
navigation.navigate(ROUTES.DIARY_EDIT, { id: diary.id })
```

## 后续 TODO

1. 接入数据库（替换 mock MOCK_DIARY_EDIT）
2. 真实的图片选择器 / 录音 / 链接
3. 富文本格式化（Markdown / HTML）
4. 自动保存草稿
5. 退出确认弹窗（未保存内容时）
