import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Flag, 
  Check, 
  X, 
  Eye,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function ReportedRecipes({
  reports,
  totalReports,
  page,
  limit,
  totalPages,
  onPageChange,
  onApprove,
  onReject,
  searchQuery,
  onSearchChange,
  onSearch,
}) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    reportId: null,
    actionType: '',
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

  // Handle pagination
  const handlePageChange = (newPage) => {
    onPageChange(newPage);
  };

  // Open report details dialog
  const openDetailsDialog = (report) => {
    setSelectedReport(report);
    setDetailsOpen(true);
  };

  // Close report details dialog
  const closeDetailsDialog = () => {
    setDetailsOpen(false);
  };

  // Open confirmation dialog
  const openConfirmDialog = (reportId, actionType) => {
    let title = '';
    let message = '';
    let action = null;

    const reportToAct = reports.find((r) => r._id === reportId);
    if (!reportToAct) return;

    switch (actionType) {
      case 'approve':
        title = 'Approve Report?';
        message = 'This will remove the recipe from the platform and notify the user.';
        action = () => onApprove(reportId);
        break;
      case 'reject':
        title = 'Reject Report?';
        message = 'This will dismiss the report and keep the recipe on the platform.';
        action = () => onReject(reportId);
        break;
      default:
        return;
    }

    setConfirmDialog({
      open: true,
      title,
      message,
      action,
      reportId,
      actionType,
    });
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false,
    });
  };

  // Execute the confirmed action
  const handleConfirmedAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    }
    closeConfirmDialog();
  };

  // Format report date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  // Render empty state
  if (reports.length === 0) {
    return (
      <div>
        <div className="mb-4 flex">
          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <Input
              placeholder="Search reports by recipe title or username"
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
        
        <Alert className="mt-4">
          <AlertTitle>No reports found</AlertTitle>
          <AlertDescription>
            {searchQuery ? 'No reports match your search criteria.' : 'There are no reported recipes at this time.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4">
        <form onSubmit={handleSearchSubmit} className="flex">
          <Input
            placeholder="Search reports by recipe title or username"
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

      {/* Reports grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card key={report._id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">
                      <Link 
                        href={`/recipes/${report.recipe?._id}`}
                        className="text-lg font-medium hover:text-amber-600 truncate block"
                      >
                        {report.recipe?.title || 'Deleted Recipe'}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Reported by{' '}
                      <Link 
                        href={`/profile/${report.reportedBy?._id}`}
                        className="font-medium hover:text-amber-600"
                      >
                        {report.reportedBy?.name || 'Unknown'}
                      </Link>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="mr-3">{renderStatusBadge(report.status)}</div>
                      <div className="text-xs text-gray-500">
                        Reported on {formatDate(report.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 line-clamp-2 text-gray-600 text-sm">
                  <span className="font-medium">Reason: </span>
                  {report.reason}
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => openDetailsDialog(report)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                
                <div className="flex space-x-2">
                  {report.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                        onClick={() => openConfirmDialog(report._id, 'approve')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => openConfirmDialog(report._id, 'reject')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalReports)} of {totalReports} reports
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

      {/* Report Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={closeDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center mb-3">
                  <Flag className="h-5 w-5 text-amber-600 mr-2" />
                  <h3 className="text-lg font-semibold">Report Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium block">Status:</span>
                    {renderStatusBadge(selectedReport.status)}
                  </div>
                  <div>
                    <span className="font-medium block">Reported On:</span>
                    {formatDate(selectedReport.createdAt)}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium block">Reason:</span>
                    {selectedReport.reason}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium block">Additional Comments:</span>
                    {selectedReport.additionalComments || "None provided"}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center mb-3">
                  <Eye className="h-5 w-5 text-amber-600 mr-2" />
                  <h3 className="text-lg font-semibold">Reported Recipe</h3>
                </div>
                
                {selectedReport.recipe ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-16 h-16 overflow-hidden rounded-md mr-3">
                        {selectedReport.recipe.image ? (
                          <img 
                            src={selectedReport.recipe.image} 
                            alt={selectedReport.recipe.title}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Link 
                          href={`/recipes/${selectedReport.recipe._id}`}
                          className="text-lg font-medium hover:text-amber-600"
                        >
                          {selectedReport.recipe.title}
                        </Link>
                        <div className="text-sm text-gray-500">
                          By:{' '}
                          <Link 
                            href={`/profile/${selectedReport.recipe.user?._id}`}
                            className="hover:text-amber-600"
                          >
                            {selectedReport.recipe.user?.name || 'Unknown'}
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Description:</span>
                      <p className="mt-1 text-gray-700">
                        {selectedReport.recipe.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600 italic">
                    Recipe is no longer available or has been deleted.
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center mb-3">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage 
                      src={selectedReport.reportedBy?.profileImage} 
                      alt={selectedReport.reportedBy?.name} 
                    />
                    <AvatarFallback>
                      {selectedReport.reportedBy?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">Reporter Information</h3>
                </div>
                
                {selectedReport.reportedBy ? (
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage 
                        src={selectedReport.reportedBy.profileImage} 
                        alt={selectedReport.reportedBy.name} 
                      />
                      <AvatarFallback className="bg-amber-100 text-amber-800">
                        {selectedReport.reportedBy.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link 
                        href={`/profile/${selectedReport.reportedBy._id}`}
                        className="font-medium hover:text-amber-600"
                      >
                        {selectedReport.reportedBy.name}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {selectedReport.reportedBy.email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600 italic">
                    User information is no longer available.
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDetailsDialog}>
              Close
            </Button>
            {selectedReport && selectedReport.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    closeDetailsDialog();
                    openConfirmDialog(selectedReport._id, 'approve');
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    closeDetailsDialog();
                    openConfirmDialog(selectedReport._id, 'reject');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject Report
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              variant={confirmDialog.actionType === 'approve' ? 'destructive' : 'default'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 