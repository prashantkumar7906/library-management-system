import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.service';
import { Book } from '../types';
import { pageVariants, cardHoverVariants, staggerContainer, drawerVariants } from '../animations/variants';

const BookBrowser: React.FC = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [search, setSearch] = useState('');
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooks();
    }, [search]);

    const fetchBooks = async () => {
        try {
            const response = await api.get('/books', {
                params: { search, available: true },
            });
            setBooks(response.data.books || []);
        } catch (error) {
            console.error('Failed to fetch books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIssueBook = async (bookId: number) => {
        try {
            await api.post('/issues/issue', { book_id: bookId });
            alert('Book issued successfully!');
            setSelectedBook(null);
            fetchBooks();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to issue book');
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-light-bg dark:bg-dark-bg"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Header */}
            <div className="bg-white dark:bg-dark-card shadow-sm border-b border-light-border dark:border-dark-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <ArrowLeft />
                            </button>
                            <h1 className="text-2xl font-bold">Browse Books</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search books by title or author..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-12"
                        />
                    </div>
                </div>

                {/* Books Grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {books.map((book) => (
                        <motion.div
                            key={book.book_id}
                            className="glass-card cursor-pointer"
                            variants={cardHoverVariants}
                            whileHover="hover"
                            onClick={() => setSelectedBook(book)}
                        >
                            <div className="aspect-[3/4] bg-gradient-to-br from-primary-400 to-purple-500 rounded-xl mb-4 flex items-center justify-center">
                                <BookOpen className="w-16 h-16 text-white" />
                            </div>
                            <h3 className="font-semibold mb-1 line-clamp-2">{book.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{book.author}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">{book.genre}</span>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${book.available_copies > 0
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                >
                                    {book.available_copies > 0 ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Book Details Drawer */}
                {selectedBook && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedBook(null)}
                    >
                        <motion.div
                            className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-2xl w-full"
                            variants={drawerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-2">{selectedBook.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">{selectedBook.author}</p>
                            <div className="space-y-2 mb-6">
                                <p>
                                    <strong>Genre:</strong> {selectedBook.genre}
                                </p>
                                <p>
                                    <strong>Publisher:</strong> {selectedBook.publisher}
                                </p>
                                <p>
                                    <strong>Year:</strong> {selectedBook.publication_year}
                                </p>
                                <p>
                                    <strong>Available Copies:</strong> {selectedBook.available_copies} /{' '}
                                    {selectedBook.total_copies}
                                </p>
                                {selectedBook.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                        {selectedBook.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleIssueBook(selectedBook.book_id)}
                                    disabled={selectedBook.available_copies === 0}
                                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Issue Book
                                </button>
                                <button onClick={() => setSelectedBook(null)} className="btn-secondary flex-1">
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default BookBrowser;
