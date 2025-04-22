import { Request, Response } from 'express';
import { TaskModel } from '../models/TaskModel';
import { Task } from '../types';

const taskModel = new TaskModel();

export class TaskController {
  async create(req: Request, res: Response) {
    try {
      const task = await taskModel.create(req.body);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const tasks = await taskModel.getAll();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const task = await taskModel.getById(Number(req.params.id));
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const task = await taskModel.update(Number(req.params.id), req.body);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const success = await taskModel.delete(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updatePosition(req: Request, res: Response) {
    try {
      const { position, column_id } = req.body;
      
      // Validate required fields
      if (column_id === undefined || column_id === null) {
        return res.status(400).json({ error: 'column_id is required' });
      }

      if (position === undefined || position === null) {
        return res.status(400).json({ error: 'position is required' });
      }

      // Ensure column_id is a number
      const columnId = Number(column_id);
      if (isNaN(columnId)) {
        return res.status(400).json({ error: 'column_id must be a number' });
      }

      // Ensure position is a number
      const taskPosition = Number(position);
      if (isNaN(taskPosition)) {
        return res.status(400).json({ error: 'position must be a number' });
      }

      console.log('Controller: Updating task position:', {
        id: req.params.id,
        columnId,
        position: taskPosition
      });

      const task = await taskModel.updatePosition(Number(req.params.id), columnId, taskPosition);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Ensure column_id is not null
      if (task.column_id === null) {
        console.error('Controller: Task returned with null column_id:', task);
        return res.status(500).json({ error: 'Task returned with null column_id' });
      }

      console.log('Controller: Task updated successfully:', task);
      res.json(task);
    } catch (error) {
      console.error('Error in updatePosition:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 