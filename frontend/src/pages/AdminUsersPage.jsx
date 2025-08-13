import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminUsersPage() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const load = async () => {
		setLoading(true); setError('');
		try {
			const res = await axios.get(`${API_BASE_URL}/api/admin/users`, { withCredentials: true });
			setUsers(res.data);
		} catch (e) { setError('Failed to load'); } finally { setLoading(false); }
	};

	useEffect(() => { load(); }, []);

	const save = async (u) => {
		await axios.put(`${API_BASE_URL}/api/admin/users/${u._id}`, { name: u.name, email: u.email, role: u.role, isActive: u.isActive }, { withCredentials: true });
		load();
	};

	const deactivate = async (id) => {
		await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, { withCredentials: true });
		load();
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<h2 className="text-2xl font-semibold text-slate-900">Users</h2>
			{loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
				<table className="mt-4 w-full text-left border">
					<thead className="bg-slate-50">
						<tr>
							<th className="p-2 border">Name</th>
							<th className="p-2 border">Email</th>
							<th className="p-2 border">Role</th>
							<th className="p-2 border">Active</th>
							<th className="p-2 border">Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map(u => (
							<tr key={u._id}>
								<td className="p-2 border"><input className="border rounded px-2 py-1" value={u.name} onChange={(e) => setUsers(users.map(x => x._id===u._id?{...x, name: e.target.value}:x))} /></td>
								<td className="p-2 border"><input className="border rounded px-2 py-1" value={u.email} onChange={(e) => setUsers(users.map(x => x._id===u._id?{...x, email: e.target.value}:x))} /></td>
								<td className="p-2 border">
									<select className="border rounded px-2 py-1" value={u.role} onChange={(e) => setUsers(users.map(x => x._id===u._id?{...x, role: e.target.value}:x))}>
										<option value="user">user</option>
										<option value="admin">admin</option>
									</select>
								</td>
								<td className="p-2 border text-center"><input type="checkbox" checked={u.isActive} onChange={(e) => setUsers(users.map(x => x._id===u._id?{...x, isActive: e.target.checked}:x))} /></td>
								<td className="p-2 border flex gap-2">
									<button className="px-2 py-1 border rounded" onClick={() => save(u)}>Save</button>
									<button className="px-2 py-1 border rounded text-red-600" onClick={() => deactivate(u._id)}>Deactivate</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
} 