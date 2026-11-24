# Assets Catalog

Project: 拾光日记（Shiguang Diary）

Last Updated: 2026-07-04

---

## Purpose

记录整个项目所有静态资源（图片、图标、字体、动画、音频）的目录与索引。

所有新增资源必须在本文档中登记，禁止直接引用 APK 拆包目录。

---

## Pipeline

### 单文件资源

```
src/assets/
├── index.ts            # 统一资源索引
├── font.ts             # 字体注册表
├── icons/              # SVG Icon 组件
│   ├── index.tsx
│   ├── CloseIcon.tsx
│   ├── BackIcon.tsx
│   └── ...
├── svg/                # 原始 SVG 资源
│   └── index.ts
├── font/               # 自定义字体 (ttf / otf)
├── images/             # 位图 (PNG / JPG / WebP)
│   ├── splash/         # 启动图
│   └── content/        # 业务图片（默认封面、默认头像）
├── animations/         # Lottie JSON / 动画
├── audio/              # 音频 (mp3 / wav)
└── placeholder/        # 空状态占位图
```

### 资源引用方式

```ts
// 正确
import { images, icons } from '@assets'

// 错误 - 禁止使用相对路径
import logo from '../assets/images/logo.png'
```

---

## Resources

### Icons (SVG Components)

UI 图标通过 `@components/Icon` 提供（`src/components/Icon/paths.ts`），支持：

- 40+ 主题感知的 SVG 图标（Material Design 路径）
- `size` / `color` / `variant` 三种参数
- 与 Theme 自动集成（默认颜色来自 `theme.colors.semantic.icon.primary`）

```ts
import {Icon} from '@components';

<Icon name="add" />
<Icon name="check" size="lg" color={theme.colors.brand.primary} />
<Icon name="hourglass" variant="filled" />
```

详见 `src/components/Icon/README.md`。

### Placeholder Images

| Key                                | 用途       | 路径                                    |
| ---------------------------------- | ---------- | --------------------------------------- |
| `images.placeholder.emptyDiary`    | 空日记列表 | `@assets/placeholder/emptyDiary.png`    |
| `images.placeholder.emptyNotebook` | 空笔记本   | `@assets/placeholder/emptyNotebook.png` |
| `images.placeholder.emptyAlbum`    | 空相册     | `@assets/placeholder/emptyAlbum.png`    |
| `images.placeholder.emptySearch`   | 搜索无结果 | `@assets/placeholder/emptySearch.png`   |
| `images.placeholder.emptyDraft`    | 空草稿     | `@assets/placeholder/emptyDraft.png`    |
| `images.placeholder.emptyRecycle`  | 空回收站   | `@assets/placeholder/emptyRecycle.png`  |

### Content Images

| Key                            | 用途           | 路径                                |
| ------------------------------ | -------------- | ----------------------------------- |
| `images.content.coverDefault`  | 默认日记本封面 | `@assets/content/coverDefault.png`  |
| `images.content.avatarDefault` | 默认用户头像   | `@assets/content/avatarDefault.png` |

### Splash Images

| Key                       | 用途      | 路径                                  |
| ------------------------- | --------- | ------------------------------------- |
| `images.splash.logo`      | 启动 logo | `@assets/images/splash/logo.png`      |
| `images.splash.hourglass` | 启动沙漏  | `@assets/images/splash/hourglass.png` |

### Fonts

| Key | Family                               | Weight    | Status |
| --- | ------------------------------------ | --------- | ------ |
| -   | 系统默认字体（PingFang/NotoSansCJK） | 400 / 700 | Active |

> 应用默认采用系统字体，无需额外注册。后续若引入自定义字体，在 `src/assets/font.ts` 的 `FONT_LIST` 中注册。

### Animations

| Key                          | 用途         | 格式        | Status  |
| ---------------------------- | ------------ | ----------- | ------- |
| `animations.loadingArc`      | 加载动画     | Lottie JSON | Pending |
| `animations.splashHourglass` | 启动沙漏动画 | Lottie JSON | Pending |
| `animations.emptyHourglass`  | 空状态沙漏   | Lottie JSON | Pending |

### Audio

| Key | 用途               | Status  |
| --- | ------------------ | ------- |
| -   | UI 反馈音 / 提示音 | Pending |

> 当前未启用任何音频资源。如需添加，在 `src/assets/audio/` 放置文件后，通过 `src/assets/index.ts` 注册。

---

## Migration Status

| Source                                 | Target                          | Status                                |
| -------------------------------------- | ------------------------------- | ------------------------------------- |
| APK `res/*.png` (777 files)            | `src/assets/images/`            | Pending (deferred)                    |
| APK `res/*.jpg` (43 files)             | `src/assets/images/`            | Pending (deferred)                    |
| APK `res/*.xml` (740 files, 含 vector) | `src/assets/svg/` 或 React 组件 | Pending (deferred)                    |
| Custom SVG icons                       | `@components/Icon/paths.ts`     | Done (40+ icons shipped, theme-aware) |

> APK 中所有图片资源使用混淆短名（如 `_U.9.png`），需要按 Rename_Suggestion.md 映射为语义命名。完整迁移为多 Task 工作，本 Task 仅建立 Pipeline 与种子图标。

---

## Adding a New Resource

1. 将资源文件放入对应的子目录。
2. 更新 `src/assets/index.ts` 添加对应 require / 注册。
3. 在本文档的对应表格中添加一行。
4. 提交 Git（commit 格式：`feat(assets): add <name>`）。

### 示例：添加一个新图标

```ts
// 1. 文件位置
src / assets / icons / FilterIcon.tsx

// 2. 在 icons/index.tsx 中 export
export { FilterIcon } from './FilterIcon'

// 3. 在 iconMap 中注册
iconMap.filter = FilterIcon

// 4. 在本文档的 Icons 表格中添加一行
```

### 示例：添加一张图片

```ts
// 1. 文件位置
src/assets/images/splash/onboarding-1.png

// 2. 在 index.ts 中 require
splashImages.onboarding1 = resolveAsset('images', 'splash', 'onboarding-1');

// 3. 在本文档的 Splash Images 表格中添加一行
```

---

## References

- 设计规范：`docs/project-设计-docs/`
- APK 反编译文档：`docs/apk-analysis-docs/`
- 重命名建议：`docs/apk-analysis-docs/Rename_Suggestion.md`
- 命名规范：`docs/assets/NamingConvention.md`
