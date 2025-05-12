
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as api from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

export type Comment = {
  id: string;
  text: string;
  username: string;
  userImage: string;
  createdAt: string;
};

export type Memory = {
  id: string;
  title: string;
  description: string;
  image?: string;  // This is already correctly defined as optional
  tags: string[];
  likes: string[];
  comments: Comment[];
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  createdAt: string;
};

type MemoryContextType = {
  memories: Memory[];
  userMemories: Memory[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  fetchMemories: (page?: number, tag?: string) => Promise<void>;
  fetchUserMemories: (username: string) => Promise<void>;
  createMemory: (memoryData: Partial<Memory>) => Promise<void>;
  updateMemory: (id: string, memoryData: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  likeMemory: (id: string) => Promise<void>;
  addComment: (id: string, comment: string) => Promise<void>;
};

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider = ({ children }: { children: ReactNode }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [userMemories, setUserMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMemories = async (page = 1, tag?: string) => {
    try {
      setIsLoading(true);
      const response = await api.getMemories(page, 10, tag);
      
      // Transform response data to match our Memory type
      const transformedMemories = response.data.memories.map((memory: any) => ({
        id: memory._id,
        title: memory.title,
        description: memory.description,
        image: memory.image,
        tags: memory.tags,
        likes: memory.likes,
        comments: memory.comments.map((comment: any) => ({
          id: comment._id,
          text: comment.text,
          username: comment.creator.username,
          userImage: comment.creator.profileImage,
          createdAt: comment.createdAt,
        })),
        creatorId: memory.creator._id,
        creatorName: memory.creator.username,
        creatorImage: memory.creator.profileImage,
        createdAt: memory.createdAt,
      }));
      
      setMemories(transformedMemories);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast({
        variant: "destructive",
        title: "Failed to load memories",
        description: "There was an error loading memories. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserMemories = async (username: string) => {
    try {
      setIsLoading(true);
      const response = await api.getUserProfile(username);
      
      // Transform response data to match our Memory type
      const transformedMemories = response.data.memories.map((memory: any) => ({
        id: memory._id,
        title: memory.title,
        description: memory.description,
        image: memory.image,
        tags: memory.tags,
        likes: memory.likes,
        comments: memory.comments.map((comment: any) => ({
          id: comment._id,
          text: comment.text,
          username: comment.creator.username,
          userImage: comment.creator.profileImage,
          createdAt: comment.createdAt,
        })),
        creatorId: memory.creator._id,
        creatorName: memory.creator.username,
        creatorImage: memory.creator.profileImage,
        createdAt: memory.createdAt,
      }));
      
      setUserMemories(transformedMemories);
    } catch (error) {
      console.error('Error fetching user memories:', error);
      toast({
        variant: "destructive",
        title: "Failed to load user memories",
        description: "There was an error loading this user's memories. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMemory = async (memoryData: Partial<Memory>) => {
    try {
      setIsLoading(true);
      
      // Transform memory data for API
      const transformedData = {
        title: memoryData.title,
        description: memoryData.description,
        image: memoryData.image,
        tags: memoryData.tags,
      };
      
      const response = await api.createMemory(transformedData);
      
      // Transform response data to match our Memory type
      const newMemory: Memory = {
        id: response.data._id,
        title: response.data.title,
        description: response.data.description,
        image: response.data.image,
        tags: response.data.tags,
        likes: response.data.likes,
        comments: response.data.comments.map((comment: any) => ({
          id: comment._id,
          text: comment.text,
          username: comment.creator.username,
          userImage: comment.creator.profileImage,
          createdAt: comment.createdAt,
        })),
        creatorId: response.data.creator._id,
        creatorName: response.data.creator.username,
        creatorImage: response.data.creator.profileImage,
        createdAt: response.data.createdAt,
      };
      
      // Update state
      setMemories(prevMemories => [newMemory, ...prevMemories]);
      
      toast({
        title: "Memory created",
        description: "Your memory has been successfully created.",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating memory:', error);
      toast({
        variant: "destructive",
        title: "Failed to create memory",
        description: "There was an error creating your memory. Please try again.",
      });
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemory = async (id: string, memoryData: Partial<Memory>) => {
    try {
      setIsLoading(true);
      
      // Transform memory data for API
      const transformedData = {
        title: memoryData.title,
        description: memoryData.description,
        image: memoryData.image,
        tags: memoryData.tags,
      };
      
      const response = await api.updateMemory(id, transformedData);
      
      // Transform response data to match our Memory type
      const updatedMemory: Memory = {
        id: response.data._id,
        title: response.data.title,
        description: response.data.description,
        image: response.data.image,
        tags: response.data.tags,
        likes: response.data.likes,
        comments: response.data.comments.map((comment: any) => ({
          id: comment._id,
          text: comment.text,
          username: comment.creator.username,
          userImage: comment.creator.profileImage,
          createdAt: comment.createdAt,
        })),
        creatorId: response.data.creator._id,
        creatorName: response.data.creator.username,
        creatorImage: response.data.creator.profileImage,
        createdAt: response.data.createdAt,
      };
      
      // Update state
      setMemories(prevMemories => 
        prevMemories.map(memory => 
          memory.id === id ? updatedMemory : memory
        )
      );
      
      setUserMemories(prevMemories => 
        prevMemories.map(memory => 
          memory.id === id ? updatedMemory : memory
        )
      );
      
      toast({
        title: "Memory updated",
        description: "Your memory has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating memory:', error);
      toast({
        variant: "destructive",
        title: "Failed to update memory",
        description: "There was an error updating your memory. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      setIsLoading(true);
      await api.deleteMemory(id);
      
      // Update state
      setMemories(prevMemories => 
        prevMemories.filter(memory => memory.id !== id)
      );
      
      setUserMemories(prevMemories => 
        prevMemories.filter(memory => memory.id !== id)
      );
      
      toast({
        title: "Memory deleted",
        description: "Your memory has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete memory",
        description: "There was an error deleting your memory. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const likeMemory = async (id: string) => {
    try {
      if (!user) return;
      
      const response = await api.likeMemory(id);
      
      // Update state
      setMemories(prevMemories => 
        prevMemories.map(memory => 
          memory.id === id ? { ...memory, likes: response.data.likes } : memory
        )
      );
      
      setUserMemories(prevMemories => 
        prevMemories.map(memory => 
          memory.id === id ? { ...memory, likes: response.data.likes } : memory
        )
      );
    } catch (error) {
      console.error('Error liking memory:', error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "There was an error processing your action. Please try again.",
      });
    }
  };

  const addComment = async (id: string, comment: string) => {
    try {
      if (!user) return;
      
      const response = await api.commentMemory(id, { text: comment });
      
      // Transform comments
      const transformedComments = response.data.map((comment: any) => ({
        id: comment._id,
        text: comment.text,
        username: comment.creator.username,
        userImage: comment.creator.profileImage,
        createdAt: comment.createdAt,
      }));
      
      // Update state
      setMemories(prevMemories => 
        prevMemories.map(memory => 
          memory.id === id ? { ...memory, comments: transformedComments } : memory
        )
      );
      
      setUserMemories(prevMemories => 
        prevMemories.map(memory => 
          memory.id === id ? { ...memory, comments: transformedComments } : memory
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        title: "Comment failed",
        description: "There was an error posting your comment. Please try again.",
      });
    }
  };

  // Fetch memories on mount
  useEffect(() => {
    fetchMemories();
  }, []);

  return (
    <MemoryContext.Provider
      value={{
        memories,
        userMemories,
        isLoading,
        currentPage,
        totalPages,
        fetchMemories,
        fetchUserMemories,
        createMemory,
        updateMemory,
        deleteMemory,
        likeMemory,
        addComment,
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (context === undefined) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};
