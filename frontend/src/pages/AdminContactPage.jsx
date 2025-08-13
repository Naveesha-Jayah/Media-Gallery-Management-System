import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import MessageList from '../components/MessageList.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminContactPage() {
	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const load = async () => {
		setLoading(true); 
		setError('');
		try {
			const res = await axios.get(`${API_BASE_URL}/api/admin/contact`, { withCredentials: true });
			setList(res.data);
		} catch (e) { 
			setError('Failed to load messages'); 
		} finally { 
			setLoading(false); 
		}
	};

	useEffect(() => { load(); }, []);

	const remove = async (id) => {
		try {
			await axios.delete(`${API_BASE_URL}/api/admin/contact/${id}`, { withCredentials: true });
			await load();
		} catch (e) {
			setError('Failed to delete message');
		}
	};

	// Calculate statistics
	const stats = useMemo(() => {
		const total = list.length;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		const todayCount = list.filter(msg => {
			const msgDate = new Date(msg.createdAt);
			msgDate.setHours(0, 0, 0, 0);
			return msgDate.getTime() === today.getTime();
		}).length;
		
		const thisWeek = list.filter(msg => {
			const msgDate = new Date(msg.createdAt);
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);
			return msgDate >= weekAgo;
		}).length;
		
		const thisMonth = list.filter(msg => {
			const msgDate = new Date(msg.createdAt);
			const monthAgo = new Date();
			monthAgo.setMonth(monthAgo.getMonth() - 1);
			return msgDate >= monthAgo;
		}).length;
		
		return { total, today: todayCount, thisWeek, thisMonth };
	}, [list]);

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-slate-600">Loading contact messages...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-slate-900 mb-2">Contact Messages</h1>
				<p className="text-slate-600">Manage and view all contact messages from users.</p>
			</div>

			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
					<p className="text-red-600">{error}</p>
				</div>
			)}

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white rounded-lg border p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
								<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
							</div>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-slate-600">Total Messages</p>
							<p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
								<svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-slate-600">Today</p>
							<p className="text-2xl font-semibold text-slate-900">{stats.today}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
								<svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-slate-600">This Week</p>
							<p className="text-2xl font-semibold text-slate-900">{stats.thisWeek}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
								<svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-slate-600">This Month</p>
							<p className="text-2xl font-semibold text-slate-900">{stats.thisMonth}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Messages List */}
			<div className="bg-white rounded-lg border p-6">
				{list.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-slate-400 mb-4">
							<svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</div>
						<p className="text-slate-500 text-lg font-medium">No contact messages found</p>
						<p className="text-slate-400 text-sm mt-1">Users haven't sent any messages yet.</p>
					</div>
				) : (
					<MessageList 
						messages={list}
						onDelete={remove}
						isAdmin={true}
					/>
				)}
			</div>
		</div>
	);
} 