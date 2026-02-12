import { Request, Response } from 'express';
import { query } from '../config/database';
import { Book } from '../types';
import { logAudit } from '../services/audit.service';
import { io } from '../server';

export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, genre, available, page = 1, limit = 20 } = req.query;

        let sql = 'SELECT * FROM BOOKS WHERE status = ?';
        const params: any[] = ['ACTIVE'];

        // Fuzzy search on title and author
        if (search) {
            sql += ' AND (title LIKE ? OR author LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Filter by genre
        if (genre) {
            sql += ' AND genre = ?';
            params.push(genre);
        }

        // Filter by availability
        if (available === 'true') {
            sql += ' AND available_copies > 0';
        }

        // Pagination
        const offset = (Number(page) - 1) * Number(limit);
        sql += ' ORDER BY title ASC LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);

        const books = await query<Book[]>(sql, params);

        // Get total count
        let countSql = 'SELECT COUNT(*) as total FROM BOOKS WHERE status = ?';
        const countParams: any[] = ['ACTIVE'];

        if (search) {
            countSql += ' AND (title LIKE ? OR author LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm);
        }

        if (genre) {
            countSql += ' AND genre = ?';
            countParams.push(genre);
        }

        if (available === 'true') {
            countSql += ' AND available_copies > 0';
        }

        const [{ total }] = await query<any[]>(countSql, countParams);

        res.status(200).json({
            books,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ error: 'Failed to fetch books', details: error instanceof Error ? error.message : String(error) });
    }
};

export const getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const books = await query<Book[]>(
            'SELECT * FROM BOOKS WHERE book_id = ? AND status = ?',
            [id, 'ACTIVE']
        );

        if (books.length === 0) {
            res.status(404).json({ error: 'Book not found' });
            return;
        }

        res.status(200).json({ book: books[0] });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
};

export const addBook = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        let {
            title,
            author,
            isbn,
            genre,
            publisher,
            publication_year,
            total_copies,
            description,
            cover_image_url
        } = req.body;

        if (!title || !author) {
            res.status(400).json({ error: 'Title and author are required' });
            return;
        }

        // Auto-assign ISBN if not provided
        if (!isbn) {
            const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
            const checkDigit = Math.floor(Math.random() * 10);
            isbn = `978-${random}-${checkDigit}`;
        }

        const result = await query<any>(
            `INSERT INTO BOOKS 
       (title, author, isbn, genre, publisher, publication_year, total_copies, available_copies, description, cover_image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                author,
                isbn || null,
                genre || null,
                publisher || null,
                publication_year || null,
                total_copies || 1,
                total_copies || 1,
                description || null,
                cover_image_url || null
            ]
        );

        const bookId = result.insertId;

        await logAudit({
            action: 'BOOK_ADDED',
            entityType: 'BOOK',
            entityId: bookId,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { title, author }
        });

        // Notify all connected clients
        io.emit('book_added', { bookId, title, author });

        res.status(201).json({
            message: 'Book added successfully',
            bookId
        });
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ error: 'Failed to add book' });
    }
};

export const updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { id } = req.params;
        const updates = req.body;

        // Build dynamic update query
        const allowedFields = [
            'title',
            'author',
            'isbn',
            'genre',
            'publisher',
            'publication_year',
            'total_copies',
            'description',
            'cover_image_url',
            'status'
        ];

        const updateFields: string[] = [];
        const updateValues: any[] = [];

        Object.keys(updates).forEach((key) => {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            res.status(400).json({ error: 'No valid fields to update' });
            return;
        }

        updateValues.push(id);

        await query(
            `UPDATE BOOKS SET ${updateFields.join(', ')} WHERE book_id = ?`,
            updateValues
        );

        await logAudit({
            action: 'BOOK_UPDATED',
            entityType: 'BOOK',
            entityId: Number(id),
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: updates
        });

        io.emit('book_updated', { bookId: id });

        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { id } = req.params;

        // Soft delete by setting status to ARCHIVED
        await query('UPDATE BOOKS SET status = ? WHERE book_id = ?', ['ARCHIVED', id]);

        await logAudit({
            action: 'BOOK_DELETED',
            entityType: 'BOOK',
            entityId: Number(id),
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: {}
        });

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
};

export const getGenres = async (req: Request, res: Response): Promise<void> => {
    try {
        const genres = await query<any[]>(
            'SELECT DISTINCT genre FROM BOOKS WHERE genre IS NOT NULL AND status = ? ORDER BY genre',
            ['ACTIVE']
        );

        res.status(200).json({ genres: genres.map((g) => g.genre) });
    } catch (error) {
        console.error('Get genres error:', error);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
};
