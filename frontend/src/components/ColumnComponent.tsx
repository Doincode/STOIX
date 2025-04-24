import { useRef } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { Column, Task, DragItem } from '../types';
import TaskCard from './TaskCard';

interface ColumnProps {
  column: Column;
  tasks: Task[];
  moveTask: (dragIndex: number, hoverIndex: number, sourceColumnId: number, targetColumnId: number) => void;
  onAddTask: (columnId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
  onDuplicateTask: (task: Task) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (id: number) => void;
  moveColumnLeft: (id: number) => void;
  moveColumnRight: (id: number) => void;
  isLeftmostColumn: boolean;
  isRightmostColumn: boolean;
}

interface DropCollectedProps {
  isOver: boolean;
  canDrop: boolean;
}

interface DropResult {
  columnId: number;
}

const ColumnComponent = ({
  column,
  tasks,
  moveTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onDuplicateTask,
  onEditColumn,
  onDeleteColumn,
  moveColumnLeft,
  moveColumnRight,
  isLeftmostColumn,
  isRightmostColumn
}: ColumnProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Enhanced drop functionality for the column
  const [{ isOver }, drop] = useDrop<DragItem, DropResult, DropCollectedProps>({
    accept: 'TASK',
    drop: (item: DragItem, monitor: DropTargetMonitor) => {
      // When dropping on an empty column or column area outside of task cards
      const dragIndex = item.index;
      const hoverIndex = tasks.length; // Drop at the end of the column
      const sourceColumnId = item.columnId;
      const targetColumnId = column.id;
      
      // Only move the task if it's a different column
      if (sourceColumnId !== targetColumnId) {
        moveTask(dragIndex, hoverIndex, sourceColumnId, targetColumnId);
      }
      
      return { columnId: column.id };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Sort tasks by position
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  // Apply the drop ref to our element
  drop(ref);

  return (
    <div
      ref={ref}
      className={`bg-gray-100 p-3 rounded-md w-72 flex-shrink-0 max-h-full overflow-y-auto ${
        isOver ? 'bg-blue-50 border-2 border-blue-300' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-gray-700">{column.title}</h2>
        <div className="flex space-x-1">
          <button
            onClick={() => onAddTask(column.id)}
            className="text-sm p-1 hover:bg-gray-200 rounded"
            title="Add task"
          >
            <FiPlus className="text-blue-500" />
          </button>
          <button
            onClick={() => onEditColumn(column)}
            className="text-sm p-1 hover:bg-gray-200 rounded"
            title="Edit column"
          >
            <FiEdit className="text-gray-600" />
          </button>
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="text-sm p-1 hover:bg-gray-200 rounded"
            title="Delete column"
          >
            <FiTrash2 className="text-red-500" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => moveColumnLeft(column.id)}
          className={`text-sm p-1 hover:bg-gray-200 rounded ${isLeftmostColumn ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isLeftmostColumn}
          title="Move column left"
        >
          <FiArrowLeft className="text-gray-600" />
        </button>
        <span className="text-xs text-gray-500">Reorder Column</span>
        <button
          onClick={() => moveColumnRight(column.id)}
          className={`text-sm p-1 hover:bg-gray-200 rounded ${isRightmostColumn ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isRightmostColumn}
          title="Move column right"
        >
          <FiArrowRight className="text-gray-600" />
        </button>
      </div>

      <div className="column-tasks min-h-[100px]">
        {sortedTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            moveTask={moveTask}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onToggleComplete={onToggleComplete}
            onDuplicate={onDuplicateTask}
          />
        ))}
        {sortedTasks.length === 0 && (
          <div className="text-center py-4 text-gray-400">
            <p>Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnComponent; 