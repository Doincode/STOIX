export interface Task {
  id: number;
  title: string;
  description: string;
  column_id: number;
  position: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: number;
  title: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id?: number;
  username: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateColumnDto {
  title: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  column_id: number;
  position: number;
  completed: boolean;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  column_id?: number;
  position?: number;
  completed?: boolean;
} 