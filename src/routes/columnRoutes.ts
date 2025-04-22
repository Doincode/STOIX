import { Router } from 'express';
import { 
  getAllColumns, 
  getColumnById, 
  createColumn, 
  updateColumn, 
  deleteColumn,
  updatePosition 
} from '../controllers/ColumnController';

const router = Router();

router.get('/', getAllColumns);
router.get('/:id', getColumnById);
router.post('/', createColumn);
router.put('/:id', updateColumn);
router.delete('/:id', deleteColumn);
router.put('/:id/position', updatePosition);

export default router; 