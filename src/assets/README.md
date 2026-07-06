# Assets 目录

本目录用于存放应用静态资源（图片、图标、字体、动画、音频），并通过 `src/assets/index.ts` 提供统一资源索引。

## 目录结构

```
src/assets/
├── animations/     # Lottie 动画 JSON
├── audio/          # 音频（mp3/wav）
├── font/           # 自定义字体（ttf/otf）
├── images/         # 位图资源（PNG/JPG/WebP）
├── placeholder/    # 空状态/占位图
├── svg/            # SVG 入口与原始 SVG
├── font.ts         # 字体注册表
└── index.ts        # 统一资源索引
```

## 命名规范

| 类别 | 前缀     | 示例                                  |
| ---- | -------- | ------------------------------------- |
| 图片 | `img_`   | `img_empty_diary.png`                 |
| 图标 | `ic_`    | `ic_back.svg`, `ic_search_active.svg` |
| 背景 | `bg_`    | `bg_card_default.png`                 |
| 字体 | `font_`  | `font_NotoSansCJK_Regular.ttf`        |
| 动画 | `anim_`  | `anim_loading.json`                   |
| 音频 | `audio_` | `audio_click.mp3`                     |

格式：`<prefix>_<category>_<purpose>[_<variant>].<ext>`。

## 使用方式

统一通过 `src/assets/index.ts` 引入：

```ts
import assets, { images, icons } from '@assets'
```

资源解析必须经过 `resolveAsset(category, ...keys)`，不得在业务页面中直接写散落的相对路径。

## 当前状态

✅ **资源索引已建立** — `index.ts` 已定义图片、图标、字体、动画、音频的类型和统一导出。

- 当前仓库尚未放入真实二进制资源时，`resolveAsset()` 会安全返回 `null`，不会因为资源缺失导致 TypeScript 或 Jest 崩溃。
- 真实素材到位后，只需按命名规范放入对应目录，并保持 `index.ts` 键名与文件用途一致。
- 自定义字体通过 `font.ts` 的 `FONT_LIST` 注册；未放入字体文件前保持空数组是安全状态。
