import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function OAuthSuccessPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const { login } = useAuth();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const token = params.get('token');
		if (token) {
			// Fetch user profile with token since callback only gives token
			(async () => {
				try {
					const res = await axios.get(`${API_BASE_URL}/user/me`, {
						headers: { Authorization: `Bearer ${token}` },
						withCredentials: true
					});
					login(res.data, token);
					navigate('/dashboard', { replace: true });
				} catch {
					navigate('/login', { replace: true });
				}
			})();
		} else {
			navigate('/login', { replace: true });
		}
	}, [location.search, navigate, login]);

	return (
		<div className="max-w-md mx-auto px-4 py-12">
			<p className="text-slate-700">Signing you in...</p>
		</div>
	);
} 