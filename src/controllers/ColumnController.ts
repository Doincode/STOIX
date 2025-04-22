import { Request, Response } from 'express';
import { ColumnModel } from '../models/ColumnModel';
import { CreateColumnDto } from '../types';

const columnModel = new ColumnModel();

export const getAllColumns = async (req: Request, res: Response) => {
  try {
    const columns = await columnModel.findAll();
    res.json(columns);
  } catch (error) {
    console.error('Error getting columns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getColumnById = async (req: Request, res: Response) => {
  try {
    const column = await columnModel.findById(Number(req.params.id));
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    res.json(column);
  } catch (error) {
    console.error('Error getting column:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createColumn = async (req: Request, res: Response) => {
  try {
    const { title } = req.body as CreateColumnDto;
    // Get the current highest position and add 1
    const columns = await columnModel.findAll();
    const position = columns.length > 0 ? Math.max(...columns.map(c => c.position)) + 1 : 1;
    
    const column = await columnModel.create(title, position);
    res.status(201).json(column);
  } catch (error) {
    console.error('Error creating column:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateColumn = async (req: Request, res: Response) => {
  try {
    const { title } = req.body as CreateColumnDto;
    const column = await columnModel.update(Number(req.params.id), title);
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    res.json(column);
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteColumn = async (req: Request, res: Response) => {
  try {
    const deleted = await columnModel.delete(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Column not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePosition = async (req: Request, res: Response) => {
  try {
    const { position } = req.body;
    const column = await columnModel.updatePosition(Number(req.params.id), position);
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    res.json(column);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}; 