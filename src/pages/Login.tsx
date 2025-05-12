
import React from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold memory-text-gradient mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to continue your memory journey</p>
        </div>
        <LoginForm />
      </main>
    </div>
  );
};

export default Login;
