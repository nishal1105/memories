
import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/context/AuthContext';
import { useMemory } from '@/context/MemoryContext';
import { useToast } from '@/components/ui/use-toast';
import * as api from '../services/api';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { username } = useParams<{ username?: string }>();
  const { user, isAuthenticated } = useAuth();
  const { fetchUserMemories } = useMemory();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Determine if this is the current user's profile or another user's profile
  const isCurrentUser = !username || (user && user.username === username);
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        
        // If it's the current user's profile and they're authenticated
        if (isCurrentUser && user) {
          setProfileUser({
            id: user.id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            bio: user.bio,
          });
          
          // Fetch the current user's memories
          await fetchUserMemories(user.username);
        } 
        // If it's another user's profile
        else if (username) {
          // Get the user profile from the API
          const response = await api.getUserProfile(username);
          
          setProfileUser({
            id: response.data.user._id,
            username: response.data.user.username,
            email: response.data.user.email,
            profileImage: response.data.user.profileImage,
            bio: response.data.user.bio,
            followers: response.data.user.followers,
            following: response.data.user.following,
          });
          
          // The memories are already fetched in the getUserProfile API call
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setNotFound(true);
        
        toast({
          variant: "destructive",
          title: "Profile not found",
          description: "The requested profile could not be found.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [username, user, isCurrentUser, fetchUserMemories, toast]);
  
  // Show toast and redirect if trying to access own profile but not authenticated
  if (isCurrentUser && !isAuthenticated) {
    toast({
      title: "Authentication required",
      description: "You need to log in to view your profile.",
      variant: "destructive",
    });
    
    return <Navigate to="/login" replace />;
  }
  
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <p className="mb-4 text-gray-500">The user profile you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </main>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse">Loading profile...</div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <UserProfile user={profileUser} isCurrentUser={isCurrentUser} />
      </main>
    </div>
  );
};

export default Profile;
