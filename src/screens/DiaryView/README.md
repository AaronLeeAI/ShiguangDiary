# DiaryView Screen - 日记详情页

> 从 DiaryCard 点击进入的日记详情页：完整日记内容 + 元信息 + 操作菜单。

## 状态：✅ 已实现（mock 数据，待接入数据库）

## 实现要点

- TopBar：返回按钮 + 右侧 more 图标
- ScrollView 展示：
  - 头部：日期 + 置顶/加密徽章
  - 标题（如有）
  - 正文 / **加密遮罩**（解锁前显示锁图标 + PrimaryButton "解锁"）
  - 元信息：天气 / 地点 / 心情
- ActionSheet（more 按钮触发）：
  - 编辑（→ DiaryEdit）
  - 置顶/取消置顶
  - 分享
  - 删除（destructive 红色）
- Toast：操作反馈
- 路由：从 HomeScreen `DiaryCard.onPress` → `navigation.navigate('DiaryView', {id})`

## 整合的组件

| 组件 | 用途 |
|------|------|
| TopBar | 头部导航 |
| ActionSheet | 更多操作菜单 |
| PrimaryButton | 解锁加密日记 |
| Loading | 加载态 |
| Icon | 各处图标 |
| Toast | 操作反馈（静态 API） |

## 路由

```typescript
// HomeScreen.tsx
navigation.navigate(ROUTES.DIARY_VIEW, {id: diary.id});
```

## 后续 TODO

1. 接入数据库（替换 MOCK_DIARY）
2. 解锁逻辑：接入手势密码/PIN
3. 分享：生成图片或文本分享
4. 编辑器集成（DiaryEdit）