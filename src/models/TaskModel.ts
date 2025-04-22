import { Pool } from 'pg';
import { Task } from '../types';

export class TaskModel {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async getAll(): Promise<Task[]> {
    const result = await this.pool.query('SELECT * FROM tasks ORDER BY position');
    return result.rows;
  }

  async getById(id: number): Promise<Task | null> {
    const result = await this.pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    if (!task.column_id) {
      throw new Error('column_id is required');
    }

    const result = await this.pool.query(
      'INSERT INTO tasks (title, description, column_id, position, completed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [task.title, task.description, task.column_id, task.position, task.completed || false]
    );
    return result.rows[0];
  }

  async update(id: number, task: Partial<Task>): Promise<Task | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (task.title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(task.title);
      paramCount++;
    }

    if (task.description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(task.description);
      paramCount++;
    }

    if (task.column_id !== undefined) {
      updates.push(`column_id = $${paramCount}`);
      values.push(task.column_id);
      paramCount++;
    }

    if (task.position !== undefined) {
      updates.push(`position = $${paramCount}`);
      values.push(task.position);
      paramCount++;
    }

    if (task.completed !== undefined) {
      updates.push(`completed = $${paramCount}`);
      values.push(task.completed);
      paramCount++;
    }

    if (updates.length === 0) {
      return null;
    }

    values.push(id);
    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updatePosition(id: number, columnId: number, position: number): Promise<Task | null> {
    console.log('Model: Starting position update:', { id, columnId, position });

    try {
      // First get the current task to ensure it exists
      const currentTask = await this.getById(id);
      if (!currentTask) {
        console.error('Model: Task not found:', id);
        return null;
      }

      console.log('Model: Current task:', currentTask);

      // Update the task position and column
      const result = await this.pool.query(
        'UPDATE tasks SET column_id = $1, position = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [columnId, position, id]
      );
      
      const updatedTask = result.rows[0];
      if (!updatedTask) {
        console.error('Model: No task returned after update');
        return null;
      }

      console.log('Model: Task updated successfully:', updatedTask);

      // Ensure column_id is not null
      if (updatedTask.column_id === null) {
        console.error('Model: Task returned with null column_id:', updatedTask);
        throw new Error('Task returned with null column_id');
      }

      // Return the complete task object
      return updatedTask;
    } catch (error) {
      console.error('Model: Error updating task position:', error);
      throw error;
    }
  }
} 