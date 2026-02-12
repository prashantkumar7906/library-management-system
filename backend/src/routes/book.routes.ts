import { Router } from 'express';
import {
    getAllBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
    getGenres
} from '../controllers/book.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllBooks);
router.get('/genres', getGenres);
router.get('/:id', getBookById);
router.post('/', authenticateToken, requireAdmin, addBook);
router.put('/:id', authenticateToken, requireAdmin, updateBook);
router.delete('/:id', authenticateToken, requireAdmin, deleteBook);

export default router;
