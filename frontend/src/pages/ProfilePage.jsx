import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ProfilePage() {
	const { user, login } = useAuth();
	const [name, setName] = useState(user?.name || '');
	const [email, setEmail] = useState(user?.email || '');
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState('');

	const onSave = async (e) => {
		e.preventDefault(); setMsg('');
		try {
			const res = await axios.put(`${API_BASE_URL}/user/me`, { name, email }, { withCredentials: true });
			login(res.data, localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).token : undefined);
			setMsg('Saved');
		} catch (e) { setMsg('Save failed'); }
	};

	return (
		<div className="max-w-md mx-auto px-4 py-8">
			<h2 className="text-2xl font-semibold text-slate-900">Profile</h2>
			<form className="mt-4 space-y-4" onSubmit={onSave}>
				<div>
					<label className="block text-sm text-slate-600">Name</label>
					<input className="w-full border border-slate-300 rounded-md px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
				</div>
				<div>
					<label className="block text-sm text-slate-600">Email</label>
					<input className="w-full border border-slate-300 rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
				</div>
				<button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-slate-900 text-white">Save</button>
				{msg && <p className="text-sm text-slate-700">{msg}</p>}
			</form>
		</div>
	);
} 