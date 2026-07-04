/**
 * DAO - 数据访问对象
 *
 * DAO 直接对数据库执行 SQL，不含业务逻辑。
 * 业务层应使用 Repository 而非 DAO。
 */

import {getDatabase} from '../connection';
import type {DiaryModel, NotebookModel, AlbumModel} from '../models';

/**
 * 日记 DAO
 */
export const diaryDao = {
  async findAll(): Promise<DiaryModel[]> {
    const db = await getDatabase();
    const [results] = await db.executeSql(
      'SELECT * FROM diary WHERE deletedAt IS NULL ORDER BY createdAt DESC',
    );
    return Array.from({length: results.rows.length}, (_, i) => results.rows.item(i));
  },

  async findById(id: string): Promise<DiaryModel | null> {
    const db = await getDatabase();
    const [results] = await db.executeSql('SELECT * FROM diary WHERE id = ?', [id]);
    return results.rows.length > 0 ? results.rows.item(0) : null;
  },

  async insert(diary: DiaryModel): Promise<void> {
    const db = await getDatabase();
    await db.executeSql(
      `INSERT INTO diary (id, notebookId, title, content, cover, weather, location, mood, isPinned, isEncrypted, isDraft, createdAt, updatedAt, deletedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        diary.id,
        diary.notebookId,
        diary.title,
        diary.content,
        diary.cover,
        diary.weather,
        diary.location,
        diary.mood,
        diary.isPinned,
        diary.isEncrypted,
        diary.isDraft,
        diary.createdAt,
        diary.updatedAt,
        diary.deletedAt,
      ],
    );
  },

  async update(id: string, diary: Partial<DiaryModel>): Promise<void> {
    const db = await getDatabase();
    const fields = Object.keys(diary)
      .filter(k => k !== 'id')
      .map(k => `${k} = ?`)
      .join(', ');
    const values = Object.entries(diary)
      .filter(([k]) => k !== 'id')
      .map(([_, v]) => v);
    await db.executeSql(`UPDATE diary SET ${fields}, updatedAt = ? WHERE id = ?`, [...values, Date.now(), id]);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.executeSql('UPDATE diary SET deletedAt = ? WHERE id = ?', [Date.now(), id]);
  },
};

/**
 * 日记本 DAO
 */
export const notebookDao = {
  async findAll(): Promise<NotebookModel[]> {
    const db = await getDatabase();
    const [results] = await db.executeSql(
      'SELECT * FROM notebook WHERE deletedAt IS NULL ORDER BY sortOrder',
    );
    return Array.from({length: results.rows.length}, (_, i) => results.rows.item(i));
  },

  async findById(id: string): Promise<NotebookModel | null> {
    const db = await getDatabase();
    const [results] = await db.executeSql('SELECT * FROM notebook WHERE id = ?', [id]);
    return results.rows.length > 0 ? results.rows.item(0) : null;
  },

  async insert(notebook: NotebookModel): Promise<void> {
    const db = await getDatabase();
    await db.executeSql(
      `INSERT INTO notebook (id, name, description, cover, color, sortOrder, diaryCount, createdAt, updatedAt, deletedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notebook.id,
        notebook.name,
        notebook.description,
        notebook.cover,
        notebook.color,
        notebook.sortOrder,
        notebook.diaryCount,
        notebook.createdAt,
        notebook.updatedAt,
        notebook.deletedAt,
      ],
    );
  },

  async update(id: string, notebook: Partial<NotebookModel>): Promise<void> {
    const db = await getDatabase();
    const fields = Object.keys(notebook)
      .filter(k => k !== 'id')
      .map(k => `${k} = ?`)
      .join(', ');
    const values = Object.entries(notebook)
      .filter(([k]) => k !== 'id')
      .map(([_, v]) => v);
    await db.executeSql(`UPDATE notebook SET ${fields}, updatedAt = ? WHERE id = ?`, [...values, Date.now(), id]);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.executeSql('UPDATE notebook SET deletedAt = ? WHERE id = ?', [Date.now(), id]);
  },
};

/**
 * 相册 DAO
 */
export const albumDao = {
  async findAll(): Promise<AlbumModel[]> {
    const db = await getDatabase();
    const [results] = await db.executeSql(
      'SELECT * FROM album WHERE deletedAt IS NULL ORDER BY createdAt DESC',
    );
    return Array.from({length: results.rows.length}, (_, i) => results.rows.item(i));
  },

  async insert(album: AlbumModel): Promise<void> {
    const db = await getDatabase();
    await db.executeSql(
      `INSERT INTO album (id, name, description, cover, diaryIds, createdAt, updatedAt, deletedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        album.id,
        album.name,
        album.description,
        album.cover,
        album.diaryIds,
        album.createdAt,
        album.updatedAt,
        album.deletedAt,
      ],
    );
  },
};