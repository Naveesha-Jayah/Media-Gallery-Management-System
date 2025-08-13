import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function BulkEditModal({ selectedItems, isOpen, onClose, onUpdate }) {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		tags: '',
		category: '',
		location: '',
		dateTaken: '',
		isShared: null
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			// Prepare update data (only include fields that have values)
			const updateData = {};
			if (formData.title) updateData.title = formData.title;
			if (formData.description) updateData.description = formData.description;
			if (formData.tags) updateData.tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
			if (formData.category) updateData.category = formData.category;
			if (formData.location) updateData.location = formData.location;
			if (formData.dateTaken) updateData.dateTaken = formData.dateTaken;
			if (formData.isShared !== null) updateData.isShared = formData.isShared;

			if (Object.keys(updateData).length === 0) {
				setError('Please fill in at least one field to update');
				return;
			}

			const response = await axios.put(
				`${API_BASE_URL}/api/media/bulk`,
				{
					ids: selectedItems.map(item => item._id),
					updates: updateData
				},
				{ withCredentials: true }
			);

			onUpdate(response.data);
			onClose();
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to update media items');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const resetForm = () => {
		setFormData({
			title: '',
			description: '',
			tags: '',
			category: '',
			location: '',
			dateTaken: '',
			isShared: null
		});
		setError('');
	};

	if (!isOpen || selectedItems.length === 0) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-semibold text-slate-900">
							Bulk Edit ({selectedItems.length} items)
						</h3>
						<button
							onClick={onClose}
							className="text-slate-400 hover:text-slate-600 text-2xl"
						>
							×
						</button>
					</div>

					{/* Selected Items Preview */}
					<div className="mb-6 p-4 bg-slate-50 rounded-lg">
						<p className="text-sm text-slate-600 mb-2">Selected items:</p>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
							{selectedItems.slice(0, 6).map((item, index) => (
								<div key={item._id} className="flex items-center gap-2 text-sm">
									<span className="text-slate-400">
										{item.mimeType?.startsWith('image/') ? '🖼️' : 
										 item.mimeType?.startsWith('video/') ? '🎥' : 
										 item.mimeType?.startsWith('audio/') ? '🎵' : 
										 item.mimeType?.includes('pdf') ? '📄' : '📁'}
									</span>
									<span className="truncate">{item.originalName}</span>
								</div>
							))}
							{selectedItems.length > 6 && (
								<div className="text-sm text-slate-500">
									+{selectedItems.length - 6} more...
								</div>
							)}
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Title (leave empty to keep existing)
								</label>
								<input
									type="text"
									value={formData.title}
									onChange={(e) => handleChange('title', e.target.value)}
									className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="New title for all items"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Category (leave empty to keep existing)
								</label>
								<select
									value={formData.category}
									onChange={(e) => handleChange('category', e.target.value)}
									className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">Keep existing</option>
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
									Location (leave empty to keep existing)
								</label>
								<input
									type="text"
									value={formData.location}
									onChange={(e) => handleChange('location', e.target.value)}
									className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="New location for all items"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Date Taken (leave empty to keep existing)
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
								Description (leave empty to keep existing)
							</label>
							<textarea
								value={formData.description}
								onChange={(e) => handleChange('description', e.target.value)}
								rows={3}
								className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="New description for all items"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Tags (leave empty to keep existing, comma separated)
							</label>
							<input
								type="text"
								value={formData.tags}
								onChange={(e) => handleChange('tags', e.target.value)}
								className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="New tags for all items"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Public Access
							</label>
							<select
								value={formData.isShared === null ? '' : formData.isShared.toString()}
								onChange={(e) => handleChange('isShared', e.target.value === '' ? null : e.target.value === 'true')}
								className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="">Keep existing</option>
								<option value="true">Make all public</option>
								<option value="false">Make all private</option>
							</select>
						</div>

						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						)}

						<div className="flex gap-3 pt-4">
							<button
								type="button"
								onClick={resetForm}
								className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
							>
								Reset
							</button>
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
								{loading ? 'Updating...' : `Update ${selectedItems.length} Items`}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
