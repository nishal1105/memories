
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, ArrowLeft, Trash, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useMemory, Memory, Comment } from '@/context/MemoryContext';
import * as api from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

const MemoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { likeMemory, deleteMemory } = useMemory();
  const { toast } = useToast();
  
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchMemory = async () => {
      try {
        if (!id) return;
        
        const response = await api.getMemory(id);
        
        // Transform response data to match our Memory type
        const transformedMemory: Memory = {
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
        
        setMemory(transformedMemory);
      } catch (error) {
        console.error('Error fetching memory:', error);
        toast({
          variant: "destructive",
          title: "Failed to load memory",
          description: "There was an error loading this memory. Please try again.",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemory();
  }, [id, navigate, toast]);
  
  const handleLike = () => {
    if (!memory) return;
    likeMemory(memory.id);
    
    // Update local memory state
    setMemory(prev => {
      if (!prev || !user) return prev;
      
      const isLiked = prev.likes.includes(user.id);
      const updatedLikes = isLiked
        ? prev.likes.filter(id => id !== user.id)
        : [...prev.likes, user.id];
      
      return {
        ...prev,
        likes: updatedLikes,
      };
    });
  };
  
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memory || !comment.trim() || !user) return;
    
    try {
      const response = await api.commentMemory(memory.id, { text: comment });
      
      // Transform comments
      const transformedComments: Comment[] = response.data.map((comment: any) => ({
        id: comment._id,
        text: comment.text,
        username: comment.creator.username,
        userImage: comment.creator.profileImage,
        createdAt: comment.createdAt,
      }));
      
      // Update local memory state
      setMemory(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: transformedComments,
        };
      });
      
      // Clear comment input
      setComment('');
    } catch (error) {
      console.error('Error commenting:', error);
      toast({
        variant: "destructive",
        title: "Comment failed",
        description: "There was an error posting your comment. Please try again.",
      });
    }
  };
  
  const handleDelete = async () => {
    if (!memory) return;
    
    try {
      await deleteMemory(memory.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse">Loading memory...</div>
        </main>
      </div>
    );
  }
  
  if (!memory) {
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
  
  const isLiked = user ? memory.likes.includes(user.id) : false;
  const canEdit = user && memory.creatorId === user.id;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
          
          <Card className="memory-card">
            <CardHeader className="space-y-0 p-4">
              <div className="flex justify-between items-center">
                <Link to={`/profile/${memory.creatorName}`} className="flex items-center gap-2 hover:underline">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={memory.creatorImage} />
                    <AvatarFallback>
                      {memory.creatorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h3 className="text-sm font-medium">{memory.creatorName}</h3>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
                
                {canEdit && (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-gray-500 hover:text-primary"
                      onClick={() => navigate(`/edit/${memory.id}`)}
                    >
                      <Edit size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            {memory.image && (
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={memory.image} 
                  alt={memory.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="p-6 pt-4 space-y-4">
              <h1 className="text-2xl font-bold">{memory.title}</h1>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{memory.description}</p>
              
              {memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {memory.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="memory-tag">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col p-4 pt-0 space-y-4">
              <div className="flex items-center justify-between w-full border-t pt-3">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost"
                    size="sm" 
                    className={cn(
                      "flex items-center gap-1 px-2", 
                      isLiked ? "text-memory-primary" : "text-gray-500"
                    )}
                    onClick={handleLike}
                    disabled={!isAuthenticated}
                  >
                    <Heart size={18} className={isLiked ? "fill-memory-primary" : ""} />
                    <span>{memory.likes.length}</span>
                  </Button>
                </div>
                
                <Button 
                  variant="ghost"
                  size="sm" 
                  className="flex items-center gap-1 px-2 text-gray-500"
                >
                  <MessageSquare size={18} />
                  <span>{memory.comments.length}</span>
                </Button>
              </div>
              
              <div className="w-full space-y-4 border-t pt-4">
                <h3 className="font-medium">Comments</h3>
                
                {memory.comments.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto px-1">
                    {memory.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 items-start">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={comment.userImage} />
                          <AvatarFallback>
                            {comment.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 text-sm flex-1">
                          <div className="font-medium text-xs">{comment.username}</div>
                          <div>{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No comments yet. Be the first to comment!
                  </div>
                )}
                
                {isAuthenticated ? (
                  <form onSubmit={handleComment} className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-1 h-9"
                    />
                    <Button type="submit" size="sm" variant="outline" disabled={!comment.trim()}>
                      Post
                    </Button>
                  </form>
                ) : (
                  <div className="text-center">
                    <Link to="/login" className="text-memory-primary hover:underline">
                      Log in to comment
                    </Link>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Memory</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this memory? This action cannot be undone.</p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemoryDetail;
