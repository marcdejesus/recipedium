import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import apiClient from '../../lib/api/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import UsersTable from '../../components/admin/UsersTable';
import Analytics from '../../components/admin/Analytics';
import ReportedRecipes from '../../components/admin/ReportedRecipes';

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reportedRecipes, setReportedRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();
  
  // Handle loading of initial data 
  useEffect(() => {
    // First check if user is authenticated and is admin
    if (!authLoading && isAuthenticated && user) {
      if (user.role !== 'admin') {
        // Redirect non-admin users
        router.push('/');
        return;
      }
      
      // Load initial data for the first tab
      loadTabData(tabValue);
    } else if (!authLoading && !isAuthenticated) {
      // Redirect unauthenticated users
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, user, tabValue]);

  // Function to load data based on active tab
  const loadTabData = async (tabValue) => {
    setLoading(true);
    setError(null);
    
    try {
      switch (tabValue) {
        case "users": // Users
          await fetchUsers();
          break;
        case "analytics": // Analytics
          await fetchAnalytics();
          break;
        case "reported": // Reported Recipes
          await fetchReportedRecipes();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error loading tab data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users with pagination
  const fetchUsers = async () => {
    try {
      const response = await apiClient.admin.getUsers({ 
        page, 
        limit,
        search: searchQuery
      });
      
      setUsers(response.users || []);
      setTotalUsers(response.total || 0);
      setTotalPages(response.pagination?.pages || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
      setUsers([]);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const data = await apiClient.admin.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics.');
      setAnalytics(null);
    }
  };

  // Fetch reported recipes
  const fetchReportedRecipes = async () => {
    try {
      const response = await apiClient.admin.getReportedRecipes({ 
        page, 
        limit,
        search: searchQuery 
      });
      
      setReportedRecipes(response.reports || []);
      setTotalUsers(response.total || 0);
      setTotalPages(response.pagination?.pages || Math.ceil((response.total || 0) / limit) || 0);
    } catch (err) {
      console.error('Error fetching reported recipes:', err);
      setError('Failed to load reported recipes.');
      setReportedRecipes([]);
      setTotalUsers(0);
      setTotalPages(0);
    }
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setTabValue(value);
    setPage(1); // Reset to first page when changing tabs
    setSearchQuery(''); // Clear search query when changing tabs
    loadTabData(value);
  };

  // Handle page change for pagination
  const handlePageChange = async (newPage) => {
    setPage(newPage);
    // Reload data for current tab with new page
    setLoading(true);
    
    try {
      if (tabValue === "users") {
        await fetchUsers();
      } else if (tabValue === "reported") {
        await fetchReportedRecipes();
      }
    } catch (err) {
      console.error('Error changing page:', err);
      setError('Failed to load data for this page.');
    } finally {
      setLoading(false);
    }
  };

  // Handle user promotion
  const handlePromoteUser = async (userId) => {
    try {
      await apiClient.admin.promoteUser(userId);
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error promoting user:', err);
      setError('Failed to promote user.');
    }
  };

  // Handle user demotion
  const handleDemoteUser = async (userId) => {
    try {
      await apiClient.admin.demoteUser(userId);
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error demoting user:', err);
      setError('Failed to demote user.');
    }
  };

  // Handle user banning
  const handleBanUser = async (userId) => {
    try {
      await apiClient.admin.banUser(userId);
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error banning user:', err);
      setError('Failed to ban user.');
    }
  };

  // Handle approve reported recipe
  const handleApproveReport = async (reportId) => {
    try {
      await apiClient.admin.approveReport(reportId);
      // Refresh reported recipes list
      fetchReportedRecipes();
    } catch (err) {
      console.error('Error approving report:', err);
      setError('Failed to approve report.');
    }
  };

  // Handle reject reported recipe
  const handleRejectReport = async (reportId) => {
    try {
      await apiClient.admin.rejectReport(reportId);
      // Refresh reported recipes list
      fetchReportedRecipes();
    } catch (err) {
      console.error('Error rejecting report:', err);
      setError('Failed to reject report.');
    }
  };

  // Handle search query change
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when search changes
  };

  // Handle search submission
  const handleSearch = () => {
    fetchUsers();
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Only render the dashboard for authenticated admins
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Recipedium</title>
        <meta name="description" content="Admin dashboard for Recipedium" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <ShieldCheck className="h-8 w-8 text-amber-500 mr-3" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <Tabs defaultValue="users" value={tabValue} onValueChange={handleTabChange}>
              <div className="border-b px-4">
                <TabsList className="bg-transparent h-14 w-full justify-start gap-4">
                  <TabsTrigger value="users">Users Management</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reported">Reported Recipes</TabsTrigger>
                </TabsList>
              </div>

              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>
              ) : (
                <CardContent className="p-0">
                  <TabsContent value="users" className="m-0">
                    <div className="p-6">
                      <UsersTable 
                        users={users}
                        totalUsers={totalUsers}
                        page={page}
                        limit={limit}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onPromote={handlePromoteUser}
                        onDemote={handleDemoteUser}
                        onBan={handleBanUser}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        onSearch={handleSearch}
                        currentUser={user}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="m-0">
                    <div className="p-6">
                      <Analytics data={analytics} />
                    </div>
                  </TabsContent>

                  <TabsContent value="reported" className="m-0">
                    <div className="p-6">
                      <ReportedRecipes 
                        reports={reportedRecipes}
                        totalReports={totalUsers}
                        page={page}
                        limit={limit}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onApprove={handleApproveReport}
                        onReject={handleRejectReport}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        onSearch={handleSearch}
                      />
                    </div>
                  </TabsContent>
                </CardContent>
              )}
            </Tabs>
          </Card>
        </div>
      </div>
    </>
  );
} 