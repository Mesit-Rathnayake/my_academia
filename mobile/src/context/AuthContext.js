import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Failed to load auth state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (registrationNumber, password) => {
    try {
      const response = await client.post('/auth/login', {
        registrationNumber: registrationNumber.trim(),
        password,
      });

      const { token: receivedToken, user: receivedUser } = response.data;

      await SecureStore.setItemAsync('token', receivedToken);
      await SecureStore.setItemAsync('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: message };
    }
  };

  const register = async (registrationNumber, password, firstName, lastName) => {
    try {
      const response = await client.post('/auth/register', {
        registrationNumber: registrationNumber.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      const { token: receivedToken, user: receivedUser } = response.data;

      await SecureStore.setItemAsync('token', receivedToken);
      await SecureStore.setItemAsync('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.warn('Error during logout:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
