/**
 * Assets Pipeline — Unified Resource Index
 *
 * 所有图片、图标、字体、动画、音频资源必须通过此文件引用。
 * 禁止在业务代码中直接使用 require() 或相对路径引用资源。
 *
 * 命名规范：
 *   - 图片：img_<category>_<purpose>.<ext>
 *   - 图标：ic_<purpose>_<variant>.<ext>
 *   - 背景：bg_<purpose>.<ext>
 *   - 字体：font_<family>_<weight>.<ext>
 *   - 动画：anim_<purpose>.<ext>
 *   - 音频：audio_<purpose>.<ext>
 */

import {Image} from 'react-native';

// ============ Types ============

export interface PlaceholderImages {
  emptyDiary: number | null;
  emptyNotebook: number | null;
  emptyAlbum: number | null;
  emptySearch: number | null;
  emptyDraft: number | null;
  emptyRecycle: number | null;
}

export interface SplashImages {
  logo: number | null;
  hourglass: number | null;
}

export interface ContentImages {
  coverDefault: number | null;
  avatarDefault: number | null;
}

export interface AssetImages {
  placeholder: PlaceholderImages;
  splash: SplashImages;
  content: ContentImages;
}

export interface AssetIcons {
  // Navigation
  back: number | null;
  close: number | null;
  more: number | null;
  chevronLeft: number | null;
  chevronRight: number | null;
  chevronDown: number | null;
  chevronUp: number | null;
  // Actions
  add: number | null;
  edit: number | null;
  delete: number | null;
  check: number | null;
  save: number | null;
  share: number | null;
  search: number | null;
  filter: number | null;
  sort: number | null;
  drag: number | null;
  // Toolbar
  bold: number | null;
  italic: number | null;
  underline: number | null;
  strikethrough: number | null;
  listLeft: number | null;
  listCenter: number | null;
  quote: number | null;
  indent: number | null;
  alignCenter: number | null;
  fontSizeDown: number | null;
  fontSizeUp: number | null;
  textUpper: number | null;
  textStyle: number | null;
  textColor: number | null;
  // Media
  camera: number | null;
  image: number | null;
  imageText: number | null;
  mic: number | null;
  link: number | null;
  headphone: number | null;
  // Time / Alerts
  bell: number | null;
  clock: number | null;
  calendar: number | null;
  location: number | null;
  weather: number | null;
  // Settings / Tools
  settings: number | null;
  tune: number | null;
  recycle: number | null;
  doc: number | null;
  export: number | null;
  moon: number | null;
  chart: number | null;
  crown: number | null;
  tag: number | null;
  flag: number | null;
  hourglass: number | null;
  swap: number | null;
  // Business
  list: number | null;
  book: number | null;
  bookshelf: number | null;
  album: number | null;
  profile: number | null;
  addBook: number | null;
  bookmark: number | null;
  trash: number | null;
  lock: number | null;
  // Tab active states
  listActive: number | null;
  bookActive: number | null;
  albumActive: number | null;
  profileActive: number | null;
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

// ============ Helpers ============

/**
 * Safely resolve an asset require() call.
 * Returns null if the file doesn't exist (avoids Metro build errors
 * before actual resource files are placed on disk).
 *
 * Usage: `resolveAsset('images', 'splash', 'logo')` → resolves `assets/images/splash/logo.png`
 */
export function resolveAsset(
  category: string,
  ...keys: string[]
): number | null {
  try {
    const moduleName = keys.join('/');
    return require(`@assets/${category}/${moduleName}.png`);
  } catch {
    // Fallback: try .webp
    try {
      const moduleName = keys.join('/');
      return require(`@assets/${category}/${moduleName}.webp`);
    } catch {
      return null;
    }
  }
}

// ============ Images ============

export const placeholderImages: PlaceholderImages = {
  emptyDiary: resolveAsset('placeholder', 'emptyDiary'),
  emptyNotebook: resolveAsset('placeholder', 'emptyNotebook'),
  emptyAlbum: resolveAsset('placeholder', 'emptyAlbum'),
  emptySearch: resolveAsset('placeholder', 'emptySearch'),
  emptyDraft: resolveAsset('placeholder', 'emptyDraft'),
  emptyRecycle: resolveAsset('placeholder', 'emptyRecycle'),
};

export const splashImages: SplashImages = {
  logo: resolveAsset('images', 'splash', 'logo'),
  hourglass: resolveAsset('images', 'splash', 'hourglass'),
};

export const contentImages: ContentImages = {
  coverDefault: resolveAsset('content', 'coverDefault'),
  avatarDefault: resolveAsset('content', 'avatarDefault'),
};

export const images: AssetImages = {
  placeholder: placeholderImages,
  splash: splashImages,
  content: contentImages,
};

// ============ Icons ============

export const icons: AssetIcons = {
  // Navigation
  back: resolveAsset('icons', 'navigation', 'back'),
  close: resolveAsset('icons', 'navigation', 'close'),
  more: resolveAsset('icons', 'navigation', 'more'),
  chevronLeft: resolveAsset('icons', 'navigation', 'chevronLeft'),
  chevronRight: resolveAsset('icons', 'navigation', 'chevronRight'),
  chevronDown: resolveAsset('icons', 'navigation', 'chevronDown'),
  chevronUp: resolveAsset('icons', 'navigation', 'chevronUp'),
  // Actions
  add: resolveAsset('icons', 'actions', 'add'),
  edit: resolveAsset('icons', 'actions', 'edit'),
  delete: resolveAsset('icons', 'actions', 'delete'),
  check: resolveAsset('icons', 'actions', 'check'),
  save: resolveAsset('icons', 'actions', 'save'),
  share: resolveAsset('icons', 'actions', 'share'),
  search: resolveAsset('icons', 'actions', 'search'),
  filter: resolveAsset('icons', 'actions', 'filter'),
  sort: resolveAsset('icons', 'actions', 'sort'),
  drag: resolveAsset('icons', 'actions', 'drag'),
  // Toolbar
  bold: resolveAsset('icons', 'toolbar', 'bold'),
  italic: resolveAsset('icons', 'toolbar', 'italic'),
  underline: resolveAsset('icons', 'toolbar', 'underline'),
  strikethrough: resolveAsset('icons', 'toolbar', 'strikethrough'),
  listLeft: resolveAsset('icons', 'toolbar', 'listLeft'),
  listCenter: resolveAsset('icons', 'toolbar', 'listCenter'),
  quote: resolveAsset('icons', 'toolbar', 'quote'),
  indent: resolveAsset('icons', 'toolbar', 'indent'),
  alignCenter: resolveAsset('icons', 'toolbar', 'alignCenter'),
  fontSizeDown: resolveAsset('icons', 'toolbar', 'fontSizeDown'),
  fontSizeUp: resolveAsset('icons', 'toolbar', 'fontSizeUp'),
  textUpper: resolveAsset('icons', 'toolbar', 'textUpper'),
  textStyle: resolveAsset('icons', 'toolbar', 'textStyle'),
  textColor: resolveAsset('icons', 'toolbar', 'textColor'),
  // Media
  camera: resolveAsset('icons', 'media', 'camera'),
  image: resolveAsset('icons', 'media', 'image'),
  imageText: resolveAsset('icons', 'media', 'imageText'),
  mic: resolveAsset('icons', 'media', 'mic'),
  link: resolveAsset('icons', 'media', 'link'),
  headphone: resolveAsset('icons', 'media', 'headphone'),
  // Time / Alerts
  bell: resolveAsset('icons', 'alerts', 'bell'),
  clock: resolveAsset('icons', 'alerts', 'clock'),
  calendar: resolveAsset('icons', 'time', 'calendar'),
  location: resolveAsset('icons', 'time', 'location'),
  weather: resolveAsset('icons', 'time', 'weather'),
  // Settings / Tools
  settings: resolveAsset('icons', 'settings', 'settings'),
  tune: resolveAsset('icons', 'settings', 'tune'),
  recycle: resolveAsset('icons', 'tools', 'recycle'),
  doc: resolveAsset('icons', 'tools', 'doc'),
  export: resolveAsset('icons', 'tools', 'export'),
  moon: resolveAsset('icons', 'tools', 'moon'),
  chart: resolveAsset('icons', 'tools', 'chart'),
  crown: resolveAsset('icons', 'tools', 'crown'),
  tag: resolveAsset('icons', 'tools', 'tag'),
  flag: resolveAsset('icons', 'tools', 'flag'),
  hourglass: resolveAsset('icons', 'tools', 'hourglass'),
  swap: resolveAsset('icons', 'tools', 'swap'),
  // Business
  list: resolveAsset('icons', 'business', 'list'),
  book: resolveAsset('icons', 'business', 'book'),
  bookshelf: resolveAsset('icons', 'business', 'bookshelf'),
  album: resolveAsset('icons', 'business', 'album'),
  profile: resolveAsset('icons', 'business', 'profile'),
  addBook: resolveAsset('icons', 'business', 'addBook'),
  bookmark: resolveAsset('icons', 'business', 'bookmark'),
  trash: resolveAsset('icons', 'business', 'trash'),
  lock: resolveAsset('icons', 'business', 'lock'),
  // Tab active states
  listActive: resolveAsset('icons', 'tab', 'listActive'),
  bookActive: resolveAsset('icons', 'tab', 'bookActive'),
  albumActive: resolveAsset('icons', 'tab', 'albumActive'),
  profileActive: resolveAsset('icons', 'tab', 'profileActive'),
};

// ============ Fonts ============

export const fonts: AssetFonts = {
  // 自定义字体在资源就绪后添加：
  // notoSansCJKRegular: resolveAsset('font', 'NotoSansCJK-Regular'),
};

// ============ Animations ============

export const animations: AssetAnimations = {
  loadingArc: resolveAsset('animations', 'loadingArc'),
  splashHourglass: resolveAsset('animations', 'splashHourglass'),
  emptyHourglass: resolveAsset('animations', 'emptyHourglass'),
};

// ============ Audio ============

export const audio: AssetAudio = {
  // click: resolveAsset('audio', 'click'),
  // success: resolveAsset('audio', 'success'),
};

// ============ Default Export ============

const assets: Assets = {
  images,
  icons,
  fonts,
  animations,
  audio,
};

export default assets;
