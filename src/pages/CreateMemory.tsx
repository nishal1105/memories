
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import CreateMemoryForm from '@/components/CreateMemoryForm';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const CreateMemory = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Show toast if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You need to log in to create memories.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, toast]);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold memory-text-gradient mb-2">Create a Memory</h1>
          <p className="text-gray-500">Share your special moments with the world</p>
        </div>
        <CreateMemoryForm />
      </main>
    </div>
  );
};

export default CreateMemory;
