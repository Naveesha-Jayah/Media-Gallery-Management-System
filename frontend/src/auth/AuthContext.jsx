import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const saved = localStorage.getItem('auth');
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				if (parsed?.token) {
					setToken(parsed.token);
					setUser(parsed.user || null);
				}
			} catch {}
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		if (token) {
			axios.defaults.baseURL = API_BASE_URL;
			axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		} else {
			delete axios.defaults.headers.common['Authorization'];
		}
	}, [token]);

	const login = (userData, jwt) => {
		setUser(userData);
		setToken(jwt);
		localStorage.setItem('auth', JSON.stringify({ user: userData, token: jwt }));
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('auth');
	};

	const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
} 