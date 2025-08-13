import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import TextInput from '../components/TextInput.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminRegisterPage() {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [adminCode, setAdminCode] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');

		// Validation
		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (password.length < 6) {
			setError('Password must be at least 6 characters long');
			return;
		}

		if (!adminCode || adminCode !== 'ADMIN2024') {
			setError('Invalid admin code');
			return;
		}

		setLoading(true);
		try {
			const res = await axios.post(`${API_BASE_URL}/auth/admin-register`, { 
				name, 
				email, 
				password,
				adminCode 
			}, { withCredentials: true });
			
			console.log('Admin created:', res.data);
			setError('');
			alert('Admin account created successfully! You can now login.');
			navigate('/login');
		} catch (err) {
			setError(err?.response?.data?.message || 'Admin registration failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto px-4 py-12">
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold text-slate-900">Admin Registration</h2>
				<p className="mt-2 text-sm text-slate-600">Create a new administrator account</p>
			</div>

			<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
				<div className="flex">
					<div className="flex-shrink-0">
						<svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
						</svg>
					</div>
					<div className="ml-3">
						<h3 className="text-sm font-medium text-amber-800">Admin Access Required</h3>
						<div className="mt-2 text-sm text-amber-700">
							<p>This page is for creating administrator accounts only. Regular users should use the standard registration.</p>
						</div>
					</div>
				</div>
			</div>

			<form className="space-y-4" onSubmit={onSubmit}>
				<TextInput 
					id="name" 
					label="Full Name" 
					value={name} 
					onChange={(e) => setName(e.target.value)} 
					required 
				/>
				
				<TextInput 
					id="email" 
					label="Email Address" 
					type="email" 
					value={email} 
					onChange={(e) => setEmail(e.target.value)} 
					required 
				/>
				
				<TextInput 
					id="password" 
					label="Password" 
					type="password" 
					value={password} 
					onChange={(e) => setPassword(e.target.value)} 
					required 
				/>
				
				<TextInput 
					id="confirmPassword" 
					label="Confirm Password" 
					type="password" 
					value={confirmPassword} 
					onChange={(e) => setConfirmPassword(e.target.value)} 
					required 
				/>
				
				<div>
					<label htmlFor="adminCode" className="block text-sm font-medium text-slate-700 mb-2">
						Admin Code
					</label>
					<input
						id="adminCode"
						type="text"
						value={adminCode}
						onChange={(e) => setAdminCode(e.target.value)}
						placeholder="Enter admin code"
						className="block w-full px-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
						required
					/>
					<p className="mt-1 text-xs text-slate-500">
						Admin code: <code className="bg-slate-100 px-1 py-0.5 rounded">ADMIN2024</code>
					</p>
				</div>

				{error && (
					<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
						{error}
					</div>
				)}

				<button 
					type="submit" 
					disabled={loading} 
					className="w-full rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
				>
					{loading ? 'Creating Admin Account...' : 'Create Admin Account'}
				</button>
			</form>

			<div className="mt-6 text-center">
				<p className="text-sm text-slate-600">
					Already have an account?{' '}
					<Link to="/login" className="text-slate-900 underline hover:text-slate-700">
						Sign in
					</Link>
				</p>
				<p className="text-sm text-slate-600 mt-2">
					Regular user?{' '}
					<Link to="/register" className="text-slate-900 underline hover:text-slate-700">
						Register here
					</Link>
				</p>
			</div>
		</div>
	);
}
