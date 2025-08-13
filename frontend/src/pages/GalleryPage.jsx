import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function GalleryPage() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');
	const [tags, setTags] = useState('');
	const [shared, setShared] = useState(false);
	const [selected, setSelected] = useState({});
	const [error, setError] = useState('');

	const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([id]) => id), [selected]);

	const load = async () => {
		setLoading(true);
		setError('');
		try {
			const params = {};
			if (query) params.q = query;
			if (tags) params.tags = tags;
			if (shared) params.shared = 'true';
			const res = await axios.get(`${API_BASE_URL}/api/media`, { params, withCredentials: true });
			setItems(res.data);
		} catch (e) {
			setError('Failed to load');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const toggleSelect = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));

	const removeItem = async (id) => {
		if (!confirm('Delete this item?')) return;
		await axios.delete(`${API_BASE_URL}/api/media/${id}`, { withCredentials: true });
		setItems((arr) => arr.filter((x) => x._id !== id));
	};

	const downloadZip = async () => {
		if (selectedIds.length === 0) return;
		const res = await axios.post(`${API_BASE_URL}/api/media/zip`, { ids: selectedIds }, { withCredentials: true, responseType: 'blob' });
		const url = window.URL.createObjectURL(new Blob([res.data]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'media.zip');
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<div className="flex items-end gap-3 flex-wrap">
				<div className="flex-1 min-w-[220px]">
					<label className="block text-sm text-slate-600">Search</label>
					<input className="w-full border border-slate-300 rounded-md px-3 py-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title/description" />
				</div>
				<div className="flex-1 min-w-[220px]">
					<label className="block text-sm text-slate-600">Tags (comma separated)</label>
					<input className="w-full border border-slate-300 rounded-md px-3 py-2" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. travel, family" />
				</div>
				<label className="flex items-center gap-2 text-slate-700"><input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} />Shared</label>
				<button className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50" onClick={load}>Apply</button>
				<Link to="/upload" className="px-4 py-2 rounded-md bg-slate-900 text-white">Upload</Link>
				<button disabled={selectedIds.length===0} className="px-4 py-2 rounded-md border border-slate-300 disabled:opacity-50" onClick={downloadZip}>Download ZIP ({selectedIds.length})</button>
			</div>

			{error && <p className="mt-4 text-red-600">{error}</p>}
			<div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{loading ? <p>Loading...</p> : items.map(item => (
					<div key={item._id} className="group relative border rounded-md overflow-hidden bg-white">
						<img src={`${API_BASE_URL}/uploads/${item.filename}`} alt={item.title} className="h-40 w-full object-cover" />
						<div className="p-2">
							<div className="flex items-center justify-between gap-2">
								<label className="flex items-center gap-2 text-slate-700 text-sm"><input type="checkbox" checked={!!selected[item._id]} onChange={() => toggleSelect(item._id)} />Select</label>
								<div className="flex items-center gap-2">
									<Link to={`/media/${item._id}`} className="text-slate-700 hover:underline text-sm">View</Link>
									<button onClick={() => removeItem(item._id)} className="text-red-600 text-sm">Delete</button>
								</div>
							</div>
							<p className="mt-1 font-medium text-slate-900 truncate">{item.title || item.originalName}</p>
							<p className="text-slate-600 text-sm truncate">{item.description}</p>
							<div className="mt-1 flex flex-wrap gap-1">{(item.tags||[]).map(t => <span key={t} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">#{t}</span>)}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
} 