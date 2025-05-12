
import axios from 'axios';

// Determine the appropriate base URL based on environment
const getBaseUrl = () => {
  // Check if we're in development (localhost) or in production
  const inDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';
  
  if (inDevelopment) {
    return 'http://localhost:5000/api';
  } else {
    // In production, use relative URL which will work regardless of hosting
    return '/api';
  }
};

const API = axios.create({
  baseURL: getBaseUrl()
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const login = (formData: { email: string; password: string }) => 
  API.post('/auth/login', formData);

export const register = (formData: { username: string; email: string; password: string }) => 
  API.post('/auth/register', formData);

export const getCurrentUser = () => 
  API.get('/auth/me');

// Memory services
export const getMemories = (page = 1, limit = 10, tag?: string) => 
  API.get(`/memories?page=${page}&limit=${limit}${tag ? `&tag=${tag}` : ''}`);

export const getMemory = (id: string) => 
  API.get(`/memories/${id}`);

export const createMemory = (memoryData: any) => 
  API.post('/memories', memoryData);

export const updateMemory = (id: string, memoryData: any) => 
  API.put(`/memories/${id}`, memoryData);

export const deleteMemory = (id: string) => 
  API.delete(`/memories/${id}`);

export const likeMemory = (id: string) => 
  API.put(`/memories/${id}/like`);

export const commentMemory = (id: string, commentData: { text: string }) => 
  API.post(`/memories/${id}/comment`, commentData);

// User services
export const getUserProfile = (username: string) => 
  API.get(`/users/profile/${username}`);

export const updateProfile = (profileData: any) => 
  API.put('/users/profile', profileData);

export const followUser = (id: string) => 
  API.put(`/users/follow/${id}`);

export const getPopularUsers = () => 
  API.get('/users/popular');
