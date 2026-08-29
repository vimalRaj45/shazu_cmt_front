import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null); // Allows switching perspective (Admin, Chair, Reviewer, Author, Participant)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cmt_user');
    const token = localStorage.getItem('cmt_token');

    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setActiveRole(parsed.role);
      } catch (e) {
        localStorage.removeItem('cmt_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, turnstileToken = '') => {
    const res = await api.post('/auth/login', {
      email,
      password,
      turnstileToken,
      'cf-turnstile-response': turnstileToken,
    });
    const { user: loggedInUser, token } = res.data;
    localStorage.setItem('cmt_token', token);
    localStorage.setItem('cmt_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setActiveRole(loggedInUser.role);
    return loggedInUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { user: registeredUser, token } = res.data;
    localStorage.setItem('cmt_token', token);
    localStorage.setItem('cmt_user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    setActiveRole(registeredUser.role);
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('cmt_token');
    localStorage.removeItem('cmt_user');
    setUser(null);
    setActiveRole(null);
    window.location.href = '/login';
  };

  const switchActiveRole = (role) => {
    setActiveRole(role);
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, switchActiveRole, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
