import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  ShieldCheck, 
  User, 
  Ban, 
  Search,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function UsersTable({
  users,
  totalUsers,
  page,
  limit,
  totalPages,
  onPageChange,
  onPromote,
  onDemote,
  onBan,
  searchQuery,
  onSearchChange,
  onSearch,
  currentUser
}) {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    userId: null,
    actionType: ''
  });

  // Handle search input change
  const handleSearchInputChange = (e) => {
    onSearchChange(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  // Open confirmation dialog
  const openConfirmDialog = (userId, actionType) => {
    let title = '';
    let message = '';
    let action = null;

    const userToAct = users.find(u => u._id === userId);
    if (!userToAct) return;

    switch (actionType) {
      case 'promote':
        title = `Promote ${userToAct.name} to Admin?`;
        message = 'This will give the user full administrative privileges.';
        action = () => onPromote(userId);
        break;
      case 'demote':
        title = `Remove Admin privileges from ${userToAct.name}?`;
        message = 'This will remove administrative privileges from this user.';
        action = () => onDemote(userId);
        break;
      case 'ban':
        title = `${userToAct.active !== false ? 'Ban' : 'Unban'} ${userToAct.name}?`;
        message = userToAct.active !== false
          ? 'This will prevent the user from logging in or using the application.' 
          : 'This will reactivate the user account.';
        action = () => onBan(userId);
        break;
      default:
        return;
    }

    setConfirmDialog({
      open: true,
      title,
      message,
      action,
      userId,
      actionType
    });
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false
    });
  };

  // Execute the confirmed action
  const handleConfirmedAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    }
    closeConfirmDialog();
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    onPageChange(newPage);
  };

  // Render empty state
  if (users.length === 0) {
    return (
      <div>
        <div className="mb-4 flex">
          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <Input
              placeholder="Search users by name or email"
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="mr-2"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
        
        <div className="text-center py-12">
          <p className="text-xl font-semibold text-gray-600">
            {searchQuery ? 'No users match your search.' : 'No users found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4">
        <form onSubmit={handleSearchSubmit} className="flex">
          <Input
            placeholder="Search users by name or email"
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="mr-2"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* Users table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user._id} className="bg-white hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="bg-amber-100 text-amber-800">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link 
                        href={`/profile/${user._id}`} 
                        className="font-medium text-gray-900 hover:text-amber-600"
                      >
                        {user.name}
                      </Link>
                      {currentUser && currentUser._id === user._id && (
                        <span className="ml-1 text-xs text-gray-500">(You)</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'admin' ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5 mr-1" />
                        User
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active !== false ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {user.createdAt && format(new Date(user.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="px-4 py-3 text-right">
                  {/* Don't allow users to modify themselves */}
                  {currentUser && currentUser._id !== user._id && (
                    <div className="flex items-center justify-end space-x-2">
                      {user.role !== 'admin' ? (
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="flex items-center text-indigo-600 hover:text-indigo-700"
                          onClick={() => openConfirmDialog(user._id, 'promote')}
                        >
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          Promote
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex items-center text-amber-600 hover:text-amber-700" 
                          onClick={() => openConfirmDialog(user._id, 'demote')}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Demote
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        size="sm"
                        className={`flex items-center ${
                          user.active !== false 
                            ? 'text-red-600 hover:text-red-700' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                        onClick={() => openConfirmDialog(user._id, 'ban')}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        {user.active !== false ? 'Ban' : 'Unban'}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalUsers)} of {totalUsers} users
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageToShow;
            if (totalPages <= 5) {
              pageToShow = i + 1;
            } else {
              const startPage = Math.max(1, page - 2);
              pageToShow = startPage + i;
              if (pageToShow > totalPages) return null;
            }
            
            return (
              <Button
                key={pageToShow}
                variant={page === pageToShow ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageToShow)}
                className="w-9"
              >
                {pageToShow}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmedAction}
              variant={confirmDialog.actionType === 'ban' ? 'destructive' : 'default'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 