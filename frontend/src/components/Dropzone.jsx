import React, { useCallback, useRef, useState } from 'react';

export default function Dropzone({ onFileSelected }) {
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState('');
	const inputRef = useRef(null);

	const handleFiles = useCallback((files) => {
		setError('');
		const file = files?.[0];
		if (!file) return;
		if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
			setError('Only JPG/PNG files are allowed');
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			setError('File too large (max 10MB)');
			return;
		}
		onFileSelected?.(file);
	}, [onFileSelected]);

	return (
		<div>
			<div
				onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
				onDragLeave={() => setIsDragging(false)}
				onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
				className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md p-8 text-center ${isDragging ? 'border-slate-800 bg-slate-50' : 'border-slate-300'}`}
			>
				<p className="text-slate-700">Drag & drop image here, or</p>
				<button type="button" className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50" onClick={() => inputRef.current?.click()}>Browse</button>
				<input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
			</div>
			{error && <p className="mt-2 text-sm text-red-600">{error}</p>}
		</div>
	);
} 