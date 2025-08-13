import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContactForm from '../components/ContactForm.jsx';
import MessageList from '../components/MessageList.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ContactPage() {
	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const load = async () => {
		setLoading(true); 
		setError('');
		try {
			const res = await axios.get(`${API_BASE_URL}/api/contact/mymessages`, { withCredentials: true });
			setList(res.data);
		} catch (e) { 
			setError('Failed to load messages'); 
		} finally { 
			setLoading(false); 
		}
	};

	useEffect(() => { load(); }, []);

	const handleSubmit = async (formData) => {
		setSubmitting(true);
		setError('');
		try {
			await axios.post(`${API_BASE_URL}/api/contact`, formData, { withCredentials: true });
			await load(); // Reload messages
		} catch (e) {
			setError(e?.response?.data?.message || 'Failed to send message');
		} finally {
			setSubmitting(false);
		}
	};

	const save = async (m) => {
		try {
			await axios.put(`${API_BASE_URL}/api/contact/${m._id}`, { subject: m.subject, message: m.message }, { withCredentials: true });
			await load();
		} catch (e) {
			setError('Failed to update message');
		}
	};

	const remove = async (id) => {
		try {
			await axios.delete(`${API_BASE_URL}/api/contact/${id}`, { withCredentials: true });
			await load();
		} catch (e) {
			setError('Failed to delete message');
		}
	};

	const onChange = (id, updates) => {
		setList(list.map(x => x._id === id ? { ...x, ...updates } : x));
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-slate-900 mb-2">Contact Messages</h1>
				<p className="text-slate-600">Send messages and manage your communication history.</p>
			</div>

			<div className="grid lg:grid-cols-2 gap-8">
				{/* Contact Form */}
				<div className="bg-white rounded-lg border p-6">
					<h2 className="text-xl font-semibold text-slate-900 mb-4">Send New Message</h2>
					<ContactForm 
						onSubmit={handleSubmit}
						submitting={submitting}
					/>
					{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
				</div>

				{/* Message List */}
				<div className="bg-white rounded-lg border p-6">
					<h2 className="text-xl font-semibold text-slate-900 mb-4">Your Messages</h2>
					{loading ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
							<p className="mt-2 text-slate-600">Loading messages...</p>
						</div>
					) : list.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-slate-500">No messages yet. Send your first message!</p>
						</div>
					) : (
						<MessageList 
							messages={list}
							onSave={save}
							onDelete={remove}
							onChange={onChange}
						/>
					)}
				</div>
			</div>
		</div>
	);
} 