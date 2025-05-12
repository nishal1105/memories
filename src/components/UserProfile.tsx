
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useMemory } from '@/context/MemoryContext';
import MemoryCard from './MemoryCard';
import { Edit, UserPlus, UserMinus } from 'lucide-react';
import * as api from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface UserProfileProps {
  user: {
    id: string;
    username: string;
    email: string;
    profileImage: string;
    bio: string;
    followers?: string[];
    following?: string[];
  };
  isCurrentUser: boolean;
}

export function UserProfile({ user, isCurrentUser }: UserProfileProps) {
  const { userMemories } = useMemory();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [followers, setFollowers] = useState(user.followers || []);
  const [isFollowing, setIsFollowing] = useState(
    currentUser && user.followers?.includes(currentUser.id)
  );
  const [followLoading, setFollowLoading] = useState(false);
  
  if (!user) {
    return null;
  }
  
  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      setFollowLoading(true);
      
      const response = await api.followUser(user.id);
      
      setIsFollowing(!isFollowing);
      setFollowers(isFollowing 
        ? followers.filter(id => id !== currentUser.id)
        : [...followers, currentUser.id]
      );
      
      toast({
        title: response.data.message,
        description: isFollowing 
          ? `You are no longer following ${user.username}` 
          : `You are now following ${user.username}`,
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "There was an error processing your request. Please try again.",
      });
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profileImage} />
              <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                {isCurrentUser ? (
                  <Link to="/edit-profile">
                    <Button variant="outline" className="flex items-center gap-1">
                      <Edit size={16} />
                      <span>Edit Profile</span>
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing 
                      ? "border-gray-300 text-gray-700" 
                      : "bg-memory-primary hover:bg-memory-secondary"
                    }
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus size={16} className="mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-gray-500">{isCurrentUser && user.email}</p>
              {user.bio && <p className="mt-2">{user.bio}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{userMemories.length}</div>
              <div className="text-gray-500">Memories</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{followers.length}</div>
              <div className="text-gray-500">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{user.following?.length || 0}</div>
              <div className="text-gray-500">Following</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="memories">
        <TabsList className="w-full">
          <TabsTrigger value="memories" className="flex-1">Memories</TabsTrigger>
          <TabsTrigger value="liked" className="flex-1">Liked</TabsTrigger>
        </TabsList>
        
        <TabsContent value="memories" className="mt-6">
          {userMemories.length > 0 ? (
            <div className="space-y-6">
              {userMemories.map((memory) => (
                <Link to={`/memory/${memory.id}`} key={memory.id} className="block">
                  <MemoryCard memory={memory} />
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-medium mb-2">No memories yet</h3>
              <p className="text-gray-500">
                {isCurrentUser 
                  ? "Your shared memories will appear here." 
                  : "This user hasn't shared any memories yet."}
              </p>
              {isCurrentUser && (
                <Link to="/create">
                  <Button className="mt-4 bg-memory-primary hover:bg-memory-secondary">
                    Create Memory
                  </Button>
                </Link>
              )}
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="liked" className="mt-6">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-medium mb-2">No liked memories yet</h3>
            <p className="text-gray-500">
              {isCurrentUser 
                ? "Memories you've liked will appear here." 
                : "This user hasn't liked any memories yet."}
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UserProfile;
