import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function NavItem({ to, children }) {
	return (
		<NavLink to={to} className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}>
			{children}
		</NavLink>
	);
}

export default function Layout({ children }) {
	const { user, logout, isAdmin } = useAuth();
	const [open, setOpen] = useState(false);

	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-4">
					<div className="h-14 flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<button className="md:hidden p-2 rounded hover:bg-slate-100" onClick={() => setOpen(!open)} aria-label="Toggle menu">
								<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
							</button>
						
							<span className="font-semibold text-slate-900 hover:text-slate-700 transition-colors"> Media Gallery </span>
						</div>
						<nav className="hidden md:flex items-center gap-1">
							{user && <NavItem to="/gallery">Gallery</NavItem>}
							{user && <NavItem to="/upload">Upload</NavItem>}
							{user && <NavItem to="/contact">Contact</NavItem>}
							{isAdmin() && <NavItem to="/admin/users">Admin Users</NavItem>}
							{isAdmin() && <NavItem to="/admin/contact">Admin Contact</NavItem>}
						</nav>
						<div className="flex items-center gap-2">
							{user ? (
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2">
										<Link to="/profile" className="hidden md:inline text-slate-700 hover:text-slate-900 transition-colors">
											{user.name}
										</Link>
										{/* Role Badge */}
										<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
											user.role === 'admin' 
												? 'bg-purple-100 text-purple-800' 
												: 'bg-blue-100 text-blue-800'
										}`}>
											{user.role === 'admin' ? 'Admin' : 'User'}
										</span>
									</div>
									<button onClick={logout} className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 transition-colors">
										Logout
									</button>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Link to="/login" className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 transition-colors">
										Login
									</Link>
									<Link to="/register" className="px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors">
										Sign up
									</Link>
								</div>
							)}
						</div>
					</div>
					{open && (
						<div className="md:hidden pb-3">
							<div className="flex flex-col gap-1">
								{user && <NavItem to="/gallery">Gallery</NavItem>}
								{user && <NavItem to="/upload">Upload</NavItem>}
								{user && <NavItem to="/contact">Contact</NavItem>}
								{isAdmin() && <NavItem to="/admin/users">Admin Users</NavItem>}
								{isAdmin() && <NavItem to="/admin/contact">Admin Contact</NavItem>}
							</div>
						</div>
					)}
				</div>
			</header>
			<main className="flex-1">
				<div className="max-w-7xl mx-auto px-4 py-6">
					{children}
				</div>
			</main>
			<footer className="border-t bg-white">
				<div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
					© {new Date().getFullYear()} Media Gallery - {user ? `${user.role === 'admin' ? 'Administrator' : 'User'} Portal` : 'Welcome'}
				</div>
			</footer>
		</div>
	);
} 