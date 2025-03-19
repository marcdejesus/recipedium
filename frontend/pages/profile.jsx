import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, User, Save, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setProfileImage(user.profileImage || '');
    }
  }, [user, loading, router]);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Default avatar URL
  const defaultAvatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg';

  // Handle save profile image
  const handleSaveImage = async () => {
    try {
      // Here you would normally make an API call to update the user's profile image
      // For now, we'll just update the local state
      setIsEditingImage(false);
      // Update user profile image
      alert('Profile image updated successfully. In a real app, this would be saved to the database.');
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Failed to update profile image. Please try again.');
    }
  };

  // Show loading spinner while checking authentication
  if (loading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Button>
      
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>View and manage your account information</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start sm:justify-start">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage || defaultAvatarUrl} alt={user.name} />
                  <AvatarFallback className="text-xl bg-amber-100 text-amber-800">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
                {!isEditingImage && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-white"
                    onClick={() => setIsEditingImage(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {isEditingImage && (
                <div className="flex flex-col gap-2">
                  <div className="w-full">
                    <Label htmlFor="profileImage">Profile Image URL</Label>
                    <Input
                      id="profileImage"
                      placeholder="https://example.com/your-image.jpg"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      className="w-full md:w-96"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveImage}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setProfileImage(user.profileImage || '');
                        setIsEditingImage(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Details */}
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <div className="mt-1 rounded-md border bg-gray-50 px-3 py-2">
                  {user.name}
                </div>
              </div>
              
              <div>
                <Label>Email</Label>
                <div className="mt-1 rounded-md border bg-gray-50 px-3 py-2">
                  {user.email}
                </div>
              </div>
              
              <div>
                <Label>Member Since</Label>
                <div className="mt-1 rounded-md border bg-gray-50 px-3 py-2">
                  {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push('/settings')}
            >
              Account Settings
            </Button>
            <Button onClick={() => router.push(`/recipes/user/${user._id}`)}>
              View My Recipes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 