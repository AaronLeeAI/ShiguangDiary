/**
 * 数据库连接管理
 */

import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';
import {DATABASE_CONFIG} from './config';

SQLite.enablePromise(true);

let dbInstance: SQLiteDatabase | null = null;

/**
 * 打开数据库连接
 */
export async function openDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await SQLite.openDatabase({
    name: DATABASE_CONFIG.name,
    location: DATABASE_CONFIG.location,
  });

  return dbInstance;
}

/**
 * 关闭数据库
 */
export async function closeDatabase() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

/**
 * 获取数据库实例（如果未连接则自动打开）
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  return openDatabase();
}