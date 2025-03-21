import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/auth-context';
import apiClient from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Check, Save, Lock, User, Shield, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react';

// Add this function after the imports but before the component
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

export default function SettingsPage() {
  const { user, loading, logout, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  // Form states for different settings tabs
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
    profileImage: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Image states
  const [imagePreview, setImagePreview] = useState('');
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Status messages
  const [profileStatus, setProfileStatus] = useState({ message: '', type: '' });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });
  
  // Form submission loading states
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Initialize form with user data
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        profileImage: user.profileImage || ''
      });
      
      // Set image preview if available
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    }
  }, [user, loading, router]);
  
  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    
    // Update image preview if URL changes
    if (name === 'profileImage' && uploadType === 'url') {
      setImagePreview(value);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setProfileStatus({
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
      setImagePreview(reader.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };
  
  // Toggle upload type between URL and file
  const toggleUploadType = (type) => {
    setUploadType(type);
    // Reset preview and file when changing upload type
    if (type === 'url') {
      setImagePreview(profileForm.profileImage || '');
      setSelectedFile(null);
    } else {
      setImagePreview('');
      setProfileForm(prev => ({ ...prev, profileImage: '' }));
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Clear selected image
  const clearSelectedImage = () => {
    setImagePreview('');
    setSelectedFile(null);
    setProfileForm(prev => ({ ...prev, profileImage: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Helper to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  
  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit profile updates
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setProfileSubmitting(true);
      setProfileStatus({ message: '', type: '' });
      
      // Process image upload if a file is selected
      let imageUrl = profileForm.profileImage;
      
      if (uploadType === 'file' && selectedFile) {
        setImageUploading(true);
        try {
          // Resize the image to reduce its size
          imageUrl = await resizeImage(selectedFile, 400, 400);
          
          // Check if the base64 string is still too large
          if (imageUrl.length > 1000000) { // ~1MB for base64
            setProfileStatus({
              message: 'Image is too large after processing. Please use a smaller image or an image URL instead.',
              type: 'error'
            });
            setImageUploading(false);
            setProfileSubmitting(false);
            return;
          }
        } catch (error) {
          console.error('Error processing image:', error);
          setProfileStatus({
            message: 'Failed to process image. Please try again with a different image.',
            type: 'error'
          });
          setImageUploading(false);
          setProfileSubmitting(false);
          return;
        }
        setImageUploading(false);
      }
      
      // Prepare form data - ensure bio is at least 2 chars if provided non-empty
      const formData = {
        name: profileForm.name,
        email: profileForm.email,
        profileImage: imageUrl
      };
      
      // Only include bio if it's not empty or has valid length
      if (profileForm.bio) {
        if (profileForm.bio.length >= 2) {
          formData.bio = profileForm.bio;
        } else {
          // Show error for bio length
          setProfileStatus({
            message: 'Bio must be at least 2 characters if provided.',
            type: 'error'
          });
          setProfileSubmitting(false);
          return;
        }
      }
      
      // Log form data (redacting large imageUrl)
      console.log('Sending profile update with data:', {
        ...formData,
        profileImage: formData.profileImage ? 
          (formData.profileImage.length > 100 ? 
            `${formData.profileImage.substring(0, 50)}...` : 
            formData.profileImage) : 
          null
      });
      
      // Call API to update user profile
      const response = await apiClient.users.updateUserProfile(user._id, formData);
      
      console.log('Profile update response:', response);
      
      // Update local profileForm state with the new image URL
      setProfileForm(prev => ({ 
        ...prev, 
        profileImage: imageUrl 
      }));
      
      // Update user in auth context if available
      if (typeof updateUser === 'function') {
        updateUser({ ...user, ...formData });
      }
      
      setProfileStatus({
        message: 'Profile updated successfully!',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileStatus({
        message: error.message || 'Failed to update profile. The image may be too large.',
        type: 'error'
      });
    } finally {
      setProfileSubmitting(false);
    }
  };
  
  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate password fields
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({
        message: 'New passwords do not match',
        type: 'error'
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({
        message: 'Password must be at least 8 characters',
        type: 'error'
      });
      return;
    }
    
    try {
      setPasswordSubmitting(true);
      setPasswordStatus({ message: '', type: '' });
      
      // Call API to update password
      await apiClient.users.updateUserPassword(user._id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordStatus({
        message: 'Password updated successfully!',
        type: 'success'
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordStatus({
        message: error.message || 'Failed to update password',
        type: 'error'
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      // Call API to delete account
      await apiClient.users.deleteUserAccount(user._id);
      
      // Log out the user
      logout();
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account: ' + (error.message || 'Unknown error'));
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
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and security settings
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
              
              {/* Profile Settings Tab */}
              <TabsContent value="profile">
                <form onSubmit={handleProfileSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileForm.bio || ''}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                  
                  {/* Profile Image Upload Section */}
                  <div className="space-y-4">
                    <Label>Profile Image</Label>
                    
                    <div className="flex flex-col space-y-4">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative mx-auto">
                          <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-amber-200">
                            <img 
                              src={imagePreview} 
                              alt="Profile preview" 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg';
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                            onClick={clearSelectedImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
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
                              name="profileImage"
                              value={profileForm.profileImage || ''}
                              onChange={handleProfileChange}
                              placeholder="https://example.com/your-image.jpg"
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
                      </div>
                    </div>
                  </div>
                  
                  {profileStatus.message && (
                    <Alert className={profileStatus.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{profileStatus.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    disabled={profileSubmitting || imageUploading}
                  >
                    {profileSubmitting || imageUploading ? (
                      <span className="flex items-center">
                        <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        {imageUploading ? 'Processing Image...' : 'Saving...'}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Password Settings Tab */}
              <TabsContent value="password">
                <form onSubmit={handlePasswordSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="********"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="********"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="********"
                      required
                    />
                  </div>
                  
                  {passwordStatus.message && (
                    <Alert className={passwordStatus.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordStatus.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    disabled={passwordSubmitting}
                  >
                    {passwordSubmitting ? (
                      <span className="flex items-center">
                        <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Account Settings Tab */}
              <TabsContent value="account">
                <div className="space-y-4 py-4">
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <h3 className="text-sm font-medium text-amber-800">Account Information</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <div className="flex justify-between py-1">
                        <span>Account ID:</span>
                        <span className="font-mono">{user._id}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Role:</span>
                        <span>{user.role || 'user'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Member Since:</span>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border border-red-200 bg-red-50 p-4">
                    <h3 className="text-sm font-medium text-red-800">Danger Zone</h3>
                    <p className="mt-1 text-sm text-red-700">
                      Once you delete your account, there is no going back. All of your data will be permanently removed.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="mt-4"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 