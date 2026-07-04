/**
 * Response - 响应处理工具
 */

/**
 * 解包响应
 */
export function unwrap<T>(resp: { code: number; data: T; message: string }): T {
  if (resp.code !== 0 && resp.code !== 200) {
    throw new Error(resp.message || 'API Error')
  }
  return resp.data
}

/**
 * 分页响应
 */
export interface Paginated<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
