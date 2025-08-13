import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminUsersPage() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [filterRole, setFilterRole] = useState('all');
	const [filterStatus, setFilterStatus] = useState('all');
	const [saving, setSaving] = useState({});
	const [deleting, setDeleting] = useState({});
	const [promoting, setPromoting] = useState({});
	const [demoting, setDemoting] = useState({});

	// Calculate admin count
	const adminCount = useMemo(() => {
		return users.filter(user => user.role === 'admin').length;
	}, [users]);

	// Check if user can be demoted (not the last admin)
	const canDemoteAdmin = (userId) => {
		const user = users.find(u => u._id === userId);
		return user && user.role === 'admin' && adminCount > 1;
	};

	const load = async () => {
		setLoading(true); 
		setError('');
		try {
			const res = await axios.get(`${API_BASE_URL}/api/admin/users`, { withCredentials: true });
			setUsers(res.data);
		} catch (e) { 
			setError('Failed to load users'); 
		} finally { 
			setLoading(false); 
		}
	};

	useEffect(() => { load(); }, []);

	const save = async (u) => {
		setSaving(prev => ({ ...prev, [u._id]: true }));
		try {
			await axios.put(`${API_BASE_URL}/api/admin/users/${u._id}`, { 
				name: u.name, 
				email: u.email, 
				role: u.role, 
				isActive: u.isActive 
			}, { withCredentials: true });
			await load();
		} catch (e) {
			setError('Failed to update user');
		} finally {
			setSaving(prev => ({ ...prev, [u._id]: false }));
		}
	};

	const deactivate = async (id) => {
		if (!window.confirm('Are you sure you want to deactivate this user? They will no longer be able to access the system.')) {
			return;
		}
		
		setDeleting(prev => ({ ...prev, [id]: true }));
		try {
			await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, { withCredentials: true });
			await load();
		} catch (e) {
			setError('Failed to deactivate user');
		} finally {
			setDeleting(prev => ({ ...prev, [id]: false }));
		}
	};

	const activate = async (id) => {
		setSaving(prev => ({ ...prev, [id]: true }));
		try {
			await axios.put(`${API_BASE_URL}/api/admin/users/${id}`, { isActive: true }, { withCredentials: true });
			await load();
		} catch (e) {
			setError('Failed to activate user');
		} finally {
			setSaving(prev => ({ ...prev, [id]: false }));
		}
	};

	const promoteToAdmin = async (id) => {
		if (!window.confirm('Are you sure you want to promote this user to admin? They will have full system access.')) {
			return;
		}
		
		setPromoting(prev => ({ ...prev, [id]: true }));
		try {
			await axios.post(`${API_BASE_URL}/auth/promote/${id}`, {}, { withCredentials: true });
			await load();
		} catch (e) {
			setError('Failed to promote user to admin');
		} finally {
			setPromoting(prev => ({ ...prev, [id]: false }));
		}
	};

	const demoteToUser = async (id) => {
		if (!window.confirm('Are you sure you want to demote this user to a regular user? They will lose full system access.')) {
			return;
		}

		setDemoting(prev => ({ ...prev, [id]: true }));
		try {
			await axios.post(`${API_BASE_URL}/auth/demote/${id}`, {}, { withCredentials: true });
			await load();
		} catch (e) {
			setError('Failed to demote user to user');
		} finally {
			setDemoting(prev => ({ ...prev, [id]: false }));
		}
	};

	// Filter and search users
	const filteredUsers = useMemo(() => {
		let filtered = users || [];
		
		// Apply search filter
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(user => 
				user.name?.toLowerCase().includes(term) ||
				user.email?.toLowerCase().includes(term)
			);
		}
		
		// Apply role filter
		if (filterRole !== 'all') {
			filtered = filtered.filter(user => user.role === filterRole);
		}
		
		// Apply status filter
		if (filterStatus !== 'all') {
			filtered = filtered.filter(user => 
				filterStatus === 'active' ? user.isActive : !user.isActive
			);
		}
		
		return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}, [users, searchTerm, filterRole, filterStatus]);

	const handleUserChange = (userId, field, value) => {
		setUsers(users.map(x => x._id === userId ? { ...x, [field]: value } : x));
	};

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-slate-600">Loading users...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-slate-900 mb-2">User Management</h2>
				<p className="text-slate-600">Manage user accounts, roles, and access permissions.</p>
				
				{/* Admin Count Display */}
				<div className="mt-4 flex items-center gap-4">
					<div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
						<span className="text-sm font-medium text-blue-800">
							{adminCount} Admin{adminCount !== 1 ? 's' : ''}
						</span>
					</div>
					<div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
						<span className="text-sm font-medium text-slate-800">
							{users.length - adminCount} Regular User{users.length - adminCount !== 1 ? 's' : ''}
						</span>
					</div>
				</div>
			</div>

			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
					<p className="text-red-600">{error}</p>
				</div>
			)}

			{/* Search and Filter Controls */}
			<div className="bg-white rounded-lg border p-6 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">Search Users</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<input
								type="text"
								placeholder="Search by name or email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">Filter by Role</label>
						<select
							value={filterRole}
							onChange={(e) => setFilterRole(e.target.value)}
							className="block w-full px-3 py-2 border border-slate-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">All Roles</option>
							<option value="user">Users</option>
							<option value="admin">Admins</option>
						</select>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">Filter by Status</label>
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
							className="block w-full px-3 py-2 border border-slate-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>
				</div>
				
				{/* Results count */}
				{(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
					<div className="mt-4 text-sm text-slate-600">
						Showing {filteredUsers.length} of {users.length} users
					</div>
				)}
			</div>

			{/* Users Table */}
			<div className="bg-white rounded-lg border overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-200">
						<thead className="bg-slate-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-slate-200">
							{filteredUsers.map(user => (
								<tr key={user._id} className="hover:bg-slate-50">
									<td className="px-6 py-4">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-10 w-10">
												<div className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center">
													<span className="text-sm font-medium text-slate-700">
														{user.name?.charAt(0).toUpperCase()}
													</span>
												</div>
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-slate-900">
													<input 
														className="border rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
														value={user.name} 
														onChange={(e) => handleUserChange(user._id, 'name', e.target.value)} 
													/>
												</div>
												<div className="text-sm text-slate-500">
													<input 
														className="border rounded px-2 py-1 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
														value={user.email} 
														onChange={(e) => handleUserChange(user._id, 'email', e.target.value)} 
													/>
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<select 
											className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
											value={user.role} 
											onChange={(e) => handleUserChange(user._id, 'role', e.target.value)}
										>
											<option value="user">User</option>
											<option value="admin">Admin</option>
										</select>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<input 
												type="checkbox" 
												checked={user.isActive} 
												onChange={(e) => handleUserChange(user._id, 'isActive', e.target.checked)} 
												className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
											/>
											<span className="ml-2 text-sm text-slate-900">
												{user.isActive ? 'Active' : 'Inactive'}
											</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
										{new Date(user.createdAt).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div className="flex gap-2">
											<button 
												className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50" 
												onClick={() => save(user)}
												disabled={saving[user._id]}
											>
												{saving[user._id] ? 'Saving...' : 'Save'}
											</button>
											
											{user.role === 'user' && (
												<button 
													className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50" 
													onClick={() => promoteToAdmin(user._id)}
													disabled={promoting[user._id]}
												>
													{promoting[user._id] ? 'Promoting...' : 'Promote to Admin'}
												</button>
											)}
											
											{user.role === 'admin' && (
												<button 
													className="px-3 py-1 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors disabled:opacity-50" 
													onClick={() => demoteToUser(user._id)}
													disabled={demoting[user._id] || !canDemoteAdmin(user._id)}
												>
													{demoting[user._id] ? 'Demoting...' : 'Demote to User'}
												</button>
											)}
											
											{user.isActive ? (
												<button 
													className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50" 
													onClick={() => deactivate(user._id)}
													disabled={deleting[user._id]}
												>
													{deleting[user._id] ? 'Deactivating...' : 'Deactivate'}
												</button>
											) : (
												<button 
													className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50" 
													onClick={() => activate(user._id)}
													disabled={saving[user._id]}
												>
													{saving[user._id] ? 'Activating...' : 'Activate'}
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				
				{/* No results message */}
				{filteredUsers.length === 0 && (
					<div className="text-center py-12">
						<div className="text-slate-400 mb-4">
							<svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
							</svg>
						</div>
						<p className="text-slate-500 text-lg font-medium">No users found</p>
						<p className="text-slate-400 text-sm mt-1">
							{searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
								? 'Try adjusting your search or filter criteria.' 
								: 'No users have been created yet.'}
						</p>
					</div>
				)}
			</div>
		</div>
	);
} 