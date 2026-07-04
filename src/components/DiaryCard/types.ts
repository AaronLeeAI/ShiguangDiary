/**
 * DiaryCard 类型定义
 */

export interface DiaryCardProps {
  /** 日记数据 */
  item: {
    /** 日记唯一标识 */
    id: string;
    /** 标题 */
    title?: string;
    /** 正文摘要 */
    summary: string;
    /** 星期几（如 "周一"） */
    day: string;
    /** 月年（如 "2026年7月"） */
    monthYear: string;
    /** 时间戳（如 "14:30"） */
    timestamp: string;
    /** 是否置顶 */
    isPinned: boolean;
    /** 是否加密 */
    isEncrypted: boolean;
  };
  /** 测试 ID */
  testID?: string;
  /** 外部样式 */
  style?: object;
}

/**
 * 内部引用类型（留空，后续按需扩展）
 */
export type DiaryCardRef = unknown;
