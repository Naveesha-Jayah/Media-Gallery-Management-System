import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminContactPage() {
	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const load = async () => {
		setLoading(true); setError('');
		try {
			const res = await axios.get(`${API_BASE_URL}/api/admin/contact`, { withCredentials: true });
			setList(res.data);
		} catch (e) { setError('Failed to load'); } finally { setLoading(false); }
	};

	useEffect(() => { load(); }, []);

	const remove = async (id) => {
		await axios.delete(`${API_BASE_URL}/api/admin/contact/${id}`, { withCredentials: true });
		load();
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<h2 className="text-2xl font-semibold text-slate-900">All Contact Messages</h2>
			{loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
				<table className="mt-4 w-full text-left border">
					<thead className="bg-slate-50">
						<tr>
							<th className="p-2 border">User</th>
							<th className="p-2 border">Email</th>
							<th className="p-2 border">Subject</th>
							<th className="p-2 border">Message</th>
							<th className="p-2 border">Actions</th>
						</tr>
					</thead>
					<tbody>
						{list.map(m => (
							<tr key={m._id}>
								<td className="p-2 border">{m.user?.name}</td>
								<td className="p-2 border">{m.user?.email}</td>
								<td className="p-2 border">{m.subject}</td>
								<td className="p-2 border">{m.message}</td>
								<td className="p-2 border"><button className="px-2 py-1 border rounded text-red-600" onClick={() => remove(m._id)}>Delete</button></td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
} 