import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import MediaEditModal from '../components/MediaEditModal.jsx';
import BulkEditModal from '../components/BulkEditModal.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function GalleryPage() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');
	const [tags, setTags] = useState('');
	const [shared, setShared] = useState(false);
	const [category, setCategory] = useState('');
	const [selected, setSelected] = useState({});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	
	// Modal states
	const [editModal, setEditModal] = useState({ isOpen: false, item: null });
	const [bulkEditModal, setBulkEditModal] = useState(false);

	const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([id]) => id), [selected]);
	const selectedItems = useMemo(() => items.filter(item => selected[item._id]), [items, selected]);

	const load = async () => {
		setLoading(true);
		setError('');
		try {
			const params = {};
			if (query) params.q = query;
			if (tags) params.tags = tags;
			if (shared) params.shared = 'true';
			if (category) params.category = category;
			
			const res = await axios.get(`${API_BASE_URL}/api/media`, { params, withCredentials: true });
			
			// Handle both old and new response formats
			if (res.data.items) {
				setItems(res.data.items);
			} else {
				setItems(res.data);
			}
		} catch (e) {
			setError('Failed to load media items');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const toggleSelect = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));

	const selectAll = () => {
		const newSelected = {};
		items.forEach(item => {
			newSelected[item._id] = true;
		});
		setSelected(newSelected);
	};

	const clearSelection = () => setSelected({});

	const openEditModal = (item) => {
		setEditModal({ isOpen: true, item });
	};

	const closeEditModal = () => {
		setEditModal({ isOpen: false, item: null });
	};

	const openBulkEditModal = () => {
		setBulkEditModal(true);
	};

	const closeBulkEditModal = () => {
		setBulkEditModal(false);
	};

	const handleItemUpdate = (updatedItem) => {
		setItems(prev => prev.map(item => 
			item._id === updatedItem._id ? updatedItem : item
		));
		setSuccess('Media item updated successfully!');
		setTimeout(() => setSuccess(''), 3000);
	};

	const handleBulkUpdate = (result) => {
		// Reload items to get updated data
		load();
		setSuccess(`${result.modifiedCount} items updated successfully!`);
		setTimeout(() => setSuccess(''), 3000);
		clearSelection();
	};

	const removeItem = async (id) => {
		if (!confirm('Delete this item? This action can be undone from the deleted items section.')) return;
		
		try {
			await axios.delete(`${API_BASE_URL}/api/media/${id}`, { withCredentials: true });
			setItems((arr) => arr.filter((x) => x._id !== id));
			setSuccess('Item deleted successfully!');
			setTimeout(() => setSuccess(''), 3000);
		} catch (err) {
			setError('Failed to delete item');
		}
	};

	const removeSelected = async () => {
		if (selectedIds.length === 0) return;
		if (!confirm(`Delete ${selectedIds.length} selected items? This action can be undone.`)) return;
		
		try {
			await axios.delete(`${API_BASE_URL}/api/media/bulk`, { 
				data: { ids: selectedIds }, 
				withCredentials: true 
			});
			setItems((arr) => arr.filter((x) => !selectedIds.includes(x._id)));
			clearSelection();
			setSuccess(`${selectedIds.length} items deleted successfully!`);
			setTimeout(() => setSuccess(''), 3000);
		} catch (err) {
			setError('Failed to delete selected items');
		}
	};

	const downloadZip = async () => {
		if (selectedIds.length === 0) return;
		try {
			const res = await axios.post(
				`${API_BASE_URL}/api/media/zip`, 
				{ ids: selectedIds }, 
				{ withCredentials: true, responseType: 'blob' }
			);
			const url = window.URL.createObjectURL(new Blob([res.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `media-${Date.now()}.zip`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			setError('Failed to download ZIP file');
		}
	};

	const getFileIcon = (mimeType) => {
		if (mimeType?.startsWith('image/')) return '🖼️';
		if (mimeType?.startsWith('video/')) return '🎥';
		if (mimeType?.startsWith('audio/')) return '🎵';
		if (mimeType?.includes('pdf')) return '📄';
		if (mimeType?.includes('word') || mimeType?.includes('excel') || mimeType?.includes('powerpoint')) return '📊';
		return '📁';
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-slate-900">Media Gallery</h2>
				<p className="text-slate-600 mt-2">Manage and organize your media files</p>
			</div>

			{/* Search and Filter Controls */}
			<div className="bg-white rounded-lg border p-6 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
						<input 
							className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={query} 
							onChange={(e) => setQuery(e.target.value)} 
							placeholder="Title/description" 
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
						<input 
							className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={tags} 
							onChange={(e) => setTags(e.target.value)} 
							placeholder="e.g. travel, family" 
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
						<select 
							className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						>
							<option value="">All Categories</option>
							<option value="general">General</option>
							<option value="photos">Photos</option>
							<option value="videos">Videos</option>
							<option value="documents">Documents</option>
							<option value="music">Music</option>
							<option value="other">Other</option>
						</select>
					</div>
					<div className="flex items-end">
						<label className="flex items-center gap-2 text-slate-700">
							<input 
								type="checkbox" 
								checked={shared} 
								onChange={(e) => setShared(e.target.checked)} 
							/>
							Shared Only
						</label>
					</div>
				</div>
				
				<div className="flex flex-wrap gap-3">
					<button 
						className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50 transition-colors" 
						onClick={load}
					>
						🔍 Apply Filters
					</button>
					<Link 
						to="/upload" 
						className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors"
					>
						📤 Upload
					</Link>
				</div>
			</div>

			{/* Bulk Actions Bar */}
			{selectedIds.length > 0 && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<span className="text-blue-800 font-medium">
								{selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
							</span>
							<button
								onClick={clearSelection}
								className="text-blue-600 hover:text-blue-800 text-sm underline"
							>
								Clear selection
							</button>
						</div>
						<div className="flex gap-3">
							<button
								onClick={openBulkEditModal}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
							>
								✏️ Bulk Edit
							</button>
							<button
								onClick={removeSelected}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
							>
								🗑️ Delete Selected
							</button>
							<button
								onClick={downloadZip}
								className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
							>
								📦 Download ZIP
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Messages */}
			{error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
					<p className="text-red-600">{error}</p>
				</div>
			)}
			
			{success && (
				<div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
					<p className="text-green-600">{success}</p>
				</div>
			)}

			{/* Gallery Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{loading ? (
					<div className="col-span-full text-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-slate-600">Loading media items...</p>
					</div>
				) : items.length === 0 ? (
					<div className="col-span-full text-center py-12">
						<div className="text-slate-400 mb-4">
							<svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<p className="text-slate-500 text-lg font-medium">No media items found</p>
						<p className="text-slate-400 text-sm mt-1">
							{query || tags || category || shared 
								? 'Try adjusting your search or filter criteria.' 
								: 'Start by uploading some media files.'}
						</p>
					</div>
				) : (
					items.map(item => (
						<div key={item._id} className="group relative border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
							{/* Selection Checkbox */}
							<div className="absolute top-2 left-2 z-10">
								<input
									type="checkbox"
									checked={!!selected[item._id]}
									onChange={() => toggleSelect(item._id)}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
								/>
							</div>

							{/* Media Preview */}
							<div className="relative h-48 bg-slate-100">
								{item.mimeType?.startsWith('image/') ? (
									<img 
										src={`${API_BASE_URL}/uploads/${item.filename}`} 
										alt={item.title || item.originalName} 
										className="h-full w-full object-cover" 
									/>
								) : (
									<div className="h-full w-full flex items-center justify-center text-4xl text-slate-400">
										{getFileIcon(item.mimeType)}
									</div>
								)}
								
								{/* Action Buttons Overlay */}
								<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
									<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
										<button
											onClick={() => openEditModal(item)}
											className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
											title="Edit"
										>
											✏️
										</button>
										<Link
											to={`/media/${item._id}`}
											className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
											title="View Details"
										>
											👁️
										</Link>
										<button
											onClick={() => removeItem(item._id)}
											className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
											title="Delete"
										>
											🗑️
										</button>
									</div>
								</div>
							</div>

							{/* Media Info */}
							<div className="p-4">
								<div className="flex items-start justify-between gap-2 mb-2">
									<h3 className="font-medium text-slate-900 truncate flex-1">
										{item.title || item.originalName}
									</h3>
									<span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
										{item.category || 'general'}
									</span>
								</div>
								
								{item.description && (
									<p className="text-slate-600 text-sm mb-2 line-clamp-2">
										{item.description}
									</p>
								)}
								
								{item.tags && item.tags.length > 0 && (
									<div className="flex flex-wrap gap-1 mb-2">
										{item.tags.slice(0, 3).map(tag => (
											<span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
												#{tag}
											</span>
										))}
										{item.tags.length > 3 && (
											<span className="text-xs text-slate-500">
												+{item.tags.length - 3} more
											</span>
										)}
									</div>
								)}
								
								<div className="flex items-center justify-between text-xs text-slate-500">
									<span>{new Date(item.createdAt).toLocaleDateString()}</span>
									{item.isShared && (
										<span className="text-green-600">🌐 Public</span>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* Modals */}
			<MediaEditModal
				item={editModal.item}
				isOpen={editModal.isOpen}
				onClose={closeEditModal}
				onUpdate={handleItemUpdate}
			/>
			
			<BulkEditModal
				selectedItems={selectedItems}
				isOpen={bulkEditModal}
				onClose={closeBulkEditModal}
				onUpdate={handleBulkUpdate}
			/>
		</div>
	);
} 