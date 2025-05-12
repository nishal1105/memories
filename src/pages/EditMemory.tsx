
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMemory } from '@/context/MemoryContext';
import * as api from '../services/api';
import { useToast } from '@/components/ui/use-toast';

const EditMemory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { updateMemory } = useMemory();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  useEffect(() => {
    const fetchMemory = async () => {
      try {
        if (!id) return;
        
        const response = await api.getMemory(id);
        
        // Check if current user is the creator
        if (user && response.data.creator._id !== user.id) {
          setNotAuthorized(true);
          return;
        }
        
        // Set memory data
        setTitle(response.data.title);
        setDescription(response.data.description);
        setImageUrl(response.data.image || '');
        setTags(response.data.tags || []);
      } catch (error) {
        console.error('Error fetching memory:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemory();
  }, [id, user]);
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !id) return;
    
    try {
      setIsSubmitting(true);
      
      await updateMemory(id, {
        title,
        description,
        image: imageUrl,
        tags,
      });
      
      toast({
        title: "Memory updated",
        description: "Your memory has been successfully updated.",
      });
      
      navigate(`/memory/${id}`);
    } catch (error) {
      console.error('Error updating memory:', error);
      toast({
        variant: "destructive",
        title: "Failed to update memory",
        description: "There was an error updating your memory. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (notAuthorized) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
          <p className="mb-4 text-gray-500">You don't have permission to edit this memory.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </main>
      </div>
    );
  }
  
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Memory not found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </main>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse">Loading memory...</div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold memory-text-gradient mb-2">Edit Memory</h1>
          <p className="text-gray-500">Update your memory</p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Edit Memory</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your memory a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="memory-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your memory..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="memory-input min-h-32"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  placeholder="Add an image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="memory-input"
                />
                
                {imageUrl && (
                  <div className="mt-2 aspect-video relative overflow-hidden rounded-md border">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Add tags (press Enter or comma to add)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="memory-input"
                />
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <div 
                        key={tag} 
                        className="memory-tag flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-memory-primary hover:bg-memory-secondary"
                disabled={isSubmitting || !title || !description}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default EditMemory;
