import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import wishlistController from '../controllers/wishlistController.js';

const router = express.Router();

// Get all wishlists (public)
router.get('/', wishlistController.getAllWishlists);

// Get single wishlist by ID (public)
router.get('/:wishlistId', wishlistController.getWishlistById);

// Create new wishlist item (protected)
router.post('/', authenticateToken, wishlistController.createWishlist);

// Update wishlist item (protected)
router.put('/:wishlistId', authenticateToken, wishlistController.updateWishlist);

// Delete wishlist item (protected)
router.delete('/:wishlistId', authenticateToken, wishlistController.deleteWishlist);

// Get wishlist comments (public)
router.get('/:wishlistId/comments', wishlistController.getWishlistComments);

// Add wishlist comment (protected)
router.post('/:wishlistId/comments', authenticateToken, wishlistController.addWishlistComment);

// Get user's wishlists (public)
router.get('/user/:userId', wishlistController.getUserWishlists);

export default router;