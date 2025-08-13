import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import TextInput from '../components/TextInput.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function RegisterPage() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password }, { withCredentials: true });
			const { token, ...userData } = res.data;
			login(userData, token);
			navigate('/dashboard');
		} catch (err) {
			setError(err?.response?.data?.message || 'Registration failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto px-4 py-12">
			<h2 className="text-2xl font-semibold text-slate-900">Create your account</h2>
			<p className="mt-1 text-sm text-slate-600">Join Media Gallery in seconds.</p>
			<form className="mt-6 space-y-4" onSubmit={onSubmit}>
				<TextInput id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
				<TextInput id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
				<TextInput id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				{error && <div className="text-sm text-red-600">{error}</div>}
				<button type="submit" disabled={loading} className="w-full rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 disabled:opacity-50">{loading ? 'Creating account...' : 'Sign up'}</button>
			</form>
			<div className="mt-6 text-center">
				<p className="text-sm text-slate-600">
					Already have an account?{' '}
					<Link to="/login" className="text-slate-900 underline">Sign in</Link>
				</p>
				<p className="text-sm text-slate-600 mt-2">
					Need admin access?{' '}
					<Link to="/admin-register" className="text-slate-900 underline">Register as Admin</Link>
				</p>
			</div>
		</div>
	);
} 