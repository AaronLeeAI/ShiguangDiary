/**
 * Font Loader
 *
 * 统一管理应用所有自定义字体的加载。
 * 字体文件放在 assets/font/ 目录，通过此模块统一加载为 React Native
 * 可使用的 Font 对象。
 *
 * 使用方式：
 *   import {useFonts} from 'expo-font';
 *   import {loadFonts} from '@assets/font';
 *
 *   // 在 App 中：
 *   const loaded = useFonts(loadFonts());
 *
 * 注意：
 *   - 当前只包含类型声明，实际字体文件在后续 Task 中补充
 *   - 如需添加自定义字体，在此文件中注册即可
 */

// ============ Font Registry ============

/**
 * 应用内使用的自定义字体列表。
 * 添加新字体时在此注册，保持单一可信来源。
 */
const FONT_LIST: Array<{
  fontName: string
  assetPath: unknown
  weight: number
  style: string
}> = [
  // {
  //   fontName: 'NotoSansCJK-Regular',
  //   assetPath: require('./font/NotoSansCJK-Regular.ttf'),
  //   weight: 400,
  //   style: 'normal',
  // },
  // {
  //   fontName: 'NotoSansCJK-Bold',
  //   assetPath: require('./font/NotoSansCJK-Bold.ttf'),
  //   weight: 700,
  //   style: 'normal',
  // },
]

// ============ Export ============

export { FONT_LIST }

/**
 * 获取所有已注册字体。
 * 返回数组供 useFonts / Font.loadAsync 使用。
 */
export function getRegisteredFonts(): Array<{
  fontName: string
  assetPath: unknown
  weight: number
  style: string
}> {
  return FONT_LIST
}
