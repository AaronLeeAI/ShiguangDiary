/**
 * Assets - 统一导出
 *
 * 命名规范（与 docs/apk-analysis-docs/NamingConvention.md 对齐）：
 *   - 图片：img_<category>_<purpose>.<ext>
 *   - 图标：ic_<purpose>_<variant>.<ext>
 *   - 背景：bg_<purpose>.<ext>
 *   - 字体：font_<family>_<weight>.<ext>
 *   - 动画：anim_<purpose>.<ext>
 *   - 音频：audio_<purpose>.<ext>
 *
 * 当前 Task1 阶段：仅声明结构，实际资源文件将在后续 Task 中按设计稿补充。
 * 为避免 Metro 打包时找不到资源文件，所有 require 暂时包裹在条件分支中。
 * 资源就绪后取消注释。
 */

// ============ 类型声明 ============

export interface AssetImages {
  placeholder: {
    emptyDiary: number | null;
    emptyNotebook: number | null;
    emptyAlbum: number | null;
    emptySearch: number | null;
    emptyDraft: number | null;
    emptyRecycle: number | null;
  };
  splash: {
    logo: number | null;
    hourglass: number | null;
  };
  content: {
    coverDefault: number | null;
    avatarDefault: number | null;
  };
}

export interface AssetIcons {
  [key: string]: number | null;
}

export interface AssetFonts {
  [key: string]: number | null;
}

export interface AssetAnimations {
  [key: string]: number | null;
}

export interface AssetAudio {
  [key: string]: number | null;
}

export interface Assets {
  images: AssetImages;
  icons: AssetIcons;
  fonts: AssetFonts;
  animations: AssetAnimations;
  audio: AssetAudio;
}

// ============ 占位实现 ============

/**
 * 占位数据：资源就绪后，将此函数改为实际 require。
 *
 * 使用方式：
 *   资源就绪前：const logo = getAsset('images', 'splash', 'logo');
 *   资源就绪后：直接用 `assets.images.splash.logo`。
 */
function getAsset(_category: string, ..._keys: string[]): number | null {
  // TODO: 资源就绪后改为实际 require 返回
  return null;
}

export const images: AssetImages = {
  placeholder: {
    emptyDiary: getAsset('images', 'placeholder', 'emptyDiary'),
    emptyNotebook: getAsset('images', 'placeholder', 'emptyNotebook'),
    emptyAlbum: getAsset('images', 'placeholder', 'emptyAlbum'),
    emptySearch: getAsset('images', 'placeholder', 'emptySearch'),
    emptyDraft: getAsset('images', 'placeholder', 'emptyDraft'),
    emptyRecycle: getAsset('images', 'placeholder', 'emptyRecycle'),
  },
  splash: {
    logo: getAsset('images', 'splash', 'logo'),
    hourglass: getAsset('images', 'splash', 'hourglass'),
  },
  content: {
    coverDefault: getAsset('images', 'content', 'coverDefault'),
    avatarDefault: getAsset('images', 'content', 'avatarDefault'),
  },
};

export const icons: AssetIcons = {
  // 导航类
  back: null,
  close: null,
  more: null,
  chevronLeft: null,
  chevronRight: null,
  chevronDown: null,
  chevronUp: null,
  // 操作类
  add: null,
  edit: null,
  delete: null,
  check: null,
  save: null,
  share: null,
  search: null,
  filter: null,
  sort: null,
  drag: null,
  // 工具栏
  bold: null,
  italic: null,
  underline: null,
  strikethrough: null,
  listLeft: null,
  listCenter: null,
  quote: null,
  indent: null,
  alignCenter: null,
  fontSizeDown: null,
  fontSizeUp: null,
  textUpper: null,
  textStyle: null,
  textColor: null,
  // 多媒体
  camera: null,
  image: null,
  imageText: null,
  mic: null,
  link: null,
  headphone: null,
  // 时间/提醒
  bell: null,
  clock: null,
  calendar: null,
  location: null,
  weather: null,
  // 设置/统计
  settings: null,
  tune: null,
  recycle: null,
  doc: null,
  export: null,
  moon: null,
  chart: null,
  crown: null,
  tag: null,
  flag: null,
  hourglass: null,
  swap: null,
  // 业务
  list: null,
  book: null,
  bookshelf: null,
  album: null,
  profile: null,
  addBook: null,
  bookmark: null,
  trash: null,
  lock: null,
  // Tab 选中态
  listActive: null,
  bookActive: null,
  albumActive: null,
  profileActive: null,
};

export const fonts: AssetFonts = {
  // 自定义字体未来在此处 require：
  // notoSansCJKRegular: require('@assets/font/NotoSansCJK-Regular.ttf'),
};

export const animations: AssetAnimations = {
  loadingArc: null,
  splashHourglass: null,
  emptyHourglass: null,
};

export const audio: AssetAudio = {
  // click: null,
  // success: null,
};

const assets: Assets = {
  images,
  icons,
  fonts,
  animations,
  audio,
};

export default assets;