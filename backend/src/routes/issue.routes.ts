import { Router } from 'express';
import {
    issueBook,
    returnBook,
    getMyIssuedBooks,
    getIssuedBooksHistory
} from '../controllers/issue.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/issue', authenticateToken, issueBook);
router.post('/return', authenticateToken, returnBook);
router.get('/my-books', authenticateToken, getMyIssuedBooks);
router.get('/history', authenticateToken, getIssuedBooksHistory);

export default router;
