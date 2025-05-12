
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const EditProfile = () => {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    toast({
      title: "Authentication required",
      description: "You need to log in to edit your profile.",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await updateUserProfile({ bio, profileImage });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold memory-text-gradient mb-2">Edit Profile</h1>
          <p className="text-gray-500">Update your profile information</p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage} />
                  <AvatarFallback>
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <h2 className="text-xl font-bold">{user?.username}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input
                  id="profileImage"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="Enter image URL"
                  className="memory-input"
                />
                
                {profileImage && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="memory-input min-h-32"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-memory-primary hover:bg-memory-secondary"
                disabled={isSubmitting}
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

export default EditProfile;
