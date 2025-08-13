import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from '../components/Dropzone.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function UploadPage() {
	const [file, setFile] = useState(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [tags, setTags] = useState('');
	const [isShared, setIsShared] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const onSubmit = async (e) => {
		e.preventDefault();
		setError(''); setSuccess('');
		if (!file) { setError('Please select an image'); return; }
		const form = new FormData();
		form.append('file', file);
		form.append('title', title);
		form.append('description', description);
		form.append('tags', tags);
		form.append('isShared', isShared);
		setUploading(true);
		try {
			await axios.post(`${API_BASE_URL}/api/media`, form, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
			setSuccess('Uploaded');
			setFile(null); setTitle(''); setDescription(''); setTags(''); setIsShared(false);
		} catch (e) {
			setError(e?.response?.data?.message || 'Upload failed');
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<h2 className="text-2xl font-semibold text-slate-900">Upload Image</h2>
			<form className="mt-4 space-y-4" onSubmit={onSubmit}>
				<Dropzone onFileSelected={setFile} />
				{file && <img src={URL.createObjectURL(file)} alt="preview" className="h-40 object-cover rounded" />}
				<div>
					<label className="block text-sm text-slate-600">Title</label>
					<input className="w-full border border-slate-300 rounded-md px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
				</div>
				<div>
					<label className="block text-sm text-slate-600">Description</label>
					<textarea className="w-full border border-slate-300 rounded-md px-3 py-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
				</div>
				<div>
					<label className="block text-sm text-slate-600">Tags (comma separated)</label>
					<input className="w-full border border-slate-300 rounded-md px-3 py-2" value={tags} onChange={(e) => setTags(e.target.value)} />
				</div>
				<label className="flex items-center gap-2 text-slate-700"><input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} />Shared</label>
				{error && <p className="text-red-600 text-sm">{error}</p>}
				{success && <p className="text-green-600 text-sm">{success}</p>}
				<button type="submit" disabled={uploading} className="px-4 py-2 rounded-md bg-slate-900 text-white disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
			</form>
		</div>
	);
} 