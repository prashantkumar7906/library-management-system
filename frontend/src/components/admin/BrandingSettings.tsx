import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Type, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api.service';

const BrandingSettings: React.FC = () => {
    const [settings, setSettings] = useState({
        library_name: '',
        library_logo: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            if (response.data.settings) {
                setSettings({
                    library_name: response.data.settings.library_name || '',
                    library_logo: response.data.settings.library_logo || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/admin/settings', { settings });
            setMessage({ type: 'success', text: 'Branding settings updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update settings' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, library_logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Branding Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Customize how your library appears on receipts and the portal.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </motion.div>
                )}

                <div className="glass-card space-y-8 p-8">
                    {/* Library Name */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <Type size={18} className="text-primary-500" />
                            Library Display Name
                        </label>
                        <input
                            type="text"
                            value={settings.library_name}
                            onChange={(e) => setSettings({ ...settings, library_name: e.target.value })}
                            className="input-field w-full"
                            placeholder="e.g. Central City Library"
                            required
                        />
                        <p className="text-xs text-gray-400">This name will appear as the header on all printed receipts.</p>
                    </div>

                    {/* Library Logo */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <ImageIcon size={18} className="text-primary-500" />
                            Library Logo
                        </label>

                        <div className="flex items-start gap-6">
                            <div className="flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                                {settings.library_logo ? (
                                    <img src={settings.library_logo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <ImageIcon className="text-gray-300" size={32} />
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors text-sm font-medium">
                                    <Upload size={16} />
                                    Choose Logo File
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </label>
                                <p className="text-xs text-gray-400">Recommended: Square image, PNG or SVG with transparent background.</p>
                                {settings.library_logo && (
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, library_logo: '' })}
                                        className="text-xs text-red-500 hover:underline block"
                                    >
                                        Remove logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary px-8 h-12 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-500/25"
                    >
                        {submitting ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Receipt Preview Card */}
            <div className="glass-card p-6 border-primary-100 dark:border-primary-900/30">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-4">Receipt Header Preview</h3>
                <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-100 dark:border-gray-800 text-center space-y-3">
                    {settings.library_logo ? (
                        <img src={settings.library_logo} alt="Logo" className="h-12 mx-auto object-contain" />
                    ) : (
                        <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto text-primary-500">
                            <ImageIcon size={24} />
                        </div>
                    )}
                    <h4 className="text-lg font-bold">{settings.library_name || 'Library Name'}</h4>
                    <div className="w-full border-b border-dashed border-gray-200 dark:border-gray-800 my-2"></div>
                </div>
            </div>
        </div>
    );
};

export default BrandingSettings;
