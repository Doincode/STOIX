import api from './api';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types';

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const getTaskById = async (id: number): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData: CreateTaskDto): Promise<Task> => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id: number, taskData: UpdateTaskDto): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const updateTaskPosition = async (
  id: number, 
  columnId: number, 
  position: number
): Promise<Task> => {
  const response = await api.put(`/tasks/${id}/position`, { column_id: columnId, position });
  return response.data;
}; 