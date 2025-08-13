import React from 'react';

export default function MessageList({ messages = [], isAdmin = false, onSave, onDelete, onChange }) {
	return (
		<div className="space-y-4">
			{messages.map(m => (
				<div key={m._id} className="border rounded-md p-3 bg-white">
					<div className="flex items-center justify-between">
						<div className="text-sm text-slate-600">
							{isAdmin && <p><span className="font-medium">{m.user?.name}</span> • {m.user?.email}</p>}
							<p className="text-slate-800 font-medium">{m.subject}</p>
						</div>
						<div className="flex items-center gap-2">
							{!isAdmin && <button className="px-2 py-1 border rounded" onClick={() => onSave?.(m)}>Save</button>}
							<button className="px-2 py-1 border rounded text-red-600" onClick={() => onDelete?.(m._id)}>Delete</button>
						</div>
					</div>
					{!isAdmin ? (
						<textarea className="mt-2 w-full border rounded px-2 py-1" rows={3} value={m.message} onChange={(e) => onChange?.(m._id, { message: e.target.value })} />
					) : (
						<p className="mt-2 text-slate-700 whitespace-pre-wrap">{m.message}</p>
					)}
				</div>
			))}
		</div>
	);
} 