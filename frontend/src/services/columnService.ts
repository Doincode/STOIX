import api from './api';
import { Column, CreateColumnDto } from '../types';

export const getColumns = async (): Promise<Column[]> => {
  const response = await api.get('/columns');
  return response.data;
};

export const getColumnById = async (id: number): Promise<Column> => {
  const response = await api.get(`/columns/${id}`);
  return response.data;
};

export const createColumn = async (columnData: CreateColumnDto): Promise<Column> => {
  const response = await api.post('/columns', columnData);
  return response.data;
};

export const updateColumn = async (id: number, title: string): Promise<Column> => {
  const response = await api.put(`/columns/${id}`, { title });
  return response.data;
};

export const deleteColumn = async (id: number): Promise<void> => {
  await api.delete(`/columns/${id}`);
};

export const updateColumnPosition = async (id: number, position: number): Promise<Column> => {
  const response = await api.put(`/columns/${id}/position`, { position });
  return response.data;
}; 