import React, { useState } from 'react';

export default function ContactForm({ initialName = '', initialEmail = '', onSubmit, submitting = false }) {
	const [name, setName] = useState(initialName);
	const [email, setEmail] = useState(initialEmail);
	const [message, setMessage] = useState('');
	const [subject, setSubject] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!subject.trim()) return setError('Subject is required');
		if (!message.trim()) return setError('Message is required');
		if (subject.length > 200) return setError('Subject too long (max 200)');
		if (message.length > 2000) return setError('Message too long (max 2000)');
		await onSubmit?.({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
		setSubject('');
		setMessage('');
	};

	return (
		<form className="space-y-3" onSubmit={handleSubmit}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<label className="block text-sm text-slate-600">Name</label>
					<input className="w-full border border-slate-300 rounded-md px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
				</div>
				<div>
					<label className="block text-sm text-slate-600">Email</label>
					<input type="email" className="w-full border border-slate-300 rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
				</div>
			</div>
			<div>
				<label className="block text-sm text-slate-600">Subject</label>
				<input className="w-full border border-slate-300 rounded-md px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
			</div>
			<div>
				<label className="block text-sm text-slate-600">Message</label>
				<textarea rows={4} className="w-full border border-slate-300 rounded-md px-3 py-2" value={message} onChange={(e) => setMessage(e.target.value)} />
			</div>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-slate-900 text-white disabled:opacity-50">{submitting ? 'Sending...' : 'Send'}</button>
		</form>
	);
} 