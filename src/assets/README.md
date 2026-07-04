# Assets 目录

本目录用于存放应用静态资源（图片、图标、字体、动画、音频）。

## 目录结构

```
assets/
├── images/         # 位图资源（PNG/JPG/WebP）
│   ├── splash/     # 启动图
│   ├── content/    # 业务图片（默认封面、默认头像）
│   └── placeholder/# 空状态/占位图
├── icons/          # UI 图标（SVG/PNG）
├── svg/            # 原始 SVG 文件
├── font/           # 自定义字体（ttf/otf）
├── animations/     # Lottie 动画 JSON
├── audio/          # 音频（mp3/wav）
└── ...
```

## 命名规范

| 类别 | 前缀 | 示例 |
|------|------|------|
| 图片 | `img_` | `img_empty_diary.png` |
| 图标 | `ic_` | `ic_back.svg`, `ic_search_active.svg` |
| 背景 | `bg_` | `bg_card_default.png` |
| 字体 | `font_` | `font_NotoSansCJK_Regular.ttf` |
| 动画 | `anim_` | `anim_loading.json` |
| 音频 | `audio_` | `audio_click.mp3` |

格式：`<prefix>_<category>_<purpose>[_<variant>].<ext>`

## 使用方式

统一通过 `src/assets/index.ts` 引入：

```ts
import {images, icons} from '@assets';

// 或直接使用
import icons from '@assets';
```

## 当前状态

本目录在 Task1 阶段仅建立空目录与 `.gitkeep`。  
真正的资源将在后续 Task 中按设计稿补充。  
统一通过 `require('@assets/...')` 引用——TypeScript 类型由 `@assets/index.ts` 提供。

⚠️ 注意：当前 `index.ts` 中的 require 调用在资源文件未生成时会报错。  
当资源到位后，请删除 `.gitkeep` 占位文件并保持 `index.ts` 与实际文件一致。