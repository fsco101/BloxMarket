import { Wishlist, WishlistComment } from '../models/Wishlist.js';
import { User } from '../models/User.js'; // Changed to named import

class WishlistController {
  /**
   * Get all wishlists with pagination and filtering
   * @route GET /api/wishlists
   * @access Public
   */
  async getAllWishlists(req, res) {
    try {
      const { page = 1, limit = 10, category, search, priority, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = {};
      
      // Category filter
      if (category && category !== 'all') {
        query.category = category;
      }
      
      // Priority filter
      if (priority && priority !== 'all') {
        query.priority = priority;
      }
      
      // Search filter
      if (search && search.trim()) {
        query.$or = [
          { item_name: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } }
        ];
      }

      // Build sort object
      const sortObject = {};
      sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Get wishlists with user data
      const wishlists = await Wishlist.find(query)
        .populate('user_id', 'username credibility_score')
        .sort(sortObject)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get comment counts for each wishlist
      const wishlistsWithCounts = await Promise.all(
        wishlists.map(async (wishlist) => {
          const commentCount = await WishlistComment.countDocuments({ 
            wishlist_id: wishlist._id 
          });
          
          return {
            wishlist_id: wishlist._id,
            item_name: wishlist.item_name,
            description: wishlist.description,
            max_price: wishlist.max_price,
            category: wishlist.category,
            priority: wishlist.priority,
            created_at: wishlist.created_at,
            updated_at: wishlist.updated_at,
            user_id: wishlist.user_id._id.toString(), // Ensure it's a string
            username: wishlist.user_id.username,
            credibility_score: wishlist.user_id.credibility_score || 0,
            watchers: wishlist.watchers || 0,
            comment_count: commentCount
          };
        })
      );

      // Get total count for pagination
      const total = await Wishlist.countDocuments(query);

      res.json({
        success: true,
        wishlists: wishlistsWithCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch wishlists',
        message: error.message 
      });
    }
  }

  /**
   * Get single wishlist by ID
   * @route GET /api/wishlists/:wishlistId
   * @access Public
   */
  async getWishlistById(req, res) {
    try {
      const { wishlistId } = req.params;

      // Validate wishlist ID
      if (!wishlistId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid wishlist ID format' 
        });
      }

      const wishlist = await Wishlist.findById(wishlistId)
        .populate('user_id', 'username credibility_score roblox_username')
        .lean();

      if (!wishlist) {
        return res.status(404).json({ 
          success: false,
          error: 'Wishlist item not found' 
        });
      }

      // Get comment count
      const commentCount = await WishlistComment.countDocuments({ 
        wishlist_id: wishlist._id 
      });

      res.json({
        success: true,
        wishlist: {
          wishlist_id: wishlist._id,
          item_name: wishlist.item_name,
          description: wishlist.description,
          max_price: wishlist.max_price,
          category: wishlist.category,
          priority: wishlist.priority,
          created_at: wishlist.created_at,
          updated_at: wishlist.updated_at,
          user_id: wishlist.user_id._id,
          username: wishlist.user_id.username,
          credibility_score: wishlist.user_id.credibility_score || 0,
          watchers: wishlist.watchers || 0,
          comment_count: commentCount
        }
      });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch wishlist',
        message: error.message 
      });
    }
  }

  /**
   * Create new wishlist item
   * @route POST /api/wishlists
   * @access Private
   */
  async createWishlist(req, res) {
    try {
      console.log('=== CREATE WISHLIST DEBUG ===');
      console.log('Full req.user object:', req.user);
      console.log('Request body:', req.body);
      console.log('Authorization header:', req.headers['authorization']);
      
      const { item_name, description, max_price, category, priority } = req.body;
      
      // Try multiple possible user ID locations
      const userId = req.user?.id || req.user?.userId || req.user?._id;
      
      console.log('Extracted userId:', userId);
      console.log('userId type:', typeof userId);

      // Validation
      if (!userId) {
        console.error('No user ID found in request. req.user:', req.user);
        return res.status(401).json({ 
          success: false,
          error: 'User not authenticated',
          debug: {
            hasReqUser: !!req.user,
            reqUserKeys: req.user ? Object.keys(req.user) : []
          }
        });
      }

      if (!item_name || !item_name.trim()) {
        return res.status(400).json({ 
          success: false,
          error: 'Item name is required' 
        });
      }

      if (!category) {
        return res.status(400).json({ 
          success: false,
          error: 'Category is required' 
        });
      }

      // Validate category
      const validCategories = ['limiteds', 'accessories', 'gear', 'event-items', 'gamepasses'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid category. Must be one of: ' + validCategories.join(', ') 
        });
      }

      // Validate priority
      const validPriorities = ['high', 'medium', 'low'];
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid priority. Must be one of: high, medium, low' 
        });
      }

      console.log('Creating wishlist with userId:', userId);

      // Create wishlist
      const wishlist = new Wishlist({
        user_id: userId,
        item_name: item_name.trim(),
        description: description?.trim() || '',
        max_price: max_price?.trim() || 'Negotiable',
        category,
        priority: priority || 'medium'
      });

      await wishlist.save();
      console.log('Wishlist saved successfully:', wishlist._id);

      // Populate user data
      const populatedWishlist = await Wishlist.findById(wishlist._id)
        .populate('user_id', 'username credibility_score')
        .lean();

      console.log('Wishlist populated successfully');

      res.status(201).json({
        success: true,
        message: 'Wishlist item created successfully',
        wishlist: {
          wishlist_id: populatedWishlist._id,
          item_name: populatedWishlist.item_name,
          description: populatedWishlist.description,
          max_price: populatedWishlist.max_price,
          category: populatedWishlist.category,
          priority: populatedWishlist.priority,
          created_at: populatedWishlist.created_at,
          updated_at: populatedWishlist.updated_at,
          user_id: populatedWishlist.user_id._id,
          username: populatedWishlist.user_id.username,
          credibility_score: populatedWishlist.user_id.credibility_score || 0,
          watchers: 0,
          comment_count: 0
        }
      });
    } catch (error) {
      console.error('Error creating wishlist:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create wishlist item',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Update wishlist item
   * @route PUT /api/wishlists/:wishlistId
   * @access Private
   */
  async updateWishlist(req, res) {
    try {
      const { wishlistId } = req.params;
      const { item_name, description, max_price, category, priority } = req.body;
      
      // Try multiple possible user ID locations (consistent with createWishlist)
      const userId = req.user?.id || req.user?.userId || req.user?._id;
      
      console.log('=== UPDATE WISHLIST DEBUG ===');
      console.log('Full req.user object:', req.user);
      console.log('Extracted userId:', userId);
      console.log('Wishlist ID:', wishlistId);

      if (!userId) {
        console.error('No user ID found in request. req.user:', req.user);
        return res.status(401).json({ 
          success: false,
          error: 'User not authenticated',
          debug: {
            hasReqUser: !!req.user,
            reqUserKeys: req.user ? Object.keys(req.user) : []
          }
        });
      }

      // Validate wishlist ID
      if (!wishlistId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid wishlist ID format' 
        });
      }

      // Find wishlist
      const wishlist = await Wishlist.findById(wishlistId);

      if (!wishlist) {
        return res.status(404).json({ 
          success: false,
          error: 'Wishlist item not found' 
        });
      }

      // Check ownership - convert both to strings for comparison
      const wishlistUserId = wishlist.user_id.toString();
      const currentUserId = userId.toString();
      
      console.log('Ownership check:', {
        wishlistUserId,
        currentUserId,
        matches: wishlistUserId === currentUserId
      });

      if (wishlistUserId !== currentUserId) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to update this wishlist item' 
        });
      }

      // Validation
      if (item_name !== undefined && !item_name.trim()) {
        return res.status(400).json({ 
          success: false,
          error: 'Item name cannot be empty' 
        });
      }

      // Validate category if provided
      if (category) {
        const validCategories = ['limiteds', 'accessories', 'gear', 'event-items', 'gamepasses'];
        if (!validCategories.includes(category)) {
          return res.status(400).json({ 
            success: false,
            error: 'Invalid category' 
          });
        }
      }

      // Validate priority if provided
      if (priority) {
        const validPriorities = ['high', 'medium', 'low'];
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({ 
            success: false,
            error: 'Invalid priority' 
          });
        }
      }

      // Check for duplicate name (excluding current wishlist)
      if (item_name && item_name.trim() !== wishlist.item_name) {
        const duplicateWishlist = await Wishlist.findOne({
          user_id: userId,
          item_name: { $regex: new RegExp(`^${item_name.trim()}$`, 'i') },
          _id: { $ne: wishlistId }
        });

        if (duplicateWishlist) {
          return res.status(400).json({ 
            success: false,
            error: 'You already have a wishlist item with this name' 
          });
        }
      }

      // Update fields
      if (item_name !== undefined) wishlist.item_name = item_name.trim();
      if (description !== undefined) wishlist.description = description.trim();
      if (max_price !== undefined) wishlist.max_price = max_price.trim() || 'Negotiable';
      if (category !== undefined) wishlist.category = category;
      if (priority !== undefined) wishlist.priority = priority;
      wishlist.updated_at = new Date();

      await wishlist.save();

      // Populate user data
      const populatedWishlist = await Wishlist.findById(wishlist._id)
        .populate('user_id', 'username credibility_score')
        .lean();

      // Get comment count
      const commentCount = await WishlistComment.countDocuments({ 
        wishlist_id: wishlist._id 
      });

      res.json({
        success: true,
        message: 'Wishlist item updated successfully',
        wishlist: {
          wishlist_id: populatedWishlist._id,
          item_name: populatedWishlist.item_name,
          description: populatedWishlist.description,
          max_price: populatedWishlist.max_price,
          category: populatedWishlist.category,
          priority: populatedWishlist.priority,
          created_at: populatedWishlist.created_at,
          updated_at: populatedWishlist.updated_at,
          user_id: populatedWishlist.user_id._id,
          username: populatedWishlist.user_id.username,
          credibility_score: populatedWishlist.user_id.credibility_score || 0,
          watchers: populatedWishlist.watchers || 0,
          comment_count: commentCount
        }
      });
    } catch (error) {
      console.error('Error updating wishlist:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update wishlist item',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Delete wishlist item
   * @route DELETE /api/wishlists/:wishlistId
   * @access Private
   */
  async deleteWishlist(req, res) {
    try {
      const { wishlistId } = req.params;
      
      // Try multiple possible user ID locations (consistent with createWishlist)
      const userId = req.user?.id || req.user?.userId || req.user?._id;
      
      console.log('=== DELETE WISHLIST DEBUG ===');
      console.log('Full req.user object:', req.user);
      console.log('Extracted userId:', userId);
      console.log('Wishlist ID:', wishlistId);

      if (!userId) {
        console.error('No user ID found in request. req.user:', req.user);
        return res.status(401).json({ 
          success: false,
          error: 'User not authenticated',
          debug: {
            hasReqUser: !!req.user,
            reqUserKeys: req.user ? Object.keys(req.user) : []
          }
        });
      }

      // Validate wishlist ID
      if (!wishlistId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid wishlist ID format' 
        });
      }

      // Find wishlist
      const wishlist = await Wishlist.findById(wishlistId);

      if (!wishlist) {
        return res.status(404).json({ 
          success: false,
          error: 'Wishlist item not found' 
        });
      }

      // Check if user owns the wishlist or is admin/moderator
      const user = await User.findById(userId);
      
      // Convert to strings for comparison
      const wishlistUserId = wishlist.user_id.toString();
      const currentUserId = userId.toString();
      
      const isOwner = wishlistUserId === currentUserId;
      const isAdmin = user && (user.role === 'admin' || user.role === 'moderator');

      console.log('Delete permission check:', {
        wishlistUserId,
        currentUserId,
        userRole: user?.role,
        isOwner,
        isAdmin,
        canDelete: isOwner || isAdmin
      });

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to delete this wishlist item' 
        });
      }

      // Delete associated comments
      const deletedComments = await WishlistComment.deleteMany({ 
        wishlist_id: wishlist._id 
      });

      // Delete wishlist
      await wishlist.deleteOne();

      res.json({ 
        success: true,
        message: 'Wishlist item deleted successfully',
        deleted: {
          wishlist_id: wishlistId,
          comments_deleted: deletedComments.deletedCount
        }
      });
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete wishlist item',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get wishlist comments
   * @route GET /api/wishlists/:wishlistId/comments
   * @access Public
   */
  async getWishlistComments(req, res) {
    try {
      const { wishlistId } = req.params;

      // Validate wishlist ID
      if (!wishlistId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid wishlist ID format' 
        });
      }

      // Check if wishlist exists
      const wishlist = await Wishlist.findById(wishlistId);
      if (!wishlist) {
        return res.status(404).json({ 
          success: false,
          error: 'Wishlist item not found' 
        });
      }

      // Get comments
      const comments = await WishlistComment.find({ wishlist_id: wishlistId })
        .populate('user_id', 'username credibility_score')
        .sort({ created_at: -1 })
        .lean();

      const formattedComments = comments.map(comment => ({
        comment_id: comment._id,
        wishlist_id: comment.wishlist_id,
        user_id: comment.user_id._id,
        content: comment.content,
        created_at: comment.created_at,
        username: comment.user_id.username,
        credibility_score: comment.user_id.credibility_score || 0
      }));

      res.json({ 
        success: true,
        comments: formattedComments,
        count: formattedComments.length
      });
    } catch (error) {
      console.error('Error fetching wishlist comments:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch comments',
        message: error.message 
      });
    }
  }

  /**
   * Add wishlist comment
   * @route POST /api/wishlists/:wishlistId/comments
   * @access Private
   */
  async addWishlistComment(req, res) {
    try {
      const { wishlistId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Validate wishlist ID
      if (!wishlistId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid wishlist ID format' 
        });
      }

      // Validation
      if (!content || !content.trim()) {
        return res.status(400).json({ 
          success: false,
          error: 'Comment content is required' 
        });
      }

      if (content.trim().length > 1000) {
        return res.status(400).json({ 
          success: false,
          error: 'Comment is too long (max 1000 characters)' 
        });
      }

      // Check if wishlist exists
      const wishlist = await Wishlist.findById(wishlistId);
      if (!wishlist) {
        return res.status(404).json({ 
          success: false,
          error: 'Wishlist item not found' 
        });
      }

      // Create comment
      const comment = new WishlistComment({
        wishlist_id: wishlistId,
        user_id: userId,
        content: content.trim()
      });

      await comment.save();

      // Populate user data
      const populatedComment = await WishlistComment.findById(comment._id)
        .populate('user_id', 'username credibility_score')
        .lean();

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment_id: populatedComment._id,
        wishlist_id: populatedComment.wishlist_id,
        user_id: populatedComment.user_id._id,
        content: populatedComment.content,
        created_at: populatedComment.created_at,
        username: populatedComment.user_id.username,
        credibility_score: populatedComment.user_id.credibility_score || 0
      });
    } catch (error) {
      console.error('Error adding wishlist comment:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to add comment',
        message: error.message 
      });
    }
  }

  /**
   * Get user's wishlists
   * @route GET /api/wishlists/user/:userId
   * @access Public
   */
  async getUserWishlists(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Validate user ID
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid user ID format' 
        });
      }

      // Get user's wishlists
      const wishlists = await Wishlist.find({ user_id: userId })
        .populate('user_id', 'username credibility_score')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get comment counts
      const wishlistsWithCounts = await Promise.all(
        wishlists.map(async (wishlist) => {
          const commentCount = await WishlistComment.countDocuments({ 
            wishlist_id: wishlist._id 
          });
          
          return {
            wishlist_id: wishlist._id,
            item_name: wishlist.item_name,
            description: wishlist.description,
            max_price: wishlist.max_price,
            category: wishlist.category,
            priority: wishlist.priority,
            created_at: wishlist.created_at,
            updated_at: wishlist.updated_at,
            user_id: wishlist.user_id._id,
            username: wishlist.user_id.username,
            credibility_score: wishlist.user_id.credibility_score || 0,
            watchers: wishlist.watchers || 0,
            comment_count: commentCount
          };
        })
      );

      const total = await Wishlist.countDocuments({ user_id: userId });

      res.json({
        success: true,
        wishlists: wishlistsWithCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching user wishlists:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch user wishlists',
        message: error.message 
      });
    }
  }
}

export default new WishlistController();