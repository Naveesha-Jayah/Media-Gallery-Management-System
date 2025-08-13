import React from 'react';

export default function TextInput({ id, label, type = 'text', value, onChange, placeholder, required, error }) {
	return (
		<div className="space-y-1">
			<label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required={required}
				className={`w-full rounded-md border px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 ${error ? 'border-red-500' : 'border-slate-300'}`}
			/>
			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
} 