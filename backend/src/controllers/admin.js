const User = require('../models/User');
const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    let query = {};
    
    // Add search filter if provided
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
      
    // Get total count
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      data: users
    });
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Server Error' 
    });
  }
};

// @desc    Promote user to admin
// @route   PUT /api/admin/users/:id/promote
// @access  Private/Admin
exports.promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      msg: 'User promoted to admin'
    });
  } catch (err) {
    console.error('Error promoting user:', err);
    res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};

// @desc    Demote admin to regular user
// @route   PUT /api/admin/users/:id/demote
// @access  Private/Admin
exports.demoteUser = async (req, res) => {
  try {
    // Prevent demoting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        msg: 'You cannot demote yourself'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    // Update user role to regular user
    user.role = 'user';
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      msg: 'Admin demoted to regular user'
    });
  } catch (err) {
    console.error('Error demoting user:', err);
    res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};

// @desc    Ban a user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
exports.banUser = async (req, res) => {
  try {
    // Prevent banning yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        msg: 'You cannot ban yourself'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    // Add banned status to user model - would normally be a field in the model
    // For now we'll set an active field to false
    user.active = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      msg: 'User banned successfully'
    });
  } catch (err) {
    console.error('Error banning user:', err);
    res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};

// @desc    Get application analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalRecipes,
      totalComments,
      totalLikes,
      recentUsers,
      recentRecipes,
      popularRecipes
    ] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      Recipe.aggregate([
        { $unwind: '$comments' },
        { $count: 'total' }
      ]),
      Recipe.aggregate([
        { $unwind: '$likes' },
        { $count: 'total' }
      ]),
      // Recent users (last 30 days)
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      // Recent recipes (last 30 days)
      Recipe.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      // Most popular recipes
      Recipe.find()
        .sort({ 'likes': -1 })
        .limit(5)
        .select('title likes comments')
        .populate('user', 'name')
    ]);
    
    // Process aggregation results
    const totalCommentsCount = totalComments.length > 0 ? totalComments[0].total : 0;
    const totalLikesCount = totalLikes.length > 0 ? totalLikes[0].total : 0;

    // Generate mock data for the charts
    const userSignups = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10)
      };
    });

    const recipeUploads = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 8)
      };
    });

    const topCuisines = [
      { cuisine: 'Italian', count: 24 },
      { cuisine: 'Mexican', count: 18 },
      { cuisine: 'Chinese', count: 15 },
      { cuisine: 'Indian', count: 12 },
      { cuisine: 'American', count: 10 },
    ];
    
    res.status(200).json({
      success: true,
      totalUsers,
      totalRecipes,
      totalComments: totalCommentsCount,
      totalLikes: totalLikesCount,
      userSignups,
      recipeUploads,
      topCuisines,
      recentUsers: recentUsers,
      recentRecipes: recentRecipes,
      popularRecipes
    });
  } catch (err) {
    console.error('Error getting analytics:', err);
    res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};

// @desc    Get reported recipes
// @route   GET /api/admin/reported-recipes
// @access  Private/Admin
exports.getReportedRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    // Mock data for testing the UI
    const mockReports = [
      {
        _id: '1',
        recipe: {
          _id: '101',
          title: 'Spicy Chicken Curry',
          description: 'A delicious spicy chicken curry recipe',
          image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
          user: {
            _id: '201',
            name: 'John Doe',
            email: 'john@example.com'
          }
        },
        reportedBy: {
          _id: '202',
          name: 'Jane Smith',
          email: 'jane@example.com',
          profileImage: 'https://randomuser.me/api/portraits/women/22.jpg'
        },
        reason: 'Inappropriate content',
        additionalComments: 'This recipe contains offensive language',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        recipe: {
          _id: '102',
          title: 'Vegetable Pasta',
          description: 'A healthy vegetable pasta recipe',
          image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          user: {
            _id: '203',
            name: 'Bob Johnson',
            email: 'bob@example.com'
          }
        },
        reportedBy: {
          _id: '204',
          name: 'Alice Brown',
          email: 'alice@example.com',
          profileImage: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        reason: 'Copyright violation',
        additionalComments: 'This recipe was copied from another website',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        _id: '3',
        recipe: {
          _id: '103',
          title: 'Chocolate Cake',
          description: 'A rich chocolate cake recipe',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=1489&q=80',
          user: {
            _id: '205',
            name: 'Charlie Wilson',
            email: 'charlie@example.com'
          }
        },
        reportedBy: {
          _id: '206',
          name: 'David Miller',
          email: 'david@example.com',
          profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        reason: 'Inappropriate content',
        additionalComments: 'The description contains offensive language',
        status: 'approved',
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        _id: '4',
        recipe: {
          _id: '104',
          title: 'Beef Stew',
          description: 'A hearty beef stew recipe',
          image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          user: {
            _id: '207',
            name: 'Eve Taylor',
            email: 'eve@example.com'
          }
        },
        reportedBy: {
          _id: '208',
          name: 'Frank Anderson',
          email: 'frank@example.com',
          profileImage: 'https://randomuser.me/api/portraits/men/45.jpg'
        },
        reason: 'Misinformation',
        additionalComments: 'The cooking instructions are incorrect and could be dangerous',
        status: 'rejected',
        createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      }
    ];
    
    // Filter by search query if provided
    const filteredReports = search 
      ? mockReports.filter(report => 
          report.recipe.title.toLowerCase().includes(search.toLowerCase()) ||
          report.reportedBy.name.toLowerCase().includes(search.toLowerCase())
        )
      : mockReports;
    
    // Paginate the results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      reports: paginatedReports,
      total: filteredReports.length,
      pagination: {
        page,
        pages: Math.ceil(filteredReports.length / limit)
      }
    });
  } catch (error) {
    console.error('Error in getReportedRecipes:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Approve a reported recipe
// @route   PUT /api/admin/reported-recipes/:id/approve
// @access  Private/Admin
exports.approveReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // In a real implementation, this would:
    // 1. Find the report by ID and update its status
    // 2. Delete or update the reported recipe
    // 3. Possibly notify users
    
    // Mock implementation for the frontend
    res.status(200).json({
      success: true,
      msg: `Report ${reportId} approved successfully`
    });
  } catch (error) {
    console.error('Error in approveReport:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Reject a reported recipe
// @route   PUT /api/admin/reported-recipes/:id/reject
// @access  Private/Admin
exports.rejectReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // In a real implementation, this would:
    // 1. Find the report by ID and update its status
    // 2. Possibly notify users
    
    // Mock implementation for the frontend
    res.status(200).json({
      success: true,
      msg: `Report ${reportId} rejected successfully`
    });
  } catch (error) {
    console.error('Error in rejectReport:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error', 
      error: error.message 
    });
  }
}; 