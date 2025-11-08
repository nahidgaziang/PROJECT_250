import React, { createContext, useContext, useState } from 'react';

// Create the context
const AuthContext = createContext();

// Create a custom hook to use the context
export function useAuth() {
  return useContext(AuthContext);
}

// Create the provider component
export function AuthProvider({ children }) {
  // Try to get the user from localStorage on initial load
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUserEmail'));

  // --- Fake Sign Up ---
  // DANGER: We are storing the password in localStorage.
  // This is very insecure.
  const signup = (email, password) => {
    // We'll store users in an object in localStorage
    const users = JSON.parse(localStorage.getItem('usersDB')) || {};
    
    if (users[email]) {
      throw new Error("This email is already taken.");
    }
    
    // Store the new user
    users[email] = { password }; // Storing password in plain text!
    localStorage.setItem('usersDB', JSON.stringify(users));
    
    // Log them in
    localStorage.setItem('currentUserEmail', email);
    setCurrentUser(email);
    return email;
  };

  // --- Fake Log In ---
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('usersDB')) || {};

    if (!users[email]) {
      throw new Error("No account found with this email.");
    }
    if (users[email].password !== password) {
      throw new Error("Incorrect password.");
    }

    // Log them in
    localStorage.setItem('currentUserEmail', email);
    setCurrentUser(email);
    return email;
  };

  // --- Fake Log Out ---
  const logout = () => {
    localStorage.removeItem('currentUserEmail');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}