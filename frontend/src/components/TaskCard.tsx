import { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { FiEdit, FiTrash2, FiCheck, FiCopy } from 'react-icons/fi';
import { Task, DragItem } from '../types';

interface TaskCardProps {
  task: Task;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number, sourceColumnId: number, targetColumnId: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
  onDuplicate: (task: Task) => void;
}

interface DragCollectedProps {
  isDragging: boolean;
}

interface DropCollectedProps {
  handlerId: string | symbol | null;
}

const TaskCard = ({ 
  task, 
  index,
  moveTask, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onDuplicate
}: TaskCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, DropCollectedProps>({
    accept: 'TASK',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceColumnId = item.columnId;
      const targetColumnId = task.column_id;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex && sourceColumnId === targetColumnId) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset ? clientOffset.y - hoverBoundingRect.top : 0;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveTask(dragIndex, hoverIndex, sourceColumnId, targetColumnId);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
      item.columnId = targetColumnId;
    },
  });
  
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, DragCollectedProps>({
    type: 'TASK',
    item: () => ({
      id: task.id,
      index,
      columnId: task.column_id,
      position: task.position,
      type: 'TASK'
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  drag(drop(ref));
  
  return (
    <div
      ref={ref}
      className={`p-3 mb-2 bg-white rounded shadow cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${task.completed ? 'border-l-4 border-green-500' : ''}`}
      data-handler-id={handlerId}
    >
      <div className="flex justify-between mb-2">
        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        <div className="flex space-x-1">
          <button
            onClick={() => onToggleComplete(task.id, !task.completed)}
            className="text-sm p-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <FiCheck className={task.completed ? 'text-green-500' : 'text-gray-400'} />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="text-sm p-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <FiEdit className="text-gray-600" />
          </button>
          <button
            onClick={() => onDuplicate(task)}
            className="text-sm p-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <FiCopy className="text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-sm p-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <FiTrash2 className="text-red-500" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600">{task.description}</p>
    </div>
  );
};

export default TaskCard; 