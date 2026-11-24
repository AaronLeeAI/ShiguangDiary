# Resource Naming Convention

Project: 拾光日记（Shiguang Diary）

Last Updated: 2026-07-04

---

## Purpose

统一项目所有静态资源的命名规则，确保长期可维护、可搜索、可追溯。

---

## General Rules

### 1. Lowercase + Underscore

所有文件名使用 **小写字母 + 下划线**。禁止驼峰、禁止空格、禁止中文。

```
✓ img_empty_diary.png
✗ EmptyDiary.png
✗ empty diary.png
✗ 空日记.png
```

### 2. Semantic Naming

文件名称必须能够表达其真实用途。禁止使用泛化或临时命名。

```
✓ calendar_add.png
✓ home_background.webp
✓ empty_diary.png
✓ user_avatar_placeholder.png

✗ ic001.png
✗ img2.png
✗ new.png
✗ final.png
```

### 3. No Conflicts

同一类型资源不得重名。不同分辨率（@1x/@2x/@3x）使用同一文件名，React Native 自动选择。

### 4. English Only

所有文件名必须使用英文（包含业务领域英文词汇）。业务术语可使用中文拼音或英文释义，但不得直接使用汉字。

---

## File Naming Format

```
<prefix>_<category>_<purpose>[_<variant>].<ext>
```

| Segment  | Required | Description                                |
| -------- | -------- | ------------------------------------------ |
| prefix   | Yes      | 资源类型前缀                               |
| category | Optional | 子分类                                     |
| purpose  | Yes      | 用途，必须能表达真实语义                   |
| variant  | Optional | 状态 / 尺寸 / 颜色变体                     |
| ext      | Yes      | 文件扩展名（png / svg / ttf / json / mp3） |

---

## Prefix Reference

### Images (`img_`)

位图资源（PNG / JPG / WebP）。

| Prefix              | Category                | Example                                 |
| ------------------- | ----------------------- | --------------------------------------- |
| `img_placeholder_`  | 空状态占位              | `img_placeholder_empty_diary.png`       |
| `img_splash_`       | 启动 / 闪屏             | `img_splash_logo.png`                   |
| `img_content_`      | 业务图片（封面 / 头像） | `img_content_cover_default.png`         |
| `img_banner_`       | 横幅 / Banner           | `img_banner_promotion.png`              |
| `img_illustration_` | 插图                    | `img_illustration_onboarding_step1.png` |

### Backgrounds (`bg_`)

仅作为背景使用的图片。

| Example                  | Description    |
| ------------------------ | -------------- |
| `bg_card_default.png`    | 卡片默认背景   |
| `bg_dialog_modal.png`    | 弹窗背景       |
| `bg_splash_gradient.png` | 启动页渐变背景 |

### Icons (`ic_`)

UI 图标。一般建议优先使用 `src/assets/icons/` 下的 React 组件。

| Example                | Description   |
| ---------------------- | ------------- |
| `ic_back.png`          | 返回按钮      |
| `ic_search_active.png` | 搜索选中态    |
| `ic_close_24.png`      | 24dp 关闭图标 |
| `ic_close_white.png`   | 白色关闭图标  |

### Fonts (`font_`)

字体文件。

| Example                        | Description           |
| ------------------------------ | --------------------- |
| `font_NotoSansCJK_Regular.ttf` | Noto Sans CJK Regular |
| `font_NotoSansCJK_Bold.ttf`    | Noto Sans CJK Bold    |

### Animations (`anim_`)

动画资源（Lottie JSON / 帧序列）。

| Example                      | Description  |
| ---------------------------- | ------------ |
| `anim_loading_arc.json`      | 加载圆弧动画 |
| `anim_splash_hourglass.json` | 启动沙漏     |
| `anim_empty_hourglass.json`  | 空状态沙漏   |

### Audio (`audio_`)

音频资源。

| Example              | Description |
| -------------------- | ----------- |
| `audio_click.mp3`    | 点击音效    |
| `audio_success.wav`  | 成功提示音  |
| `audio_bg_music.m4a` | 背景音乐    |

### Vector / SVG (`svg_`)

原始 SVG 文件。

| Example          | Description    |
| ---------------- | -------------- |
| `svg_close.svg`  | 关闭图标源文件 |
| `svg_search.svg` | 搜索图标源文件 |

### Logo / Brand

| Example               | Description |
| --------------------- | ----------- |
| `logo_primary.svg`    | 主 Logo     |
| `logo_horizontal.png` | 横向 Logo   |

---

## Variant Naming

使用下划线分隔的英文状态名 / 数值。

### 状态变体

| Suffix      | 含义                       |
| ----------- | -------------------------- |
| `_active`   | 选中 / 激活                |
| `_pressed`  | 按下                       |
| `_disabled` | 禁用                       |
| `_focused`  | 聚焦                       |
| `_default`  | 默认（可选，省略时即默认） |
| `_inverse`  | 反色（用于深色背景）       |

### 尺寸变体

| Suffix | 含义 |
| ------ | ---- |
| `_16`  | 16dp |
| `_24`  | 24dp |
| `_32`  | 32dp |
| `_48`  | 48dp |

> 注意：React Native 推荐使用单一资源 + 样式控制尺寸。仅在以下情况使用尺寸变体：
>
> - 不同尺寸需要不同细节（如 16dp 简化为单色，48dp 保留多色）
> - 性能要求极高，需要预渲染位图

### 颜色变体

| Suffix       | 含义     |
| ------------ | -------- |
| `_white`     | 纯白     |
| `_black`     | 纯黑     |
| `_primary`   | 品牌主色 |
| `_secondary` | 次要色   |

> 优先使用 SVG 组件 + `color` 参数；位图仅在必要时使用颜色变体。

---

## Multi-resolution

React Native 通过文件名自动选择对应分辨率资源，无需在文件名中标注 `@1x` / `@2x` / `@3x`。

```
// 仅放一份即可，React Native 自动处理不同 DPI
src/assets/images/splash/logo.png
```

如需提供多份：

```
src/assets/images/splash/
├── logo.png         # 标准
├── logo@2x.png      # 高分辨率
└── logo@3x.png      # 超高分辨率
```

---

## Directory Layout

资源按 **类别** 一级目录划分；同一类别下可继续按 **用途** 子目录划分。

```
src/assets/
├── icons/                  # UI 图标 (SVG React 组件)
├── svg/                    # 原始 SVG 文件
├── font/                   # 字体 (ttf / otf)
├── animations/             # Lottie JSON / 动画
├── audio/                  # 音频 (mp3 / wav)
├── images/
│   ├── splash/             # 启动图
│   └── content/            # 业务图片（封面、头像等）
├── illustrations/          # 插画
├── avatar/                 # 头像相关
├── logo/                   # Logo
└── placeholder/            # 空状态 / 占位
```

> 禁止将所有图片放入同一目录。

---

## Asset Index

所有资源必须通过 `src/assets/index.ts` 暴露。

```ts
// 正确
import { images, icons } from '@assets'

// 错误
const logo = require('../assets/images/splash/logo.png')
```

详见 `AssetsCatalog.md`。

---

## Migration From APK

从 `参考/日记云笔记官方apk拆包/res/` 迁移资源到 `src/assets/` 时：

1. **Rename**: 使用 `docs/apk-analysis-docs/Rename_Suggestion.md` 中的语义名称。
2. **Reformat**: VectorDrawable (XML) → React Native SVG Component (`src/assets/icons/*.tsx`)。
3. **Optimize**: PNG / JPG → WebP（如适用），压缩到合理大小。
4. **Catalog**: 更新 `AssetsCatalog.md`。
5. **Verify**: TypeScript 编译通过 + Metro 打包成功。

---

## Anti-patterns

| ❌ Bad           | ✓ Good                            | Reason                |
| ---------------- | --------------------------------- | --------------------- |
| `image1.png`     | `img_placeholder_empty_diary.png` | 不表达用途            |
| `ic001.png`      | `ic_back.png`                     | 不表达用途            |
| `IMG_BACK.PNG`   | `ic_back.png`                     | 不符合 lowercase 规范 |
| `close icon.png` | `ic_close.png`                    | 不允许空格            |
| `新建文件.png`   | `img_new_document.png`            | 不允许中文            |

---

## References

- APK 反编译文档：`docs/apk-analysis-docs/`
- 重命名建议：`docs/apk-analysis-docs/Rename_Suggestion.md`
- 资源索引：`AssetsCatalog.md`
