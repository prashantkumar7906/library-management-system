import { Request, Response } from 'express';
import { query, transaction } from '../config/database';
import { IssuedBook, Book, Subscription } from '../types';
import { logAudit } from '../services/audit.service';
import { io } from '../server';

export const issueBook = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { book_id } = req.body;
        const user_id = req.user.userId;

        if (!book_id) {
            res.status(400).json({ error: 'Book ID is required' });
            return;
        }

        // Use transaction for data consistency
        const result = await transaction(async (conn) => {
            // Check if user has active subscription
            const [subscription] = await conn.execute<any[]>(
                `SELECT * FROM SUBSCRIPTIONS 
         WHERE user_id = ? AND status = 'ACTIVE' AND end_date >= CURDATE()
         ORDER BY end_date DESC LIMIT 1`,
                [user_id]
            );

            if (subscription.length === 0) {
                throw new Error('No active subscription found');
            }

            // Check book availability
            const [books] = await conn.execute<any[]>(
                'SELECT * FROM BOOKS WHERE book_id = ? AND status = ? FOR UPDATE',
                [book_id, 'ACTIVE']
            );

            if (books.length === 0) {
                throw new Error('Book not found');
            }

            const book = books[0];

            if (book.available_copies <= 0) {
                throw new Error('Book not available');
            }

            // Check if user already has this book issued
            const [existingIssue] = await conn.execute<any[]>(
                `SELECT * FROM ISSUED_BOOKS 
         WHERE user_id = ? AND book_id = ? AND status IN ('ISSUED', 'OVERDUE')`,
                [user_id, book_id]
            );

            if (existingIssue.length > 0) {
                throw new Error('You already have this book issued');
            }

            // Calculate due date (30 days from now)
            const issueDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);

            // Insert issued book record
            const [issueResult] = await conn.execute<any>(
                `INSERT INTO ISSUED_BOOKS (user_id, book_id, issue_date, due_date, status) 
         VALUES (?, ?, ?, ?, ?)`,
                [user_id, book_id, issueDate, dueDate, 'ISSUED']
            );

            const issueId = issueResult.insertId;

            // Update available copies
            await conn.query(
                'UPDATE BOOKS SET available_copies = available_copies - 1 WHERE book_id = ?',
                [book_id]
            );

            return { issueId, dueDate };
        });

        await logAudit({
            action: 'BOOK_ISSUED',
            entityType: 'ISSUED_BOOKS',
            entityId: result.issueId,
            performedBy: user_id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { book_id }
        });

        // Notify all clients about availability change
        io.emit('book_availability_changed', { book_id });

        res.status(201).json({
            message: 'Book issued successfully',
            issueId: result.issueId,
            dueDate: result.dueDate
        });
    } catch (error: any) {
        console.error('Issue book error:', error);
        res.status(400).json({ error: error.message || 'Failed to issue book' });
    }
};

export const returnBook = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { issue_id } = req.body;
        const user_id = req.user.userId;

        if (!issue_id) {
            res.status(400).json({ error: 'Issue ID is required' });
            return;
        }

        const result = await transaction(async (conn) => {
            // Get issued book record
            const [issuedBooks] = await conn.execute<any[]>(
                `SELECT * FROM ISSUED_BOOKS 
         WHERE issue_id = ? AND user_id = ? AND status IN ('ISSUED', 'OVERDUE') FOR UPDATE`,
                [issue_id, user_id]
            );

            if (issuedBooks.length === 0) {
                throw new Error('Issued book record not found');
            }

            const issuedBook = issuedBooks[0];
            const returnDate = new Date();
            const dueDate = new Date(issuedBook.due_date);

            // Calculate penalty if overdue
            let penaltyAmount = 0;
            if (returnDate > dueDate) {
                const daysOverdue = Math.ceil(
                    (returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                const penaltyPerDay = Number(process.env.PENALTY_PER_DAY) || 10;
                penaltyAmount = daysOverdue * penaltyPerDay;
            }

            // Update issued book record
            await conn.query(
                `UPDATE ISSUED_BOOKS 
         SET return_date = ?, penalty_amount = ?, status = ? 
         WHERE issue_id = ?`,
                [returnDate, penaltyAmount, 'RETURNED', issue_id]
            );

            // Update available copies
            await conn.query(
                'UPDATE BOOKS SET available_copies = available_copies + 1 WHERE book_id = ?',
                [issuedBook.book_id]
            );

            return { penaltyAmount, bookId: issuedBook.book_id };
        });

        await logAudit({
            action: 'BOOK_RETURNED',
            entityType: 'ISSUED_BOOKS',
            entityId: Number(issue_id),
            performedBy: user_id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { penalty: result.penaltyAmount }
        });

        // Notify all clients about availability change
        io.emit('book_availability_changed', { book_id: result.bookId });

        res.status(200).json({
            message: 'Book returned successfully',
            penaltyAmount: result.penaltyAmount
        });
    } catch (error: any) {
        console.error('Return book error:', error);
        res.status(400).json({ error: error.message || 'Failed to return book' });
    }
};

export const getMyIssuedBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const issuedBooks = await query<any[]>(
            `SELECT ib.*, b.title, b.author, b.cover_image_url 
       FROM ISSUED_BOOKS ib 
       JOIN BOOKS b ON ib.book_id = b.book_id 
       WHERE ib.user_id = ? AND ib.status IN ('ISSUED', 'OVERDUE')
       ORDER BY ib.due_date ASC`,
            [req.user.userId]
        );

        res.status(200).json({ issuedBooks });
    } catch (error) {
        console.error('Get issued books error:', error);
        res.status(500).json({ error: 'Failed to fetch issued books' });
    }
};

export const getIssuedBooksHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const history = await query<any[]>(
            `SELECT ib.*, b.title, b.author, b.cover_image_url 
       FROM ISSUED_BOOKS ib 
       JOIN BOOKS b ON ib.book_id = b.book_id 
       WHERE ib.user_id = ?
       ORDER BY ib.created_at DESC
       LIMIT 50`,
            [req.user.userId]
        );

        res.status(200).json({ history });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
