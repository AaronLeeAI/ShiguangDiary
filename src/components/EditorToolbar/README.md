# EditorToolbar - 编辑器工具栏

> 日记编辑器底部工具栏：格式化 / 媒体 / 元信息 / 其他。

## 状态：✅ 已实现

## 实现要点

- 横向 ScrollView 滚动容器
- 13 个默认工具按钮（按视觉顺序）：
  - **格式化**：bold / italic / underline / strikethrough / quote
  - **媒体**：image / mic / link
  - **元信息**：location / weather / mood
  - **其他**：tag / lock
- 激活态视觉：`activeTools` 数组中的工具显示品牌色图标 + primaryGhost 背景
- 按下态：subtle 灰背景
- 无障碍：`accessibilityRole="button"` + `accessibilityState.selected`

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| onToolPress | `(tool) => void` | - | 工具点击回调 |
| activeTools | `EditorTool[]` | `[]` | 当前激活的工具 |
| tools | `EditorToolItem[]` | `DEFAULT_EDITOR_TOOLS` | 自定义工具列表 |

## 类型

```typescript
type EditorTool =
  | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'quote'
  | 'image' | 'mic' | 'link'
  | 'location' | 'weather' | 'mood'
  | 'tag' | 'lock';
```

## 使用示例

```tsx
import {EditorToolbar} from '@/components/EditorToolbar';

const [active, setActive] = useState<EditorTool[]>(['bold']);

<EditorToolbar
  activeTools={active}
  onToolPress={(tool) => {
    // 切换激活态
    setActive(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
    // 或执行业务：插入图片、选择位置等
    if (tool === 'image') openImagePicker();
    if (tool === 'location') openLocationPicker();
  }}
/>
```

## 目录结构

```
EditorToolbar/
├── EditorToolbar.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```