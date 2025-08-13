import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function MediaEditModal({ item, isOpen, onClose, onUpdate }) {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		tags: '',
		category: 'general',
		location: '',
		dateTaken: '',
		isShared: false
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (item) {
			setFormData({
				title: item.title || '',
				description: item.description || '',
				tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
				category: item.category || 'general',
				location: item.location || '',
				dateTaken: item.dateTaken ? new Date(item.dateTaken).toISOString().split('T')[0] : '',
				isShared: item.isShared || false
			});
		}
	}, [item]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const updateData = {
				...formData,
				tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
			};

			const response = await axios.put(
				`${API_BASE_URL}/api/media/${item._id}`,
				updateData,
				{ withCredentials: true }
			);

			onUpdate(response.data);
			onClose();
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to update media item');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	if (!isOpen || !item) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-semibold text-slate-900">Edit Media Item</h3>
						<button
							onClick={onClose}
							className="text-slate-400 hover:text-slate-600 text-2xl"
						>
							×
						</button>
					</div>

					{/* File Preview */}
					<div className="mb-6 p-4 bg-slate-50 rounded-lg">
						<div className="flex items-center gap-4">
							{item.mimeType?.startsWith('image/') ? (
								<img
									src={`${API_BASE_URL}/uploads/${item.filename}`}
									alt={item.title}
									className="h-20 w-20 object-cover rounded"
								/>
							) : (
								<div className="h-20 w-20 bg-slate-200 rounded flex items-center justify-center text-2xl">
									{item.mimeType?.startsWith('video/') ? '🎥' : 
									 item.mimeType?.startsWith('audio/') ? '🎵' : 
									 item.mimeType?.includes('pdf') ? '📄' : '📁'}
								</div>
							)}
							<div>
								<p className="font-medium text-slate-900">{item.originalName}</p>
								<p className="text-sm text-slate-500">{item.mimeType}</p>
								<p className="text-sm text-slate-500">
									{Math.round(item.size / 1024)} KB
								</p>
							</div>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Title
								</label>
								<input
									type="text"
									value={formData.title}
									onChange={(e) => handleChange('title', e.target.value)}
									className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter title"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Category
								</label>
								<select
									value={formData.category}
									onChange={(e) => handleChange('category', e.target.value)}
									className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="general">General</option>
									<option value="photos">Photos</option>
									<option value="videos">Videos</option>
									<option value="documents">Documents</option>
									<option value="music">Music</option>
									<option value="other">Other</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Location
								</label>
								<input
									type="text"
									value={formData.location}
									onChange={(e) => handleChange('location', e.target.value)}
									className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="e.g., New York, NY"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Date Taken
								</label>
								<input
									type="date"
									value={formData.dateTaken}
									onChange={(e) => handleChange('dateTaken', e.target.value)}
									className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Description
							</label>
							<textarea
								value={formData.description}
								onChange={(e) => handleChange('description', e.target.value)}
								rows={3}
								className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Describe your media item..."
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Tags (comma separated)
							</label>
							<input
								type="text"
								value={formData.tags}
								onChange={(e) => handleChange('tags', e.target.value)}
								className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="e.g., vacation, family, 2024"
							/>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="isShared"
								checked={formData.isShared}
								onChange={(e) => handleChange('isShared', e.target.checked)}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
							/>
							<label htmlFor="isShared" className="text-slate-700">
								Make publicly accessible
							</label>
						</div>

						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						)}

						<div className="flex gap-3 pt-4">
							<button
								type="button"
								onClick={onClose}
								className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
							>
								{loading ? 'Updating...' : 'Update'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
