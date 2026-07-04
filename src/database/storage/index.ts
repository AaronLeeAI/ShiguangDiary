/**
 * Database Storage - 文件存储与本地轻量存储公共导出
 *
 * File Storage 抽象在此导出。
 * MMKV 封装保留在 @storage/mmkvStorage（Zustand persist 适配），
 * 数据层通过 barrel 引用时也提供转发。
 */

export * from './fileStorage'
