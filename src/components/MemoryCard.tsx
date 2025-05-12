
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Trash, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Memory, useMemory } from '@/context/MemoryContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

interface MemoryCardProps {
  memory: Memory;
  showActions?: boolean;
}

export function MemoryCard({ memory, showActions = true }: MemoryCardProps) {
  const { likeMemory, addComment, deleteMemory } = useMemory();
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const isLiked = user ? memory.likes.includes(user.id) : false;
  const canDelete = user && memory.creatorId === user.id;
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMemory(memory.id);
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (comment.trim()) {
      addComment(memory.id, comment);
      setComment('');
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMemory(memory.id);
    setIsDeleteDialogOpen(false);
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleImageError = () => {
    console.log("Image failed to load:", memory.image);
    setImageError(true);
  };

  return (
    <Card className="memory-card">
      <CardHeader className="space-y-0 p-4">
        <div className="flex justify-between items-center">
          <Link 
            to={`/profile/${memory.creatorName}`} 
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={memory.creatorImage} />
              <AvatarFallback>{memory.creatorName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h3 className="text-sm font-medium">{memory.creatorName}</h3>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
          
          {canDelete && showActions && (
            <div className="flex gap-1">
              <Link 
                to={`/edit/${memory.id}`} 
                onClick={(e) => e.stopPropagation()}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <Button 
                  variant="ghost" 
                  size="icon"
                >
                  <Edit size={18} />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-500 hover:text-red-500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash size={18} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      {memory.image && !imageError && (
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={memory.image} 
            alt={memory.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={handleImageError}
          />
        </div>
      )}
      
      <CardContent className="p-4 pt-3 space-y-4">
        <Link to={`/memory/${memory.id}`} className="block">
          <h2 className="text-xl font-bold hover:text-memory-primary transition-colors">{memory.title}</h2>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{memory.description}</p>
        
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
      
      {showActions && (
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
              onClick={toggleComments}
            >
              <MessageSquare size={18} />
              <span>{memory.comments.length}</span>
            </Button>
          </div>
          
          {showComments && (
            <div className="w-full space-y-3">
              {memory.comments.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto px-1">
                  {memory.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2 items-start">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={comment.userImage} />
                        <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 text-sm flex-1">
                        <div className="font-medium text-xs">{comment.username}</div>
                        <div>{comment.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 h-9"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    variant="outline" 
                    disabled={!comment.trim()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Post
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  <Link to="/login" className="text-memory-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                    Login to comment
                  </Link>
                </p>
              )}
            </div>
          )}
        </CardFooter>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete Memory</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this memory? This action cannot be undone.</p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteDialogOpen(false);
              }}
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
    </Card>
  );
}

export default MemoryCard;
