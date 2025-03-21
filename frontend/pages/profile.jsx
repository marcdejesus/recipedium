import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/auth-context';
import apiClient from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, User, Save, ArrowLeft, Upload, Image as ImageIcon, X, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Image resizing function
function resizeImage(file, maxWidth = 400, maxHeight = 400) {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    // Set up the FileReader onload function
    reader.onload = function(event) {
      // Create an image object
      const img = new Image();
      
      img.onload = function() {
        // Calculate the new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        // Create a canvas to draw the resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the resized image on the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the data URL from the canvas (with reduced quality)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        resolve(dataUrl);
      };
      
      img.onerror = function() {
        reject(new Error('Failed to load image'));
      };
      
      // Load the image from the FileReader result
      img.src = event.target.result;
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [profileImage, setProfileImage] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
  
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

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setStatusMessage({
        message: 'Image is too large. Please select an image under 5MB.',
        type: 'error'
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };
  
  // Toggle upload type between URL and file
  const toggleUploadType = (type) => {
    setUploadType(type);
    // Reset preview and file when changing upload type
    if (type === 'url') {
      setProfileImage(user.profileImage || '');
      setSelectedFile(null);
    } else {
      setProfileImage('');
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Clear selected image
  const clearSelectedImage = () => {
    setProfileImage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle save profile image
  const handleSaveImage = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setStatusMessage({ message: '', type: '' });
      
      // Process image upload if a file is selected
      let imageUrl = profileImage;
      
      if (uploadType === 'file' && selectedFile) {
        try {
          // Resize the image to reduce its size
          imageUrl = await resizeImage(selectedFile, 400, 400);
          
          // Check if the base64 string is still too large
          if (imageUrl.length > 1000000) { // ~1MB for base64
            setStatusMessage({
              message: 'Image is too large after processing. Please use a smaller image or an image URL instead.',
              type: 'error'
            });
            setIsSubmitting(false);
            return;
          }
        } catch (error) {
          console.error('Error processing image:', error);
          setStatusMessage({
            message: 'Failed to process image. Please try again with a different image.',
            type: 'error'
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare update data (only update the profile image)
      const updateData = {
        name: user.name,
        email: user.email,
        profileImage: imageUrl
      };
      
      // Only include bio if it exists and has valid length in the user object
      if (user.bio) {
        if (user.bio.length >= 2) {
          updateData.bio = user.bio;
        }
      }
      
      console.log('Updating profile image with data:', {
        ...updateData,
        profileImage: updateData.profileImage ? 
          (updateData.profileImage.length > 100 ? 
            `${updateData.profileImage.substring(0, 50)}...` : 
            updateData.profileImage) : 
          null
      });
      
      // Make API call to update the user's profile image
      const response = await apiClient.users.updateUserProfile(user._id, updateData);
      
      // Update local user state with new profile image
      if (updateUser) {
        updateUser({ ...user, profileImage: imageUrl });
      }
      
      setIsEditingImage(false);
      setStatusMessage({
        message: 'Profile image updated successfully!',
        type: 'success'
      });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile image:', error);
      setStatusMessage({
        message: error.message || 'Failed to update profile image. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel image editing
  const handleCancelEdit = () => {
    setProfileImage(user.profileImage || '');
    setSelectedFile(null);
    setIsEditingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
                  <AvatarImage src={profileImage || defaultAvatarUrl} alt={user.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatarUrl;
                    }}
                  />
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
                <div className="flex flex-col gap-2 w-full max-w-md">
                  {/* Upload Method Tabs */}
                  <div className="rounded-md border bg-gray-50 p-4">
                    <div className="mb-4 flex rounded-md border border-gray-200">
                      <Button
                        type="button"
                        variant={uploadType === 'url' ? 'default' : 'ghost'}
                        onClick={() => toggleUploadType('url')}
                        className={`flex-1 rounded-r-none ${uploadType === 'url' ? 'bg-amber-50 text-amber-700' : ''}`}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Image URL
                      </Button>
                      <Button
                        type="button"
                        variant={uploadType === 'file' ? 'default' : 'ghost'}
                        onClick={() => toggleUploadType('file')}
                        className={`flex-1 rounded-l-none ${uploadType === 'file' ? 'bg-amber-50 text-amber-700' : ''}`}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                      </Button>
                    </div>
                    
                    {/* URL Input */}
                    {uploadType === 'url' && (
                      <div className="space-y-2">
                        <Label htmlFor="profileImage">Image URL</Label>
                        <Input
                          id="profileImage"
                          placeholder="https://example.com/your-image.jpg"
                          value={profileImage}
                          onChange={(e) => setProfileImage(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    {/* File Upload */}
                    {uploadType === 'file' && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={triggerFileInput}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Choose Image
                        </Button>
                        {selectedFile && (
                          <p className="mt-2 text-sm text-gray-600">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {statusMessage.message && (
                      <Alert className={`mt-4 ${statusMessage.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}`}>
                        <AlertDescription>{statusMessage.message}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        onClick={handleSaveImage}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            Saving...
                          </span>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
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