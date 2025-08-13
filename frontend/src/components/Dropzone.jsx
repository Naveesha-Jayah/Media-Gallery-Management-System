import React, { useCallback, useRef, useState } from 'react';

export default function Dropzone({ onFileSelected, multiple = false, maxFiles = 5, maxSize = 10 }) {
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState('');
	const [uploadProgress, setUploadProgress] = useState({});
	const inputRef = useRef(null);

	const validateFile = (file) => {
		// Supported file types
		const allowedTypes = [
			// Images
			'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
			// Videos
			'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
			// Documents
			'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'text/plain', 'text/html', 'text/css', 'text/javascript',
			// Audio
			'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/aac'
		];

		if (!allowedTypes.includes(file.type)) {
			return `File type ${file.type} not supported. Allowed: images, videos, documents, audio.`;
		}

		if (file.size > maxSize * 1024 * 1024) {
			return `File too large (max ${maxSize}MB)`;
		}

		return null;
	};

	const handleFiles = useCallback((files) => {
		setError('');
		
		if (!files || files.length === 0) return;
		
		// Convert FileList to Array
		const fileArray = Array.from(files);
		
		// Validate number of files
		if (multiple && fileArray.length > maxFiles) {
			setError(`Maximum ${maxFiles} files allowed`);
			return;
		}
		
		// Validate each file
		const validFiles = [];
		const errors = [];
		
		fileArray.forEach((file, index) => {
			const validationError = validateFile(file);
			if (validationError) {
				errors.push(`${file.name}: ${validationError}`);
			} else {
				validFiles.push(file);
			}
		});
		
		if (errors.length > 0) {
			setError(errors.join('; '));
			return;
		}
		
		if (validFiles.length > 0) {
			onFileSelected?.(multiple ? validFiles : validFiles[0]);
		}
	}, [onFileSelected, multiple, maxFiles, maxSize]);

	const getFileIcon = (fileType) => {
		if (fileType.startsWith('image/')) return '🖼️';
		if (fileType.startsWith('video/')) return '🎥';
		if (fileType.startsWith('audio/')) return '🎵';
		if (fileType.includes('pdf')) return '📄';
		if (fileType.includes('word') || fileType.includes('excel') || fileType.includes('powerpoint')) return '📊';
		return '📁';
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<div className="w-full">
			<div
				onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
				onDragLeave={() => setIsDragging(false)}
				onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
				className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
					isDragging 
						? 'border-blue-500 bg-blue-50' 
						: 'border-slate-300 hover:border-slate-400'
				}`}
			>
				<div className="text-4xl mb-2">
					{multiple ? '📁' : '📤'}
				</div>
				
				<div className="space-y-2">
					<p className="text-lg font-medium text-slate-700">
						{multiple ? 'Drop files here' : 'Drop a file here'}
					</p>
					<p className="text-sm text-slate-500">
						{multiple 
							? `Drag & drop up to ${maxFiles} files, or click to browse`
							: 'Drag & drop a file, or click to browse'
						}
					</p>
					<p className="text-xs text-slate-400">
						Supported: Images, Videos, Documents, Audio (Max: {maxSize}MB each)
					</p>
				</div>
				
				<button 
					type="button" 
					className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors" 
					onClick={() => inputRef.current?.click()}
				>
					{multiple ? 'Choose Files' : 'Choose File'}
				</button>
				
				<input 
					ref={inputRef} 
					type="file" 
					multiple={multiple}
					accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.html,.css,.js"
					className="hidden" 
					onChange={(e) => handleFiles(e.target.files)} 
				/>
			</div>
			
			{error && (
				<div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}
		</div>
	);
} 