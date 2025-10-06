import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, robloxUsername } = req.body;
    console.log('Registration attempt for:', { username, email, robloxUsername });

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      username,
      email,
      password_hash: passwordHash,
      roblox_username: robloxUsername || undefined
    });

    const savedUser = await newUser.save();
    console.log('User saved successfully:', savedUser._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id, username },
      process.env.JWT_SECRET
    );

    // Store token in user's tokens array
    savedUser.tokens = savedUser.tokens.concat({ token });
    await savedUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        robloxUsername: savedUser.roblox_username,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET
    );

    // Store token in user's tokens array
    user.tokens = user.tokens.concat({ token });
    await user.save();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        robloxUsername: user.roblox_username,
        role: user.role,
        credibilityScore: user.credibility_score
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Verify token middleware
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists (basic check first)
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if token exists in user's tokens array (if tokens array exists)
    if (user.tokens && user.tokens.length > 0) {
      const tokenExists = user.tokens.some(tokenObj => tokenObj.token === token);
      if (!tokenExists) {
        return res.status(401).json({ error: 'Token not found in database' });
      }
    }
    // If no tokens array exists, just rely on JWT verification (backward compatibility)

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Logout user (remove token from database)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.tokens = user.tokens.filter(tokenObj => tokenObj.token !== req.token);
    await user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Logout from all devices (remove all tokens)
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.tokens = [];
    await user.save();

    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Failed to logout from all devices' });
  }
});

// Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password_hash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      robloxUsername: user.roblox_username,
      role: user.role,
      credibilityScore: user.credibility_score,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

export default router;