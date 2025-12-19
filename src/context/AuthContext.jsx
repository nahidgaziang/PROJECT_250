import React, { createContext, useContext, useState, useEffect } from 'react';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create the context
const AuthContext = createContext();

// Create a custom hook to use the context
export function useAuth() {
  return useContext(AuthContext);
}

// Create the provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Use name instead of email
          setCurrentUser(data.user.name);
          console.log('Verified user:', data.user.name);
        } else {
          // Invalid token, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUserName');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUserName');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Sign up with backend API
  const signup = async (email, password, name, registration_no) => {
    try {
      console.log('🔵 Attempting signup with API URL:', API_URL);
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name, registration_no })
      });

      console.log('🔵 Signup response status:', response.status);
      const data = await response.json();
      console.log('🔵 Signup response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token and user name
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUserName', data.user.name);
      setCurrentUser(data.user.name);

      return data.user.name;
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  };

  // Log in with backend API
  const login = async (email, password) => {
    try {
      console.log('🔵 Attempting login with API URL:', API_URL);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('🔵 Login response status:', response.status);
      const data = await response.json();
      console.log('🔵 Login response data:', data);

      if (!response.ok) {
        console.error('❌ Login response error:', data.error);
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user name
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUserName', data.user.name);
      setCurrentUser(data.user.name);

      return data.user.name;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // Log out
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserName');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}