import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ImageDetailPage() {
	const { id } = useParams();
	const [item, setItem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		(async () => {
			try {
				const res = await axios.get(`${API_BASE_URL}/api/media/${id}`, { withCredentials: true });
				setItem(res.data);
			} catch (e) {
				setError('Failed to load');
			} finally { setLoading(false); }
		})();
	}, [id]);

	if (loading) return <div className="max-w-5xl mx-auto px-4 py-8">Loading...</div>;
	if (error) return <div className="max-w-5xl mx-auto px-4 py-8 text-red-600">{error}</div>;
	if (!item) return null;

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-2xl font-semibold text-slate-900">{item.title || item.originalName}</h2>
				<Link to="/gallery" className="text-slate-700 underline">Back</Link>
			</div>
			<div className="bg-black rounded-md overflow-hidden">
				<img src={`${API_BASE_URL}/uploads/${item.filename}`} alt={item.title} className="w-full h-[70vh] object-contain" />
			</div>
			<div className="mt-4 text-slate-800">
				<p><span className="font-medium">Description:</span> {item.description}</p>
				<p><span className="font-medium">Tags:</span> {(item.tags||[]).join(', ')}</p>
			</div>
		</div>
	);
} 