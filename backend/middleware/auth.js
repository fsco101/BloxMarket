import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1]?.trim();

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    let decoded;
    try {
      // Read the secret at runtime (after dotenv has loaded)
      const secret = (process.env.JWT_SECRET || 'your-secret-key').trim();
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      console.log('JWT verification error:', jwtError.name, jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      return res.status(401).json({ error: 'Token verification failed' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const tokenExists = user.tokens && user.tokens.some(t => t.token === token);
    if (!tokenExists) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (user.role === 'banned') return res.status(403).json({ error: 'Account is banned' });
    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated' });

    req.user = { ...decoded, userData: user };
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};