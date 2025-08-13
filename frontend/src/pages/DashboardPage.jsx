import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function DashboardPage() {
	const { user, token, logout } = useAuth();
	const [profile, setProfile] = useState(user);
	const [loading, setLoading] = useState(!user);

	useEffect(() => {
		let ignore = false;
		(async () => {
			if (!user && token) {
				try {
					const res = await axios.get(`${API_BASE_URL}/user/me`, { withCredentials: true });
					if (!ignore) setProfile(res.data);
				} catch {}
				if (!ignore) setLoading(false);
			} else {
				setLoading(false);
			}
		})();
		return () => { ignore = true; };
	}, [user, token]);

	return (
		<div className="max-w-5xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
				<button onClick={logout} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Logout</button>
			</div>
			<div className="mt-6 rounded-lg border bg-white p-6">
				{loading ? (
					<p className="text-slate-600">Loading...</p>
				) : (
					<div className="space-y-2 text-slate-800">
						<p><span className="font-medium">Name:</span> {profile?.name}</p>
						<p><span className="font-medium">Email:</span> {profile?.email}</p>
						<p><span className="font-medium">User ID:</span> {profile?._id}</p>
					</div>
				)}
			</div>
		</div>
	);
} 