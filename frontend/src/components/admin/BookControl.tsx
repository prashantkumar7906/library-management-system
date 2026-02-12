import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Edit2, Trash2, X, XCircle } from 'lucide-react';
import api from '../../services/api.service';

interface Book {
    book_id: number;
    title: string;
    author: string;
    isbn: string;
    genre: string;
    total_copies: number;
    available_copies: number;
}

const BookControl: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        publisher: '',
        publication_year: new Date().getFullYear().toString(),
        total_copies: '1',
        description: '',
        cover_image_url: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await api.get('/books');
            setBooks(response.data.books);
        } catch (error) {
            console.error('Failed to fetch books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.post('/books', {
                ...formData,
                publication_year: parseInt(formData.publication_year),
                total_copies: parseInt(formData.total_copies)
            });
            setShowAddModal(false);
            setFormData({
                title: '',
                author: '',
                isbn: '',
                genre: '',
                publisher: '',
                publication_year: new Date().getFullYear().toString(),
                total_copies: '1',
                description: '',
                cover_image_url: ''
            });
            fetchBooks();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add book');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.includes(searchQuery)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Book Control</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage library inventory
                    </p>
                </div>
                <motion.button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus size={20} />
                    Add Book
                </motion.button>
            </div>

            <div className="glass-card">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books by title, author, or ISBN..."
                    className="input-field w-full"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                    <motion.div
                        key={book.book_id}
                        className="glass-card group"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <BookOpen className="text-primary-500" size={24} />
                            <div className="flex gap-2">
                                <button className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600">
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-semibold mb-1 text-lg group-hover:text-primary-500 transition-colors line-clamp-1">
                            {book.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">{book.author}</p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-medium text-gray-600 dark:text-gray-400">
                                {book.genre}
                            </span>
                            <span className={`px-2 py-1 rounded font-bold ${book.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {book.available_copies}/{book.total_copies} available
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Book Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        className="glass-card max-w-2xl w-full p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold font-display">Add New Library Resource</h2>
                            <button
                                onClick={() => { setShowAddModal(false); setError(''); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddBook} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Book Title</label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field w-full"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="The Great Gatsby"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Author</label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field w-full"
                                            value={formData.author}
                                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                                            placeholder="F. Scott Fitzgerald"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold mb-2 block">ISBN</label>
                                            <input
                                                type="text"
                                                className="input-field w-full"
                                                value={formData.isbn}
                                                onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                                                placeholder="978-..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold mb-2 block">Genre</label>
                                            <input
                                                type="text"
                                                className="input-field w-full"
                                                value={formData.genre}
                                                onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                                placeholder="Classic"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Publisher</label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            value={formData.publisher}
                                            onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                                            placeholder="Charles Scribner's Sons"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold mb-2 block">Year</label>
                                            <input
                                                type="number"
                                                className="input-field w-full"
                                                value={formData.publication_year}
                                                onChange={e => setFormData({ ...formData, publication_year: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold mb-2 block">Copies</label>
                                            <input
                                                type="number"
                                                className="input-field w-full"
                                                value={formData.total_copies}
                                                onChange={e => setFormData({ ...formData, total_copies: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Cover URL</label>
                                        <input
                                            type="url"
                                            className="input-field w-full"
                                            value={formData.cover_image_url}
                                            onChange={e => setFormData({ ...formData, cover_image_url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold mb-2 block">Description</label>
                                <textarea
                                    className="input-field w-full h-32 py-4"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter book summary..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                        Index Book
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default BookControl;
