import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from '../components/Dropzone.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function UploadPage() {
	const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'multiple'
	const [files, setFiles] = useState([]);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [tags, setTags] = useState('');
	const [category, setCategory] = useState('general');
	const [location, setLocation] = useState('');
	const [dateTaken, setDateTaken] = useState('');
	const [isShared, setIsShared] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [uploadProgress, setUploadProgress] = useState({});

	const handleFileSelected = (selectedFiles) => {
		if (uploadMode === 'single') {
			setFiles([selectedFiles]);
		} else {
			setFiles(Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles]);
		}
	};

	const clearForm = () => {
		setFiles([]);
		setTitle('');
		setDescription('');
		setTags('');
		setCategory('general');
		setLocation('');
		setDateTaken('');
		setIsShared(false);
		setUploadProgress({});
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		
		if (files.length === 0) {
			setError('Please select at least one file');
			return;
		}

		setUploading(true);
		
		try {
			if (uploadMode === 'single') {
				// Single file upload
				const form = new FormData();
				form.append('file', files[0]);
				form.append('title', title || files[0].name);
				form.append('description', description);
				form.append('tags', tags);
				form.append('category', category);
				form.append('location', location);
				form.append('dateTaken', dateTaken);
				form.append('isShared', isShared);

				await axios.post(`${API_BASE_URL}/api/media`, form, { 
					withCredentials: true, 
					headers: { 'Content-Type': 'multipart/form-data' } 
				});
			} else {
				// Multiple file upload
				const form = new FormData();
				files.forEach(file => {
					form.append('files', file);
				});
				form.append('title', title);
				form.append('description', description);
				form.append('tags', tags);
				form.append('category', category);
				form.append('location', location);
				form.append('dateTaken', dateTaken);
				form.append('isShared', isShared);

				await axios.post(`${API_BASE_URL}/api/media/multiple`, form, { 
					withCredentials: true, 
					headers: { 'Content-Type': 'multipart/form-data' } 
				});
			}

			setSuccess(`${files.length} file(s) uploaded successfully!`);
			clearForm();
		} catch (e) {
			setError(e?.response?.data?.message || 'Upload failed');
		} finally {
			setUploading(false);
		}
	};

	const removeFile = (index) => {
		setFiles(files.filter((_, i) => i !== index));
	};

	const getFileIcon = (fileType) => {
		if (fileType.startsWith('image/')) return '🖼️';
		if (fileType.startsWith('video/')) return '🎥';
		if (fileType.startsWith('audio/')) return '🎵';
		if (fileType.includes('pdf')) return '📄';
		if (fileType.includes('word') || fileType.includes('excel') || fileType.includes('powerpoint')) return '📊';
		return '📁';
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-slate-900">Upload Media</h2>
				<p className="text-slate-600 mt-2">Upload single or multiple files with rich metadata</p>
			</div>

			{/* Upload Mode Selection */}
			<div className="mb-6">
				<div className="flex gap-4 mb-4">
					<button
						type="button"
						onClick={() => setUploadMode('single')}
						className={`px-4 py-2 rounded-md transition-colors ${
							uploadMode === 'single'
								? 'bg-slate-900 text-white'
								: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
						}`}
					>
						📤 Single File
					</button>
					<button
						type="button"
						onClick={() => setUploadMode('multiple')}
						className={`px-4 py-2 rounded-md transition-colors ${
							uploadMode === 'multiple'
								? 'bg-slate-900 text-white'
								: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
						}`}
					>
						📁 Multiple Files
					</button>
				</div>
			</div>

			<form className="space-y-6" onSubmit={onSubmit}>
				{/* File Upload */}
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						{uploadMode === 'single' ? 'Select File' : 'Select Files'}
					</label>
					<Dropzone 
						onFileSelected={handleFileSelected} 
						multiple={uploadMode === 'multiple'}
						maxFiles={5}
						maxSize={10}
					/>
				</div>

				{/* File Preview */}
				{files.length > 0 && (
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Selected Files ({files.length})
						</label>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{files.map((file, index) => (
								<div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<span className="text-2xl">{getFileIcon(file.type)}</span>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium text-slate-900 truncate">
													{file.name}
												</p>
												<p className="text-xs text-slate-500">
													{formatFileSize(file.size)}
												</p>
											</div>
										</div>
										<button
											type="button"
											onClick={() => removeFile(index)}
											className="text-red-500 hover:text-red-700 text-lg"
										>
											×
										</button>
									</div>
									{file.type.startsWith('image/') && (
										<img 
											src={URL.createObjectURL(file)} 
											alt="preview" 
											className="mt-3 h-24 w-full object-cover rounded"
										/>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Metadata Fields */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Title {uploadMode === 'multiple' && '(applied to all files)'}
						</label>
						<input 
							className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={title} 
							onChange={(e) => setTitle(e.target.value)}
							placeholder={uploadMode === 'multiple' ? 'Leave empty to use filenames' : 'Enter title'}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Category
						</label>
						<select 
							className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
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
							className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={location} 
							onChange={(e) => setLocation(e.target.value)}
							placeholder="e.g., New York, NY"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Date Taken
						</label>
						<input 
							type="date"
							className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={dateTaken} 
							onChange={(e) => setDateTaken(e.target.value)}
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						Description
					</label>
					<textarea 
						className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
						rows={3} 
						value={description} 
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe your media files..."
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						Tags (comma separated)
					</label>
					<input 
						className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
						value={tags} 
						onChange={(e) => setTags(e.target.value)}
						placeholder="e.g., vacation, family, 2024"
					/>
				</div>

				<div className="flex items-center gap-2">
					<input 
						type="checkbox" 
						id="isShared"
						checked={isShared} 
						onChange={(e) => setIsShared(e.target.checked)}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
					/>
					<label htmlFor="isShared" className="text-slate-700">
						Make files publicly accessible
					</label>
				</div>

				{/* Error and Success Messages */}
				{error && (
					<div className="p-4 bg-red-50 border border-red-200 rounded-md">
						<p className="text-red-600">{error}</p>
					</div>
				)}
				
				{success && (
					<div className="p-4 bg-green-50 border border-green-200 rounded-md">
						<p className="text-green-600">{success}</p>
					</div>
				)}

				{/* Submit Button */}
				<button 
					type="submit" 
					disabled={uploading || files.length === 0} 
					className="w-full px-6 py-3 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
				</button>
			</form>
		</div>
	);
} 