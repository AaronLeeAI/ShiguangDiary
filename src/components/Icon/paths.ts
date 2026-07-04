/**
 * Icon Path Data
 *
 * 所有图标 SVG path 数据（按设计规范 04_Design_System.md § 4.8）。
 * 完整维护 React Component 风格 — 不依赖图标字体。
 *
 * 设计原则：
 * - 24x24 viewBox 网格
 * - 2dp 笔触
 * - 圆角端点
 * - 线性 outline
 */

export const ICON_PATHS: Record<string, string> = {
  // 操作
  add: 'M12 5v14m-7-7h14',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5L20 7',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
  delete: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  more: 'M12 13a1 1 0 100-2 1 1 0 000 2zm0-7a1 1 0 100-2 1 1 0 000 2zm0 14a1 1 0 100-2 1 1 0 000 2z',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-5.4-5.4',

  // 导航
  back: 'M19 12H5m7-7l-7 7 7 7',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  chevronUp: 'M18 15l-6-6-6 6',
  chevronDown: 'M6 9l6 6 6-6',

  // Tab 业务
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z',
  album: 'M4 4h16v16H4zM4 14l4-4 4 4 4-4 4 4M9 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
  profile: 'M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z',
  bookmark: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z',

  // 时间/提醒
  bell: 'M18 16v-5a6 6 0 10-12 0v5l-2 3h16l-2-3zM10 21a2 2 0 004 0',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  calendar: 'M3 5h18v16H3zM3 9h18M8 3v4M16 3v4',
  hourglass: 'M6 2h12M6 22h12M6 2v4a6 6 0 006 6 6 6 0 006-6V2M6 22v-4a6 6 0 016-6 6 6 0 016 6v4',

  // 功能
  trash: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zm9-3a8.9 8.9 0 00-.2-2l2-1.6-2-3.4-2.4 1a9 9 0 00-3.4-2L14 2h-4l-.4 2a9 9 0 00-3.4 2l-2.4-1-2 3.4 2 1.6a9 9 0 000 4l-2 1.6 2 3.4 2.4-1a9 9 0 003.4 2L10 22h4l.4-2a9 9 0 003.4-2l2.4 1 2-3.4-2-1.6a8.9 8.9 0 00.2-2z',
  tune: 'M3 12h4M3 6h12M3 18h8M21 6h-4M21 12h-8M21 18h-6',
  recycle: 'M7 19H5a2 2 0 01-2-2V7a2 2 0 012-2h2M11 19l-3-3 3-3M17 17l3 3-3 3M19 12h-2a2 2 0 00-2 2v4a2 2 0 002 2h2',
  export: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5-5 5 5M12 5v12',
  share: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  chart: 'M3 3v18h18M7 14l4-4 4 4 5-5',
  crown: 'M3 18h18l-2-13-4 4-3-6-3 6-4-4-2 13z',
  tag: 'M20.6 12.6L13.4 5.4a2 2 0 00-2.8 0L3 12.4V21h8.6l7-7a2 2 0 000-2.8zM16 8a1 1 0 11-2 0 1 1 0 012 0z',

  // 多媒体
  image: 'M3 5h18v14H3zM3 14l4-4 4 4 4-4 4 4M9 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
  link: 'M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1',
  mic: 'M12 18a3 3 0 003-3V6a3 3 0 10-6 0v9a3 3 0 003 3zM19 12a7 7 0 01-14 0M12 19v3M8 22h8',
  camera: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11zM12 17a4 4 0 100-8 4 4 0 000 8z',

  // 编辑器
  bold: 'M6 4h7a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h8a4 4 0 014 4 4 4 0 01-4 4H6z',
  italic: 'M19 4h-9M14 20H5M15 4L9 20',
  underline: 'M6 4v6a6 6 0 0012 0V4M4 20h16',
  strikethrough: 'M4 12h16M15 4l-3 4M9 20l-3-4M11 4h2a4 4 0 014 4c0 2-2 3-3 3M13 20h-2a4 4 0 01-4-4',
  quote: 'M3 21c3 0 7-1 7-8V5H3v8h4c0 5-4 5-4 5zM14 21c3 0 7-1 7-8V5h-7v8h4c0 5-4 5-4 5z',

  // 其他
  swap: 'M16 3l4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16',
  location: 'M12 22s-8-7.6-8-13a8 8 0 1116 0c0 5.4-8 13-8 13zM12 12a3 3 0 100-6 3 3 0 000 6z',
  weather: 'M3 16h13a4 4 0 100-8 6 6 0 00-11-1',
  doc: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h6',
  save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8',

  // Tab 选中态 (filled)
  listActive: 'M8 6h13v2H8zM8 12h13v2H8zM8 18h13v2H8zM3 6h2v2H3zM3 12h2v2H3zM3 18h2v2H3z',
  bookActive: 'M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14zM4 19.5V21h16',
  albumActive: 'M4 4h16v16H4zM4 14l4-4 4 4 4-4 4 4',
  profileActive: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-1a8 8 0 0116 0v1',
  flag: 'M4 22V3l8 4 8-4v13l-8 4-8-4z',
};

export type IconName = keyof typeof ICON_PATHS;
