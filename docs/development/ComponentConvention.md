# Component Convention

> 组件开发规范

## 1. 组件分类

| 类别 | 说明 | 示例 |
|------|------|------|
| 展示组件 | 仅依赖 props，无状态 | `DiaryCard`, `TopBar` |
| 容器组件 | 连接 store / API | `DiaryListScreen` |
| 高阶组件 | 复用通用能力 | `withSafeArea`, `withTheme` |
| 业务组件 | 包含业务逻辑 | `SearchBar`, `DiaryEditor` |

## 2. 目录结构

每个组件一个目录：

```
DiaryCard/
├── DiaryCard.tsx        # 组件实现（必须）
├── types.ts             # Props / State / Ref（必须）
├── styles.ts            # 样式（必须）
├── index.ts             # 入口（必须）
├── README.md            # 说明（必须）
├── __tests__/           # 测试（推荐）
│   └── DiaryCard.test.tsx
└── components/          # 子组件（可选）
```

## 3. Props 规范

### 3.1 接口命名

```typescript
// 组件名 + Props
export interface DiaryCardProps {
  item: Diary;
  onPress?: () => void;
  style?: ViewStyle;
}
```

### 3.2 必填与可选

- 必填在前，可选在后
- 用 TypeScript `?:` 标识可选

```typescript
export interface PrimaryButtonProps {
  title: string;            // 必填
  onPress: () => void;      // 必填
  variant?: 'primary' | 'secondary'; // 可选
  disabled?: boolean;       // 可选
}
```

### 3.3 事件回调命名

- `on<Event>`：`onPress`, `onChange`
- `on<Event><Subject>`：`onItemPress`, `onTextChange`

### 3.4 默认值

```typescript
export const DiaryCard: React.FC<DiaryCardProps> = ({
  item,
  onPress,
  style,
  variant = 'primary',
}) => { ... };
```

## 4. 组件实现

### 4.1 函数组件优先

```typescript
// ✅ 推荐：函数组件
export const DiaryCard: React.FC<DiaryCardProps> = (props) => { ... };

// 避免：class 组件（除非必须）
```

### 4.2 拆分原则

- 单个组件 JSX 不超过 300 行
- 子组件超过 3 个时，单独提取

### 4.3 样式分离

```typescript
// styles.ts
import {StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@theme';

export const styles = StyleSheet.create({
  container: { ... },
});

// DiaryCard.tsx
import {styles} from './styles';
```

## 5. 受控 / 非受控

对于表单类组件：

```typescript
// 推荐：受控模式
export interface TextFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  defaultValue?: string;  // 非受控支持
}
```

## 6. Ref 转发

需要 ref 时使用 `forwardRef`：

```typescript
export const TextField = React.forwardRef<TextInput, TextFieldProps>((props, ref) => {
  return <TextInput ref={ref} {...props} />;
});
```

## 7. 性能优化

### 7.1 React.memo

纯展示组件使用 `React.memo`：

```typescript
export const DiaryCard = React.memo<DiaryCardProps>((props) => {
  return <View>...</View>;
});
```

### 7.2 useMemo / useCallback

谨慎使用，只在确实有效时使用。

## 8. 主题使用

组件中访问主题：

```typescript
import {useTheme} from '@theme';

export const DiaryCard: React.FC<Props> = (props) => {
  const theme = useTheme();
  return <View style={{backgroundColor: theme.colors.semantic.bg.card}} />;
};
```

**严禁**：在组件中硬编码颜色、间距、字号。

## 9. 文档

每个组件必须包含 README.md：

```markdown
# DiaryCard

> 日记卡片

## Props
...

## 使用示例
...

## 设计参考
- docs/project-设计-docs/components/DiaryCard.md
```

## 10. 测试

推荐但不强制：

- 渲染测试：基本渲染
- 交互测试：onPress 等回调
- 快照测试：组件结构

## 11. 国际化

文案必须从 `locales/` 引入（Task1 阶段可暂用中文硬编码，但预留 i18n 接口）。