import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
	return (
		<div className="max-w-5xl mx-auto px-4 py-16">
			<div className="text-center">
				<h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to Media Gallery</h1>
				<p className="mt-3 text-slate-600">Manage your media with a clean, fast interface.</p>
				<div className="mt-8 flex items-center justify-center gap-4">
					<Link to="/login" className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Login</Link>
					<Link to="/register" className="px-4 py-2 rounded-md border border-slate-300 text-slate-800 hover:bg-slate-50">Create account</Link>
				</div>
			</div>
		</div>
	);
} 