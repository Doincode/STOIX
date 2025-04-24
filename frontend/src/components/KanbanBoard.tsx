import { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiPlus } from 'react-icons/fi';
import ColumnComponent from './ColumnComponent';
import TaskModal from './TaskModal';
import ColumnModal from './ColumnModal';
import { Column, Task, CreateTaskDto, UpdateTaskDto } from '../types';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskPosition,
} from '../services/taskService';
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  updateColumnPosition,
} from '../services/columnService';

// LocalStorage key for column positions
const COLUMN_POSITIONS_KEY = 'kanban_column_positions';

// Helper to save column positions to localStorage
const saveColumnPositionsToLocalStorage = (columns: Column[]) => {
  try {
    const positionsMap = columns.reduce((acc, column) => {
      acc[column.id] = column.position;
      return acc;
    }, {} as Record<number, number>);
    
    localStorage.setItem(COLUMN_POSITIONS_KEY, JSON.stringify(positionsMap));
  } catch (error) {
    console.error('Error saving column positions to localStorage:', error);
  }
};

// Helper to get column positions from localStorage
const getColumnPositionsFromLocalStorage = (): Record<number, number> => {
  try {
    const positions = localStorage.getItem(COLUMN_POSITIONS_KEY);
    return positions ? JSON.parse(positions) : {};
  } catch (error) {
    console.error('Error getting column positions from localStorage:', error);
    return {};
  }
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [currentColumn, setCurrentColumn] = useState<Column | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [columnsData, tasksData] = await Promise.all([getColumns(), getTasks()]);
      
      // Get saved positions from localStorage
      const savedPositions = getColumnPositionsFromLocalStorage();
      
      // Apply saved positions if available
      const columnsWithSavedPositions = columnsData.map(column => {
        if (savedPositions[column.id] !== undefined) {
          return { ...column, position: savedPositions[column.id] };
        }
        return column;
      });
      
      // Sort columns by position
      const sortedColumns = columnsWithSavedPositions.sort((a, b) => a.position - b.position);
      setColumns(sortedColumns);
      setTasks(tasksData);
      
      // Save positions to localStorage to ensure consistency
      saveColumnPositionsToLocalStorage(sortedColumns);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Task handlers
  const handleAddTask = (columnId: number) => {
    setCurrentTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    try {
      const updatedTask = await updateTask(id, { completed });
      setTasks(
        tasks.map((task) => (task.id === id ? { ...task, completed: updatedTask.completed } : task))
      );
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    try {
      // Destructure only the properties we need
      const { title, description, column_id, completed, position } = task;
      const newTask = await createTask({
        title,
        description,
        column_id,
        position,
        completed
      });
      setTasks([...tasks, newTask]);
    } catch (err) {
      console.error('Error duplicating task:', err);
      setError('Failed to duplicate task. Please try again.');
    }
  };

  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    column_id: number;
    completed: boolean;
  }) => {
    try {
      if (currentTask) {
        // Update existing task
        const updatedTask = await updateTask(currentTask.id, taskData as UpdateTaskDto);
        setTasks(tasks.map((task) => (task.id === currentTask.id ? updatedTask : task)));
      } else {
        // Create new task
        const position = 
          tasks.filter(task => task.column_id === taskData.column_id).length;
        
        const newTask = await createTask({
          ...taskData,
          position,
        });
        setTasks([...tasks, newTask]);
      }
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please try again.');
    }
  };

  // Column handlers
  const handleAddColumn = () => {
    setCurrentColumn(undefined);
    setIsColumnModalOpen(true);
  };

  const handleEditColumn = (column: Column) => {
    setCurrentColumn(column);
    setIsColumnModalOpen(true);
  };

  const handleDeleteColumn = async (id: number) => {
    try {
      if (tasks.some(task => task.column_id === id)) {
        if (!window.confirm('This column contains tasks. Are you sure you want to delete it?')) {
          return;
        }
      }
      await deleteColumn(id);
      
      // Update columns state
      const updatedColumns = columns.filter((column) => column.id !== id);
      setColumns(updatedColumns);
      
      // Update positions after deletion
      const reorderedColumns = updateColumnPositionsAfterReorder(updatedColumns);
      setColumns(reorderedColumns);
      
      // Save updated positions to localStorage
      saveColumnPositionsToLocalStorage(reorderedColumns);
      
      // Filter out tasks that belonged to the deleted column
      setTasks(tasks.filter((task) => task.column_id !== id));
    } catch (err) {
      console.error('Error deleting column:', err);
      setError('Failed to delete column. Please try again.');
    }
  };

  const handleSaveColumn = async (title: string) => {
    try {
      if (currentColumn) {
        // Update existing column
        const updatedColumn = await updateColumn(currentColumn.id, title);
        setColumns(
          columns.map((column) => (column.id === currentColumn.id ? updatedColumn : column))
        );
      } else {
        // Create new column
        const position = columns.length;
        const newColumn = await createColumn({ title });
        
        // Add the new column and update state
        const updatedColumns = [...columns, { ...newColumn, position }];
        setColumns(updatedColumns);
        
        // Save updated positions to localStorage
        saveColumnPositionsToLocalStorage(updatedColumns);
      }
      setIsColumnModalOpen(false);
    } catch (err) {
      console.error('Error saving column:', err);
      setError('Failed to save column. Please try again.');
    }
  };

  // Helper function to update column positions after reordering
  const updateColumnPositionsAfterReorder = (columnsToUpdate: Column[]): Column[] => {
    const updatedColumns = [...columnsToUpdate].sort((a, b) => a.position - b.position);
    return updatedColumns.map((column, index) => ({
      ...column,
      position: index
    }));
  };

  // Handle moving column left
  const handleMoveColumnLeft = async (id: number) => {
    try {
      const columnIndex = columns.findIndex(column => column.id === id);
      if (columnIndex <= 0) return; // Can't move left if it's already the leftmost column
      
      const newColumns = [...columns];
      
      // Swap positions
      const temp = newColumns[columnIndex].position;
      newColumns[columnIndex].position = newColumns[columnIndex - 1].position;
      newColumns[columnIndex - 1].position = temp;
      
      // Update in API
      await updateColumnPosition(id, newColumns[columnIndex].position);
      await updateColumnPosition(newColumns[columnIndex - 1].id, newColumns[columnIndex - 1].position);
      
      // Sort by position and update local state
      const sortedColumns = newColumns.sort((a, b) => a.position - b.position);
      setColumns(sortedColumns);
      
      // Save updated positions to localStorage
      saveColumnPositionsToLocalStorage(sortedColumns);
    } catch (err) {
      console.error('Error moving column left:', err);
      setError('Failed to move column. Please try again.');
    }
  };

  // Handle moving column right
  const handleMoveColumnRight = async (id: number) => {
    try {
      const columnIndex = columns.findIndex(column => column.id === id);
      if (columnIndex >= columns.length - 1) return; // Can't move right if it's already the rightmost column
      
      const newColumns = [...columns];
      
      // Swap positions
      const temp = newColumns[columnIndex].position;
      newColumns[columnIndex].position = newColumns[columnIndex + 1].position;
      newColumns[columnIndex + 1].position = temp;
      
      // Update in API
      await updateColumnPosition(id, newColumns[columnIndex].position);
      await updateColumnPosition(newColumns[columnIndex + 1].id, newColumns[columnIndex + 1].position);
      
      // Sort by position and update local state
      const sortedColumns = newColumns.sort((a, b) => a.position - b.position);
      setColumns(sortedColumns);
      
      // Save updated positions to localStorage
      saveColumnPositionsToLocalStorage(sortedColumns);
    } catch (err) {
      console.error('Error moving column right:', err);
      setError('Failed to move column. Please try again.');
    }
  };

  // Drag and drop handler
  const handleMoveTask = async (
    dragIndex: number,
    hoverIndex: number,
    sourceColumnId: number,
    targetColumnId: number
  ) => {
    // Find the task being dragged
    const sourceColumnTasks = tasks.filter(task => task.column_id === sourceColumnId)
      .sort((a, b) => a.position - b.position);
    
    const draggedTask = sourceColumnTasks[dragIndex];
    
    if (!draggedTask) return;

    // Create a new array with the updated tasks
    const newTasks = [...tasks];
    
    // If moving within the same column
    if (sourceColumnId === targetColumnId) {
      // Reorder tasks within the column
      const columnTasks = newTasks.filter(task => task.column_id === sourceColumnId);
      const orderedTasks = columnTasks.sort((a, b) => a.position - b.position);
      
      // Move the task in the array
      const [movedTask] = orderedTasks.splice(dragIndex, 1);
      orderedTasks.splice(hoverIndex, 0, movedTask);
      
      // Update positions
      orderedTasks.forEach((task, index) => {
        task.position = index;
      });
      
      // Update the task in the API
      try {
        await updateTaskPosition(draggedTask.id, sourceColumnId, hoverIndex);
      } catch (err) {
        console.error('Error updating task position:', err);
        setError('Failed to update task position. Please try again.');
        fetchData(); // Refresh data on error
        return;
      }
    } else {
      // Moving to a different column
      // Find the task to move
      const taskToMove = newTasks.find(task => task.id === draggedTask.id);
      if (!taskToMove) return;
      
      // Update the column and position
      taskToMove.column_id = targetColumnId;
      
      // Get tasks in target column
      const targetColumnTasks = newTasks
        .filter(task => task.column_id === targetColumnId && task.id !== draggedTask.id)
        .sort((a, b) => a.position - b.position);
      
      // Insert at the right position
      targetColumnTasks.splice(hoverIndex, 0, taskToMove);
      
      // Update positions
      targetColumnTasks.forEach((task, index) => {
        task.position = index;
      });
      
      // Update source column positions
      const sourceColumnRemainingTasks = newTasks
        .filter(task => task.column_id === sourceColumnId && task.id !== draggedTask.id)
        .sort((a, b) => a.position - b.position);
      
      sourceColumnRemainingTasks.forEach((task, index) => {
        task.position = index;
      });
      
      // Update the task in the API
      try {
        await updateTaskPosition(draggedTask.id, targetColumnId, hoverIndex);
      } catch (err) {
        console.error('Error updating task position:', err);
        setError('Failed to update task position. Please try again.');
        fetchData(); // Refresh data on error
        return;
      }
    }
    
    setTasks(newTasks);
  };

  // Group tasks by column
  const getTasksByColumn = (columnId: number) => {
    return tasks.filter((task) => task.column_id === columnId);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
          <button
            onClick={handleAddColumn}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <FiPlus size={18} />
            <span>Add Column</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-160px)]">
            {columns.map((column, index) => (
              <ColumnComponent
                key={column.id}
                column={column}
                tasks={getTasksByColumn(column.id)}
                moveTask={handleMoveTask}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onDuplicateTask={handleDuplicateTask}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
                moveColumnLeft={handleMoveColumnLeft}
                moveColumnRight={handleMoveColumnRight}
                isLeftmostColumn={index === 0}
                isRightmostColumn={index === columns.length - 1}
              />
            ))}
            
            {columns.length === 0 && (
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 w-full">
                <p className="text-gray-500 mb-4">No columns yet. Start by adding a column.</p>
                <button
                  onClick={handleAddColumn}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <FiPlus size={18} />
                  <span>Add Column</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          task={currentTask}
          columns={columns}
        />

        {/* Column Modal */}
        <ColumnModal
          isOpen={isColumnModalOpen}
          onClose={() => setIsColumnModalOpen(false)}
          onSave={handleSaveColumn}
          column={currentColumn}
        />
      </div>
    </DndProvider>
  );
};

export default KanbanBoard; 