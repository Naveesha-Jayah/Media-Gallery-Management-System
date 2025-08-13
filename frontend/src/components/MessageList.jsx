import React, { useState, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

export default function MessageList({ messages, onSave, onDelete, onChange, isAdmin = false }) {
	const { user } = useAuth();
	const [editingId, setEditingId] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterStatus, setFilterStatus] = useState('all');

	const handleEdit = (message) => {
		setEditingId(message._id);
	};

	const handleSave = async (message) => {
		try {
			await onSave(message);
			setEditingId(null);
		} catch (error) {
			console.error('Failed to save message:', error);
		}
	};

	const handleCancel = () => {
		setEditingId(null);
	};

	const handleDelete = async (id) => {
		if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
			try {
				await onDelete(id);
			} catch (error) {
				console.error('Failed to delete message:', error);
			}
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Filter and search messages
	const filteredMessages = useMemo(() => {
		let filtered = messages || [];
		
		// Apply search filter
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(message => 
				message.subject?.toLowerCase().includes(term) ||
				message.message?.toLowerCase().includes(term) ||
				message.name?.toLowerCase().includes(term) ||
				message.email?.toLowerCase().includes(term)
			);
		}
		
		// Apply status filter (for admin view)
		if (isAdmin && filterStatus !== 'all') {
			// You can add more sophisticated filtering here based on your needs
			// For now, we'll just return all messages
		}
		
		return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}, [messages, searchTerm, filterStatus, isAdmin]);

	if (!messages || messages.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="text-slate-400 mb-4">
					<svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</div>
				<p className="text-slate-500 text-lg font-medium">No messages found</p>
				<p className="text-slate-400 text-sm mt-1">
					{isAdmin ? 'No contact messages from users yet.' : 'You haven\'t sent any messages yet.'}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Search and Filter Controls */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="flex-1">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							placeholder="Search messages..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>
				
				{isAdmin && (
					<div className="sm:w-48">
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
							className="block w-full px-3 py-2 border border-slate-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">All Messages</option>
							<option value="recent">Recent (7 days)</option>
							<option value="unread">Unread</option>
						</select>
					</div>
				)}
			</div>

			{/* Results count */}
			{searchTerm && (
				<div className="text-sm text-slate-600 mb-4">
					Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} matching "{searchTerm}"
				</div>
			)}

			{/* Messages */}
			<div className="space-y-4">
				{filteredMessages.map((message) => {
					const isEditing = editingId === message._id;
					const canEdit = !isAdmin && user?._id === message.user?._id;

					return (
						<div key={message._id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
							{/* Header with user info (admin view) or edit controls (user view) */}
							<div className="flex items-center justify-between mb-4">
								<div className="flex-1">
									{isAdmin && (
										<div className="text-sm text-slate-600 mb-2">
											<span className="font-medium">From:</span> {message.name} ({message.email})
											{message.user?.role && (
												<span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
													{message.user.role}
												</span>
											)}
										</div>
									)}
									<div className="text-xs text-slate-500 flex items-center">
										<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										{formatDate(message.createdAt)}
									</div>
								</div>
								
								{/* Action buttons */}
								<div className="flex items-center gap-2">
									{canEdit && !isEditing && (
										<>
											<button
												onClick={() => handleEdit(message)}
												className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
											>
												<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
												Edit
											</button>
											<button
												onClick={() => handleDelete(message._id)}
												className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
											>
												<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
												Delete
											</button>
										</>
									)}
									
									{isAdmin && (
										<button
											onClick={() => handleDelete(message._id)}
											className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
										>
											<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
											Delete
										</button>
									)}
									
									{isEditing && (
										<>
											<button
												onClick={() => handleSave(message)}
												className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
											>
												<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
												Save
											</button>
											<button
												onClick={handleCancel}
												className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-slate-50 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
											>
												<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
												Cancel
											</button>
										</>
									)}
								</div>
							</div>

							{/* Subject */}
							{isEditing ? (
								<input
									type="text"
									value={message.subject}
									onChange={(e) => onChange(message._id, { subject: e.target.value })}
									className="w-full px-3 py-2 border border-slate-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Subject"
									maxLength={200}
								/>
							) : (
								<h3 className="font-semibold text-slate-900 mb-4 text-lg">{message.subject}</h3>
							)}

							{/* Message content */}
							{isEditing ? (
								<textarea
									value={message.message}
									onChange={(e) => onChange(message._id, { message: e.target.value })}
									rows={4}
									className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
									placeholder="Message content"
									maxLength={2000}
								/>
							) : (
								<div className="bg-slate-50 rounded-md p-4">
									<p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{message.message}</p>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* No results message */}
			{filteredMessages.length === 0 && searchTerm && (
				<div className="text-center py-8">
					<p className="text-slate-500">No messages found matching your search criteria.</p>
					<button
						onClick={() => setSearchTerm('')}
						className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
					>
						Clear search
					</button>
				</div>
			)}
		</div>
	);
} 