/**
 * Home Module - 首页业务模块
 *
 * 项目第一个完整 Vertical Slice：
 *   HomeScreen → useHome → diaryStore → diaryService → diaryRepository → SQLite
 *
 * 公共组件（DiaryCard / EmptyState / TopBar / FAB / BottomTabBar）来自 @components，
 * 首页专用逻辑收敛在本模块。
 */

export { homeService } from './services/homeService'
export type { HomeBootstrapResult } from './services/homeService'
export { useHome } from './hooks/useHome'
export type { UseHomeResult } from './hooks/useHome'
