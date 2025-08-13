import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ContactForm({ initialName = '', initialEmail = '', onSubmit, submitting = false }) {
	const { user } = useAuth();
	const [name, setName] = useState(initialName);
	const [email, setEmail] = useState(initialEmail);
	const [message, setMessage] = useState('');
	const [subject, setSubject] = useState('');
	const [error, setError] = useState('');

	// Pre-fill form with current user info when logged in
	useEffect(() => {
		if (user) {
			setName(user.name || '');
			setEmail(user.email || '');
		} else {
			setName(initialName);
			setEmail(initialEmail);
		}
	}, [user, initialName, initialEmail]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		
		// Enhanced validation
		if (!name.trim()) return setError('Name is required');
		if (!email.trim()) return setError('Email is required');
		if (!subject.trim()) return setError('Subject is required');
		if (!message.trim()) return setError('Message is required');
		
		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) return setError('Please enter a valid email address');
		
		if (subject.length > 200) return setError('Subject too long (max 200 characters)');
		if (message.length > 2000) return setError('Message too long (max 2000 characters)');
		
		try {
			await onSubmit?.({ 
				name: name.trim(), 
				email: email.trim(), 
				subject: subject.trim(), 
				message: message.trim() 
			});
			// Clear form after successful submission
			setSubject('');
			setMessage('');
			setError('');
		} catch (err) {
			setError(err.message || 'Failed to send message');
		}
	};

	const handleReset = () => {
		setSubject('');
		setMessage('');
		setError('');
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-1">
						Name <span className="text-red-500">*</span>
					</label>
					<input 
						type="text"
						className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
						value={name} 
						onChange={(e) => setName(e.target.value)}
						placeholder="Your name"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-1">
						Email <span className="text-red-500">*</span>
					</label>
					<input 
						type="email" 
						className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
						value={email} 
						onChange={(e) => setEmail(e.target.value)}
						placeholder="your.email@example.com"
						required
					/>
				</div>
			</div>
			<div>
				<label className="block text-sm font-medium text-slate-700 mb-1">
					Subject <span className="text-red-500">*</span>
				</label>
				<input 
					type="text"
					className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
					value={subject} 
					onChange={(e) => setSubject(e.target.value)}
					placeholder="Brief subject of your message"
					maxLength={200}
					required
				/>
				<div className="text-xs text-slate-500 mt-1 text-right">
					{subject.length}/200 characters
				</div>
			</div>
			<div>
				<label className="block text-sm font-medium text-slate-700 mb-1">
					Message <span className="text-red-500">*</span>
				</label>
				<textarea 
					rows={5}
					className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" 
					value={message} 
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Your message details..."
					maxLength={2000}
					required
				/>
				<div className="text-xs text-slate-500 mt-1 text-right">
					{message.length}/2000 characters
				</div>
			</div>
			
			{error && (
				<div className="p-3 bg-red-50 border border-red-200 rounded-md">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}
			
			<div className="flex gap-3">
				<button 
					type="submit" 
					disabled={submitting} 
					className="flex-1 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{submitting ? (
						<>
							<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Sending...
						</>
					) : (
						'Send Message'
					)}
				</button>
				<button 
					type="button"
					onClick={handleReset}
					className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
				>
					Reset
				</button>
			</div>
		</form>
	);
} 