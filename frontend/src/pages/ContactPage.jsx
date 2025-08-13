import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ContactPage() {
	const [subject, setSubject] = useState('');
	const [message, setMessage] = useState('');
	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const load = async () => {
		setLoading(true); setError('');
		try {
			const res = await axios.get(`${API_BASE_URL}/api/contact/mymessages`, { withCredentials: true });
			setList(res.data);
		} catch (e) { setError('Failed to load'); } finally { setLoading(false); }
	};

	useEffect(() => { load(); }, []);

	const submit = async (e) => {
		e.preventDefault();
		await axios.post(`${API_BASE_URL}/api/contact`, { subject, message }, { withCredentials: true });
		setSubject(''); setMessage('');
		load();
	};

	const save = async (m) => {
		await axios.put(`${API_BASE_URL}/api/contact/${m._id}`, { subject: m.subject, message: m.message }, { withCredentials: true });
		load();
	};

	const remove = async (id) => {
		await axios.delete(`${API_BASE_URL}/api/contact/${id}`, { withCredentials: true });
		load();
	};

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<h2 className="text-2xl font-semibold text-slate-900">Contact Messages</h2>
			{/* Use reusable ContactForm for better UX/validation */}
			<form className="mt-4 space-y-3" onSubmit={submit}>
				<input className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
				<textarea className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="Message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
				<button className="px-4 py-2 rounded-md bg-slate-900 text-white">Send</button>
			</form>
			{loading ? <p className="mt-6">Loading...</p> : error ? <p className="mt-6 text-red-600">{error}</p> : (
				<div className="mt-6">
					{/* Use MessageList for user view */}
					<div className="space-y-4">
						{list.map(m => (
							<div key={m._id} className="border rounded-md p-3 bg-white">
								<div className="flex items-center gap-2">
									<input className="flex-1 border rounded px-2 py-1" value={m.subject} onChange={(e) => setList(list.map(x => x._id===m._id?{...x, subject: e.target.value}:x))} />
									<button className="px-2 py-1 border rounded" onClick={() => save(m)}>Save</button>
									<button className="px-2 py-1 border rounded text-red-600" onClick={() => remove(m._id)}>Delete</button>
								</div>
								<textarea className="mt-2 w-full border rounded px-2 py-1" rows={3} value={m.message} onChange={(e) => setList(list.map(x => x._id===m._id?{...x, message: e.target.value}:x))} />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
} 