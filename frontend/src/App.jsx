import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminRegisterPage from './pages/AdminRegisterPage.jsx';
import OAuthSuccessPage from './pages/OAuthSuccessPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import ImageDetailPage from './pages/ImageDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminContactPage from './pages/AdminContactPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import Layout from './components/Layout.jsx';

function ProtectedRoute({ children }) {
	const { user, loading } = useAuth();
	if (loading) return <div className="p-8 text-center text-slate-700">Loading...</div>;
	if (!user) return <Navigate to="/login" replace />;
	return children;
}

export default function App() {
	return (
		<AuthProvider>
			<Layout>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/admin-register" element={<AdminRegisterPage />} />
					<Route path="/auth/success" element={<OAuthSuccessPage />} />
					<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
					<Route path="/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
					<Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
					<Route path="/media/:id" element={<ProtectedRoute><ImageDetailPage /></ProtectedRoute>} />
					<Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
					<Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
					<Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
					<Route path="/admin/contact" element={<ProtectedRoute><AdminContactPage /></ProtectedRoute>} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</Layout>
		</AuthProvider>
	);
} 