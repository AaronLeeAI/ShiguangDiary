/**
 * File Storage - 统一文件管理抽象
 *
 * 封装 react-native-fs，提供日记附件、导出、缓存、备份等文件操作的统一入口。
 *
 * 设计：
 * - 页面 / Store 禁止直接操作文件系统，必须经过本模块。
 * - 目录按用途划分，避免散落。
 * - 所有异常归一化为 DatabaseError(FILE_IO_FAILED)。
 *
 * 目录布局（DocumentDirectory 下）：
 *   shiguang/
 *     attachments/   日记附件（图片/视频/音频/文件）
 *     exports/       导出文件
 *     cache/         临时缓存（可清理）
 *     backups/       备份目录
 */

import RNFS from 'react-native-fs'
import { toDatabaseError } from '../core/errors'

export type FileBucket = 'attachments' | 'exports' | 'cache' | 'backups'

const ROOT_DIR = 'shiguang'

const BUCKET_SUBDIR: Record<FileBucket, string> = {
  attachments: 'attachments',
  exports: 'exports',
  cache: 'cache',
  backups: 'backups',
}

function bucketPath(bucket: FileBucket): string {
  return `${RNFS.DocumentDirectoryPath}/${ROOT_DIR}/${BUCKET_SUBDIR[bucket]}`
}

/**
 * 确保目录存在（幂等）。
 */
async function ensureDir(path: string): Promise<void> {
  try {
    const exists = await RNFS.exists(path)
    if (!exists) {
      await RNFS.mkdir(path)
    }
  } catch (error) {
    throw toDatabaseError(error, 'FILE_IO_FAILED')
  }
}

/**
 * 初始化所有 bucket 目录。应用启动时调用一次。
 */
async function ensureAllBuckets(): Promise<void> {
  for (const bucket of Object.keys(BUCKET_SUBDIR) as FileBucket[]) {
    await ensureDir(bucketPath(bucket))
  }
}

let bootstrapped = false

/**
 * 文件存储公共 API。
 */
export const fileStorage = {
  /** 应用启动时初始化目录结构。幂等。 */
  async init(): Promise<void> {
    if (bootstrapped) {
      return
    }
    await ensureAllBuckets()
    bootstrapped = true
  },

  /** 返回指定 bucket 的根路径。 */
  dir(bucket: FileBucket): string {
    return bucketPath(bucket)
  },

  /**
   * 写入文本内容到指定 bucket。
   * @returns 写入后的完整文件路径。
   */
  async writeText(bucket: FileBucket, filename: string, content: string): Promise<string> {
    try {
      await ensureDir(bucketPath(bucket))
      const path = `${bucketPath(bucket)}/${filename}`
      await RNFS.writeFile(path, content, 'utf8')
      return path
    } catch (error) {
      throw toDatabaseError(error, 'FILE_IO_FAILED')
    }
  },

  /**
   * 读取文本文件。
   */
  async readText(bucket: FileBucket, filename: string): Promise<string> {
    try {
      const path = `${bucketPath(bucket)}/${filename}`
      return await RNFS.readFile(path, 'utf8')
    } catch (error) {
      throw toDatabaseError(error, 'FILE_IO_FAILED')
    }
  },

  /**
   * 复制源文件（如相册图片）到指定 bucket。
   * @returns 目标文件完整路径。
   */
  async copyFromPath(bucket: FileBucket, sourcePath: string, filename: string): Promise<string> {
    try {
      await ensureDir(bucketPath(bucket))
      const dest = `${bucketPath(bucket)}/${filename}`
      await RNFS.copyFile(sourcePath, dest)
      return dest
    } catch (error) {
      throw toDatabaseError(error, 'FILE_IO_FAILED')
    }
  },

  /**
   * 删除文件（不存在视为成功）。
   */
  async remove(bucket: FileBucket, filename: string): Promise<void> {
    try {
      const path = `${bucketPath(bucket)}/${filename}`
      const exists = await RNFS.exists(path)
      if (exists) {
        await RNFS.unlink(path)
      }
    } catch (error) {
      throw toDatabaseError(error, 'FILE_IO_FAILED')
    }
  },

  /**
   * 列出 bucket 下所有文件名。
   */
  async list(bucket: FileBucket): Promise<string[]> {
    try {
      const path = bucketPath(bucket)
      const exists = await RNFS.exists(path)
      if (!exists) {
        return []
      }
      const items = await RNFS.readDir(path)
      return items.map(item => item.name)
    } catch (error) {
      throw toDatabaseError(error, 'FILE_IO_FAILED')
    }
  },

  /**
   * 清理 cache bucket（不影响其他 bucket）。
   */
  async clearCache(): Promise<void> {
    try {
      const path = bucketPath('cache')
      const exists = await RNFS.exists(path)
      if (!exists) {
        return
      }
      const items = await RNFS.readDir(path)
      for (const item of items) {
        await RNFS.unlink(item.path)
      }
    } catch (error) {
      throw toDatabaseError(error, 'FILE_IO_FAILED')
    }
  },
}
