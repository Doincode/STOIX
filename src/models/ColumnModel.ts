import { Pool } from 'pg';
import { Column } from '../types';
import pool from '../db/config';

export class ColumnModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async findAll(): Promise<Column[]> {
    const result = await this.pool.query('SELECT * FROM columns ORDER BY position');
    return result.rows;
  }

  async findById(id: number): Promise<Column | null> {
    const result = await this.pool.query('SELECT * FROM columns WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(title: string, position: number): Promise<Column> {
    const result = await this.pool.query(
      'INSERT INTO columns (title, position) VALUES ($1, $2) RETURNING *',
      [title, position]
    );
    return result.rows[0];
  }

  async update(id: number, title: string): Promise<Column | null> {
    const result = await this.pool.query(
      'UPDATE columns SET title = $1 WHERE id = $2 RETURNING *',
      [title, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM columns WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updatePosition(id: number, position: number): Promise<Column | null> {
    const result = await this.pool.query(
      'UPDATE columns SET position = $1 WHERE id = $2 RETURNING *',
      [position, id]
    );
    return result.rows[0] || null;
  }
} 