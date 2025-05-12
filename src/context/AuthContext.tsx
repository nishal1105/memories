
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../services/api';
import { toast } from '@/components/ui/use-toast';

type User = {
  id: string;
  username: string;
  email: string;
  profileImage: string;
  bio: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await api.getCurrentUser();
        
        setUser({
          id: response.data._id,
          username: response.data.username,
          email: response.data.email,
          profileImage: response.data.profileImage,
          bio: response.data.bio,
        });
      } catch (error) {
        localStorage.removeItem('token');
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login({ email, password });
      
      // Save token
      localStorage.setItem('token', response.data.token);
      
      // Set user
      setUser({
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        profileImage: response.data.profileImage,
        bio: response.data.bio,
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.data.username}!`,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to login. Please try again.';
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.register({ username, email, password });
      
      // Save token
      localStorage.setItem('token', response.data.token);
      
      // Set user
      setUser({
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        profileImage: response.data.profileImage,
        bio: response.data.bio,
      });
      
      toast({
        title: "Registration successful",
        description: `Welcome to Memories, ${response.data.username}!`,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to register. Please try again.';
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const updateUserProfile = async (profileData: Partial<User>) => {
    try {
      setIsLoading(true);
      const response = await api.updateProfile(profileData);
      
      setUser(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          ...response.data,
        };
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
