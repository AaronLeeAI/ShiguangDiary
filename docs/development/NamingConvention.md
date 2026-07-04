# Naming Convention

> 命名约定

## 1. 通用规则

| 类型 | 规则 | 示例 |
|------|------|------|
| 变量名 | 语义化，避免缩写 | `userName` ✅, `un` ❌ |
| 函数名 | 动词开头 | `getUser`, `handlePress` |
| 类型名 | 名词 | `User`, `DiaryCardProps` |
| 常量 | 业务常量用 camelCase，全局配置用 UPPER_SNAKE | `routes`, `MAX_LENGTH` |
| 事件回调 | `on<Event>` 前缀 | `onPress`, `onChange` |
| 私有函数 | `_` 前缀（不强制） | `_handlePress` |

## 2. React 组件命名

### 2.1 组件文件

```
DiaryCard/
├── DiaryCard.tsx        # 组件实现
├── types.ts             # 类型
├── styles.ts            # 样式
└── index.ts             # 入口
```

### 2.2 Props 接口

```typescript
// ✅ 组件名 + Props
export interface DiaryCardProps { ... }

// ❌ 仅 Props（多个组件会冲突）
export interface Props { ... }
```

### 2.3 Hook 命名

```typescript
// ✅ use 前缀 + 语义
export const useTheme = () => { ... };
export const useDiaryList = () => { ... };
```

### 2.4 Context 命名

```typescript
// Provider 与 Hook 分开
export const ThemeProvider: React.FC = ...;
export const useTheme = (): Theme => ...;
```

## 3. 业务命名

### 3.1 业务模型

- Diary（单条日记）
- Notebook（日记本）
- Album（相册）
- Tag（标签）
- Attachment（附件）
- User（用户）

### 3.2 业务操作

- `createXxx`：创建
- `updateXxx`：更新
- `removeXxx` 或 `deleteXxx`：删除
- `fetchXxx`：拉取（远程）
- `loadXxx`：加载（本地）
- `getXxx`：获取（同步）
- `setXxx`：设置
- `toggleXxx`：切换

## 4. Store / State 命名

### 4.1 Store 文件

```
store/
├── userStore.ts
├── diaryStore.ts
├── notebookStore.ts
```

### 4.2 State 字段

- 集合：`xxxList` 或 `xxxMap`
- 单个：`xxxItem` 或 `currentXxx`
- 加载状态：`isLoading`, `isError`
- 分页：`page`, `pageSize`, `hasMore`

## 5. API 命名

### 5.1 RESTful 风格

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | GET | `/diaries` |
| 详情 | GET | `/diaries/:id` |
| 创建 | POST | `/diaries` |
| 更新 | PUT | `/diaries/:id` |
| 删除 | DELETE | `/diaries/:id` |

### 5.2 函数命名

```typescript
diaryRepository.list();
diaryRepository.findById(id);
diaryRepository.create(data);
diaryRepository.update(id, data);
diaryRepository.remove(id);
```

## 6. 数据库命名

### 6.1 表名

- 单数名词，小写：`diary`, `notebook`, `album`
- 关联表：`<a>_<b>`：`diary_tag`

### 6.2 字段

- 小写蛇形：`created_at`, `is_pinned`
- 外键：`<table>_id`：`notebook_id`
- 时间：`created_at`, `updated_at`, `deleted_at`

## 7. 资源文件命名

### 7.1 图标

```
ic_<purpose>_<variant>.<ext>
ic_back.svg
ic_search_active.svg
```

### 7.2 图片

```
img_<category>_<purpose>.<ext>
img_empty_diary.png
img_avatar_default.png
```

### 7.3 字体

```
font_<family>_<weight>.<ext>
font_NotoSansCJK_Regular.ttf
```

### 7.4 动画

```
anim_<purpose>.<ext>
anim_loading.json
```

### 7.5 音频

```
audio_<purpose>.<ext>
audio_click.mp3
```

## 8. Git 命名

### 8.1 分支名

```
<type>/<short-desc>
feat/diary-card
fix/calendar-render
refactor/database
```

### 8.2 提交信息

```
<type>: <description>
```

- `feat`：新功能
- `fix`：修复 bug
- `refactor`：重构
- `docs`：文档
- `test`：测试
- `chore`：杂项

## 9. 路由命名

- 大驼峰：`Home`, `DiaryView`
- 常量：UPPER_SNAKE
  ```typescript
  export const ROUTES = {
    HOME: 'Home',
    DIARY_VIEW: 'DiaryView',
  };
  ```