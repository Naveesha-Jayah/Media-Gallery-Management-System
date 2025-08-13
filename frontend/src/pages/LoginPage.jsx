import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import TextInput from '../components/TextInput.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function LoginPage() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }, { withCredentials: true });
			const { token, ...userData } = res.data;
			login(userData, token);
			navigate('/dashboard');
		} catch (err) {
			setError(err?.response?.data?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto px-4 py-12">
			<h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
			<p className="mt-1 text-sm text-slate-600">Welcome back. Please enter your details.</p>
			<form className="mt-6 space-y-4" onSubmit={onSubmit}>
				<TextInput id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
				<TextInput id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				{error && <div className="text-sm text-red-600">{error}</div>}
				<button type="submit" disabled={loading} className="w-full rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign in'}</button>
			</form>
			<div className="mt-4">
				<a href={`${API_BASE_URL}/auth/google`} className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-slate-800 hover:bg-slate-50">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303C33.672,32.91,29.223,36,24,36c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.155,7.961,3.039l5.657-5.657C33.69,6.049,29.081,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.155,7.961,3.039l5.657-5.657C33.69,6.049,29.081,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.8-1.977,13.313-5.188l-6.146-5.2C29.091,35.091,26.715,36,24,36c-5.195,0-9.594-3.317-11.292-7.946l-6.49,5.002C9.64,40.556,16.337,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-1.148,3.255-3.537,5.951-6.594,7.612c0.003-0.002,0.007-0.004,0.01-0.006l6.146,5.2C33.91,40.744,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
					Continue with Google
				</a>
			</div>
			<p className="mt-4 text-sm text-slate-600">Don't have an account? <Link to="/register" className="text-slate-900 underline">Sign up</Link></p>
		</div>
	);
} 