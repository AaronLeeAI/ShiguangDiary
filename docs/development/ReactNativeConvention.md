# React Native Convention

> React Native 开发规范

## 1. 组件基础

### 1.1 函数组件

```typescript
export const Component: React.FC<Props> = ({prop1, prop2}) => {
  return <View>...</View>;
};
```

### 1.2 不要在组件外定义组件

```typescript
// ❌ 错误
const InnerView = () => <Text>Hi</Text>;
const Outer = () => <InnerView />;

// ✅ 正确：提到外部定义
const InnerView: React.FC = () => <Text>Hi</Text>;
const Outer: React.FC = () => <InnerView />;
```

### 1.3 Props 解构

```typescript
// ✅ 推荐
const Component = ({name, age}: Props) => ...;

// 允许
const Component = (props: Props) => <Text>{props.name}</Text>;
```

## 2. Hooks 使用

### 2.1 规则

- 顶层调用（不在条件/循环中）
- 仅在 React 函数中调用
- 使用 ESLint 规则强制

### 2.2 常用 Hooks

| Hook          | 用途           |
| ------------- | -------------- |
| `useState`    | 本地状态       |
| `useEffect`   | 副作用         |
| `useMemo`     | 缓存计算       |
| `useCallback` | 缓存回调       |
| `useRef`      | 引用           |
| `useContext`  | Context        |
| `useTheme`    | 主题（自定义） |

### 2.3 自定义 Hook

命名：`useXxx`

```typescript
export const useDiaryList = (notebookId?: string) => {
  const [list, setList] = useState<Diary[]>([]);
  useEffect(() => { ... }, [notebookId]);
  return {list, refresh: () => { ... }};
};
```

## 3. 样式

### 3.1 StyleSheet vs 内联

```typescript
// ✅ 推荐：StyleSheet
const styles = StyleSheet.create({
  container: {padding: 16},
});
<View style={styles.container} />

// 允许：动态内联（少量）
<View style={[styles.container, isActive && styles.active]} />

// ❌ 避免：大量内联
<View style={{padding: 16, margin: 8, backgroundColor: '#FFF'}} />
```

### 3.2 主题访问

```typescript
import {useTheme} from '@theme';

const Component = () => {
  const theme = useTheme();
  return <View style={{backgroundColor: theme.colors.semantic.bg.canvas}} />;
};
```

### 3.3 严禁

- 硬编码颜色：`#FFF`
- 硬编码间距：`16`
- 硬编码字号：`12`

必须使用 `@theme` 提供的 Token。

## 4. 列表

### 4.1 使用 FlashList

```typescript
import {FlashList} from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({item}) => <DiaryCard item={item} />}
  keyExtractor={item => item.id}
  estimatedItemSize={120}
/>
```

### 4.2 必需

- `keyExtractor`
- `estimatedItemSize`
- `getItemLayout`（固定高度时）

## 5. 性能

### 5.1 避免内联对象

```typescript
// ❌ 每次渲染创建新对象
<View style={{padding: 16}} />

// ✅ 使用 StyleSheet
const styles = StyleSheet.create({box: {padding: 16}});
<View style={styles.box} />
```

### 5.2 避免匿名函数

```typescript
// ❌
<Button onPress={() => doSomething(id)} />

// ✅
const handlePress = useCallback(() => doSomething(id), [id]);
<Button onPress={handlePress} />
```

### 5.3 避免大列表优化

- 大量数据时使用分页
- 不在 render 中 filter / sort

## 6. 动画

### 6.1 Reanimated

```typescript
import Animated, {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';

const offset = useSharedValue(0);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{translateY: offset.value}],
}));

const handlePress = () => {
  offset.value = withSpring(100, {damping: 15});
};

<Animated.View style={animatedStyle} />
```

### 6.2 Layout 动画

```typescript
import Animated, {LinearTransition, FadeIn, FadeOut} from 'react-native-reanimated';

<Animated.View
  entering={FadeIn}
  exiting={FadeOut}
  layout={LinearTransition.springify()}
>
```

### 6.3 性能规则

- 使用 `useNativeDriver: true`
- 避免 layout 属性动画
- 避免 JS 线程动画
- 长列表用 `removeClippedSubviews`

## 7. 平台兼容

### 7.1 Platform.select

```typescript
import { Platform } from 'react-native'

const fontFamily = Platform.select({
  android: 'Roboto',
  ios: 'SF Pro',
  default: 'System',
})
```

### 7.2 平台特定代码

```
Component.android.tsx
Component.ios.tsx
Component.tsx (default)
```

## 8. 资源

### 8.1 引入资源

```typescript
// 静态资源（自动 require）
import logo from '@assets/images/logo.png';
<Image source={logo} />

// 动态资源（运行时）
<Image source={{uri: item.cover}} />
```

### 8.2 图片优化

- 使用 WebP
- 使用 react-native-fast-image
- 多分辨率时提供 @2x, @3x 版本

## 9. 导航

```typescript
import { useNavigation } from '@react-navigation/native'

const navigation =
  useNavigation<NativeStackNavigationProp<RootStackParamList>>()

navigation.navigate('DiaryView', { id: '123' })
```

## 10. 状态管理

### 10.1 服务端状态

使用 React Query：

```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['diaries', id],
  queryFn: () => apiClient.get(`/diaries/${id}`),
})
```

### 10.2 客户端状态

使用 Zustand：

```typescript
import { useUserStore } from '@store'

const user = useUserStore(state => state.user)
const login = useUserStore(state => state.login)
```

## 11. 测试

```typescript
import {render, fireEvent} from '@testing-library/react-native';
import {DiaryCard} from './DiaryCard';

describe('DiaryCard', () => {
  it('renders correctly', () => {
    const {getByText} = render(<DiaryCard item={mockDiary} />);
    expect(getByText(mockDiary.title)).toBeTruthy();
  });
});
```
